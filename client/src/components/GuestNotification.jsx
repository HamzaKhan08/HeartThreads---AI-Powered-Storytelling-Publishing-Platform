import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GuestNotification = ({ isVisible, onClose }) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const messages = [
    {
      title: "👋 Welcome to HeartThreads!",
      content: "Discover amazing stories from our community. Sign up to unlock unlimited access to 1000+ stories!",
      action: "Sign Up Now",
      link: "/signup"
    },
    {
      title: "📚 Limited Preview",
      content: "You're currently viewing a preview. Create an account to access all stories, create collections, and more!",
      action: "Get Started",
      link: "/signup"
    },
    {
      title: "💝 Join Our Community",
      content: "Connect with fellow storytellers, share your own stories, and be part of our growing community!",
      action: "Join Now",
      link: "/signup"
    },
    {
      title: "🔓 Unlock Full Access",
      content: "Sign up to like stories, create your own, and access exclusive features!",
      action: "Unlock Access",
      link: "/signup"
    }
  ];

  useEffect(() => {
    if (isVisible && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
      }, 40000); // Change message every 40 seconds

      return () => clearInterval(interval);
    }
  }, [isVisible, isDismissed, messages.length]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose();
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  const message = messages[currentMessage];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm animate-fade-in">
      <div className="guest-notification rounded-lg shadow-lg border border-primary/20 p-4 animate-slide-in">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Message indicator */}
        <div className="flex justify-center mb-3">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full mx-1 transition-all duration-300 ${
                index === currentMessage ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {message.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {message.content}
          </p>
          
          <div className="flex gap-2">
            <Link
              to={message.link}
              className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium animate-pulse-glow"
            >
              {message.action}
            </Link>
            <Link
              to="/login"
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Log In
            </Link>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 bg-gray-200 rounded-full h-1">
          <div
            className="bg-primary h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentMessage + 1) / messages.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default GuestNotification; 