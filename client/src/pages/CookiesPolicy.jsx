import React, { useEffect, useState } from 'react';

const CookiesPolicy = () => {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const date = new Date(document.lastModified);
    setLastUpdated(date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white py-12 px-4 md:px-16 lg:px-48 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-10 flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl">
        <div className="flex-shrink-0 flex flex-col items-center md:items-start">
          <div className="bg-primary/10 rounded-full p-6 mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#fbbf24"/><path d="M8 12a1 1 0 100-2 1 1 0 000 2zm4 4a1 1 0 100-2 1 1 0 000 2zm4-4a1 1 0 100-2 1 1 0 000 2z" fill="#fff"/></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-primary font-['Pacifico']">Cookie Policy</h1>
        </div>
        <div>
          <p className="text-gray-600 mb-6 text-lg">We use cookies to enhance your experience on HeartThreads. Here's what you need to know:</p>
          <section className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">What Are Cookies?</h2>
            <p className="text-gray-600">Cookies are small text files stored on your device to help us remember your preferences and improve your experience.</p>
          </section>
          <section className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">How We Use Cookies</h2>
            <p className="text-gray-600">We use cookies for authentication, keeping you logged in, and understanding how you use HeartThreads. We do not use cookies for advertising or tracking you across other sites.</p>
          </section>
          <section className="mb-4">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Managing Cookies</h2>
            <p className="text-gray-600">You can manage or disable cookies in your browser settings. Some features may not work properly if cookies are disabled.</p>
          </section>
          <div className="text-gray-400 text-sm mt-6">Last updated: {lastUpdated}</div>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy; 