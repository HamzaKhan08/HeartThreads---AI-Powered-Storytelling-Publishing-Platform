import React from 'react';

const tips = [
  {
    icon: '📝',
    title: 'Start with Emotion',
    description: 'Let your feelings guide your story. Begin with a moment or emotion that matters to you.'
  },
  {
    icon: '🎨',
    title: "Show, Don't Tell",
    description: 'Use vivid details and sensory language to paint a picture for your readers.'
  },
  {
    icon: '🔄',
    title: 'Revise and Reflect',
    description: 'Great writing comes from rewriting. Don\'t be afraid to edit and improve your drafts.'
  },
  {
    icon: '💡',
    title: 'Find Your Voice',
    description: 'Write in a way that feels natural to you. Your unique perspective is your strength.'
  },
  {
    icon: '🤗',
    title: 'Be Vulnerable',
    description: 'Honesty and vulnerability create powerful connections with readers.'
  },
  {
    icon: '⏳',
    title: 'Take Your Time',
    description: 'Don\'t rush the process. Let your story unfold at its own pace.'
  },
  {
    icon: '🔗',
    title: 'Connect with Others',
    description: 'Share your work, ask for feedback, and learn from fellow writers in the community.'
  },
];

const Writingtips = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pb-20">
      {/* Hero Section */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 text-center relative">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-display">Writing Tips</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Whether you're new to storytelling or a seasoned writer, these tips will help you craft heartfelt, impactful stories on HeartThreads.
          </p>
        </div>
      </section>

      {/* Tips List */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip) => (
            <div
              key={tip.title}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-primary/30 hover:border-primary transition-all duration-200"
            >
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-display">{tip.title}</h2>
              <p className="text-gray-600 text-base">{tip.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mt-16 text-center">
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Ready to share your story? Head to the <span className="text-primary font-medium">Create Story</span> page and let your words inspire others.
        </p>
      </section>
    </div>
  );
};

export default Writingtips; 