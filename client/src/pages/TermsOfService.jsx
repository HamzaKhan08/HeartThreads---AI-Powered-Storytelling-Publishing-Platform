import React, { useEffect, useState } from 'react';

const TermsOfService = () => {
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 md:px-16 lg:px-48">
      <div className="max-w-3xl mx-auto grid gap-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-4xl font-extrabold text-primary mb-4 font-['Pacifico']">Terms of Service</h1>
          <p className="text-gray-600 mb-4 text-lg">By using HeartThreads, you agree to these terms. Please read them carefully.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">1. Using HeartThreads</h2>
          <p className="text-gray-600">You must be at least 13 years old to use our platform. You are responsible for your account and the content you share.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">2. Content Guidelines</h2>
          <p className="text-gray-600">Do not post harmful, illegal, or abusive content. We reserve the right to remove content that violates our guidelines or these terms.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">3. Account Termination</h2>
          <p className="text-gray-600">We may suspend or terminate accounts that violate our terms or community guidelines.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">4. Changes to Terms</h2>
          <p className="text-gray-600">We may update these terms from time to time. Continued use of HeartThreads means you accept the new terms.</p>
        </div>
        <div className="text-gray-400 text-sm text-center mt-4">Last updated: {lastUpdated}</div>
      </div>
    </div>
  );
};

export default TermsOfService;