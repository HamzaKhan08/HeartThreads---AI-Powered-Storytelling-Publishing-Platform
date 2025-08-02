import React from 'react';

const hotlines = [
  {
    icon: '📞',
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    description: '24/7 free and confidential support for people in distress.'
  },
  {
    icon: '💬',
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Text for free, 24/7 crisis counseling.'
  },
  {
    icon: '🌈',
    name: 'The Trevor Project (LGBTQ+ Youth)',
    phone: '1-866-488-7386',
    description: 'Crisis intervention and support for LGBTQ+ youth.'
  },
  {
    icon: '👩‍⚕️',
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-HELP (4357)',
    description: 'Free, confidential help for mental health and substance use.'
  },
  {
    icon: '🧑‍⚖️',
    name: 'National Domestic Violence Hotline',
    phone: '1-800-799-7233',
    description: 'Support, resources, and advocacy for those experiencing domestic violence.'
  },
  {
    icon: '👨‍👩‍👧‍👦',
    name: 'Childhelp National Child Abuse Hotline',
    phone: '1-800-4-A-CHILD (1-800-422-4453)',
    description: 'Support and resources for child abuse victims and concerned adults.'
  },
];

const Supporthotlines = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-orange-50 to-white pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 text-center relative">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <img
            src="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80"
            alt="Support Hotline Illustration"
            className="w-32 h-32 rounded-full shadow-lg mb-6 border-4 border-rose-100 object-cover"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-rose-900 mb-4 font-display">Support Hotlines</h1>
          <p className="text-lg md:text-xl text-rose-700 max-w-2xl mx-auto mb-6">
            If you or someone you know needs help, these hotlines are available 24/7. Don't hesitate to reach out.
          </p>
        </div>
      </section>

      {/* Hotlines List */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotlines.map((h) => (
            <div
              key={h.name}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-rose-200 hover:border-rose-400 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{h.icon}</div>
              <h2 className="text-lg font-semibold text-rose-900 mb-2 font-display">{h.name}</h2>
              <p className="text-rose-700 text-base mb-2">{h.description}</p>
              <span className="text-rose-600 text-lg font-bold mt-2">{h.phone}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mt-16 text-center">
        <p className="text-rose-500 text-sm max-w-xl mx-auto">
          If you are in immediate danger, call 911 or your local emergency number.
        </p>
      </section>
    </div>
  );
};

export default Supporthotlines; 