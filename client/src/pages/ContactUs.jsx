import React, { useState } from 'react';

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/users/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || 'Message sent!');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-purple-100 pt-20 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-primary/10 rounded-full p-4 mb-2 animate-fade-in">
            <i className="ri-mail-send-line text-4xl text-primary"></i>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2 text-center font-['Inter']">Contact Us</h1>
          <p className="text-gray-600 mb-4 text-center max-w-lg mx-auto">
            Have a question, suggestion, or want to reach out? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/90 rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-100 backdrop-blur-md animate-slide-in">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Subject</label>
            <input
              type="text"
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 bg-gray-50"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/60 bg-gray-50"
              required
            />
          </div>
          {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-center animate-fade-in-up transition-all duration-500">{success}</div>}
          {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-center animate-fade-in-up transition-all duration-500">{error}</div>}
          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-all shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center"><i className="ri-loader-4-line animate-spin mr-2"></i> Sending...</span>
            ) : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactUs; 