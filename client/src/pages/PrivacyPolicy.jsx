import React, { useEffect, useState } from 'react';

const PrivacyPolicy = () => {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    // Get the last modified date of this file from the document (fallback to today)
    // In a real app, this could be fetched from the server or git metadata
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 md:px-16 lg:px-48">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-16">
        <h1 className="text-4xl font-extrabold text-primary mb-6 font-['Pacifico']">Privacy Policy</h1>
        <p className="text-gray-600 mb-8 text-lg">Your privacy matters to us. Here's how we protect and use your information at HeartThreads.</p>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">1. Information We Collect</h2>
          <p className="text-gray-600">We collect only the information you provide, such as your email for account creation and any stories you choose to share. We do not sell your data or use it for advertising.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">2. How We Use Your Data</h2>
          <p className="text-gray-600">Your data is used solely to provide and improve your experience on HeartThreads. We may use anonymized data to enhance our platform and ensure community safety.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">3. Data Security</h2>
          <p className="text-gray-600">We use industry-standard security measures to protect your information. Your stories and personal data are stored securely and never shared without your consent.</p>
        </section>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">4. Your Choices</h2>
          <p className="text-gray-600">You can update or delete your account at any time. For any privacy concerns, contact us at <a href="mailto:privacy@heartthreads.com" className="text-primary underline">privacy@heartthreads.com</a>.</p>
        </section>
        <div className="text-gray-400 text-sm mt-8">Last updated: {lastUpdated}</div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;