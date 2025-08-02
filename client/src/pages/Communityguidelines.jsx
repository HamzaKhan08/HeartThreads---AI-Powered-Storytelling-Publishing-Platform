import React from 'react';

const guidelines = [
  {
    icon: '🤝',
    title: 'Be Respectful',
    description: 'Treat everyone with kindness and respect. Personal attacks, hate speech, or discrimination will not be tolerated.'
  },
  {
    icon: '💬',
    title: 'Constructive Feedback',
    description: 'Share feedback thoughtfully. Critique ideas, not people, and help others grow with encouragement.'
  },
  {
    icon: '🛡️',
    title: 'Safe Space',
    description: 'This is a safe space for sharing stories. Do not post content that is abusive, explicit, or violates privacy.'
  },
  {
    icon: '🔒',
    title: 'Protect Privacy',
    description: 'Respect the privacy of others. Do not share personal information or stories that are not yours to share.'
  },
  {
    icon: '🌈',
    title: 'Celebrate Diversity',
    description: 'Embrace and celebrate the diversity of our community. All voices and backgrounds are welcome.'
  },
  {
    icon: '🚫',
    title: 'No Spam',
    description: 'Avoid spamming, self-promotion, or irrelevant links. Keep the focus on meaningful stories and discussion.'
  },
  {
    icon: '📢',
    title: 'Report Issues',
    description: 'If you see something that violates these guidelines, please report it to our moderators.'
  },
];

const Communityguidelines = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 text-center relative">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-display">Community Guidelines</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            HeartThreads is a place for heartfelt stories, connection, and growth. To keep our community safe and welcoming, please follow these guidelines.
          </p>
        </div>
      </section>

      {/* Guidelines List */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {guidelines.map((g, idx) => (
            <div
              key={g.title}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-primary/30 hover:border-primary transition-all duration-200"
            >
              <div className="text-4xl mb-4">{g.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-display">{g.title}</h2>
              <p className="text-gray-600 text-base">{g.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mt-16 text-center">
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Thank you for helping us make HeartThreads a positive, supportive, and inspiring space for everyone. If you have questions or need help, contact our team anytime.
        </p>
      </section>
    </div>
  );
};

export default Communityguidelines; 