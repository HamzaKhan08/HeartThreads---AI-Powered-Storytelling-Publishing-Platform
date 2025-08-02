import React from 'react';

const resources = [
  {
    icon: '🧠',
    name: 'National Alliance on Mental Illness (NAMI)',
    url: 'https://nami.org',
    description: 'Support, education, and advocacy for individuals and families affected by mental illness.'
  },
  {
    icon: '📞',
    name: '988 Suicide & Crisis Lifeline',
    url: 'https://988lifeline.org',
    description: '24/7 free and confidential support for people in distress.'
  },
  {
    icon: '💬',
    name: 'Crisis Text Line',
    url: 'https://www.crisistextline.org',
    description: 'Text HOME to 741741 for free, 24/7 crisis counseling via text.'
  },
  {
    icon: '🌱',
    name: 'Mental Health America',
    url: 'https://mhanational.org',
    description: 'Resources, screening tools, and support for mental wellness.'
  },
  {
    icon: '🧘',
    name: 'Calm Clinic',
    url: 'https://www.calmclinic.com',
    description: 'Information and tips for managing anxiety and stress.'
  },
  {
    icon: '🌈',
    name: 'The Trevor Project',
    url: 'https://www.thetrevorproject.org',
    description: 'Crisis intervention and support for LGBTQ+ youth.'
  },
];

const Mentalhealthresources = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-green-50 to-white pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 text-center relative">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <img
            src="https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=400&q=80"
            alt="Mental Health Illustration"
            className="w-32 h-32 rounded-full shadow-lg mb-6 border-4 border-green-100 object-cover"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-grey-900 mb-4 font-display">Mental Health Resources</h1>
          <p className="text-lg md:text-xl text-grey-500 max-w-2xl mx-auto mb-6">
            You are not alone. Here are trusted resources for support, information, and crisis help.
          </p>
        </div>
      </section>

      {/* Resources List */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((r) => (
            <a
              key={r.name}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-green-200 hover:border-green-400 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{r.icon}</div>
              <h2 className="text-lg font-semibold text-grey-900 mb-2 font-display">{r.name}</h2>
              <p className="text-grey-500 text-base mb-2">{r.description}</p>
              <span className="text-green-600 text-xs font-medium mt-2 underline">Visit Resource</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mt-16 text-center">
        <p className="text-grey-500 text-sm max-w-xl mx-auto">
          If you or someone you know is in crisis, reach out to a professional or use the hotlines below. You matter.
        </p>
      </section>
    </div>
  );
};

export default Mentalhealthresources; 