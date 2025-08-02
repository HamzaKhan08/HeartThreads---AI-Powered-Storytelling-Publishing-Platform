import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: '🤖',
    title: 'Smart Suggestions',
    description: 'Get creative prompts and ideas tailored to your topic, emotion, and style.'
  },
  {
    icon: '🪄',
    title: 'Instant Drafts',
    description: 'Generate a first draft in seconds—perfect for overcoming writer’s block.'
  },
  {
    icon: '🔍',
    title: 'Personalized Feedback',
    description: 'Receive tips to improve clarity, emotion, and impact in your story.'
  },
  {
    icon: '🎭',
    title: 'Multiple Styles',
    description: 'Choose from poetic, narrative, conversational, and more writing styles.'
  },
  {
    icon: '🌈',
    title: 'Emotion Detection',
    description: 'Let AI help you express the right tone—joyful, reflective, hopeful, and beyond.'
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your stories and prompts are never shared. You’re always in control.'
  },
];

const AIassistantguide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 pb-20">
      {/* Hero Section with AI Image */}
      <section className="pt-20 pb-10 md:pt-28 md:pb-16 text-center relative">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-10">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
              alt="AI Assistant Illustration"
              className="w-full max-w-xs mx-auto rounded-3xl shadow-2xl border-4 border-primary/20"
              style={{ background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)' }}
            />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 font-display">AI Writing Assistant Guide</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto mb-6">
              Discover how HeartThreads’ AI Assistant can help you craft, edit, and enhance your stories with ease. Let technology spark your creativity!
            </p>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center border-t-4 border-primary/30 hover:border-primary transition-all duration-200"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2 font-display">{f.title}</h2>
              <p className="text-gray-600 text-base">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="mt-16 text-center">
        <p className="text-gray-500 text-sm max-w-xl mx-auto">
          Have questions about using the AI Assistant? Visit our <Link to="/contact-us"><span className="text-primary font-medium">Help Center</span></Link> or reach out to our team for support.
        </p>
      </section>
    </div>
  );
};

export default AIassistantguide;
