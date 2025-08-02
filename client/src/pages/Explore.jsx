import React, { useState, useEffect, useRef } from 'react';
import { getAllTags } from '../api/stories';
import Storyfeed from '../components/Storyfeed';

const Explore = ({ setSelectedStoryId }) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [allStoryTags, setAllStoryTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef(null);

  // Color and emoji palettes for tags
  const colorPalette = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'teal', 'lime', 
    'cyan', 'rose', 'amber', 'violet', 'slate', 'sky', 'emerald', 'zinc', 'neutral', 'fuchsia'
  ];
  
  const emojiPalette = [
    '🌟', '🌸', '🌻', '🌼', '🍀', '🍁', '🍂', '🌊', '🔥', '🌈', '✨', '🎉', '🎈', '🎵', '🎨', 
    '📚', '📝', '🧩', '🦋', '🌙', '🪐', '🌍', '🧠', '💡', '🧭', '🕊️', '🦄', '🧸', '🛤️', '🧬'
  ];

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getAllTags();
        setAllStoryTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setAllStoryTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Marquee effect for tags - CSS-based automatic scrolling
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Set up automatic scrolling animation
    const duration = 60; // Fixed slow duration for all components
    marquee.style.animation = `marquee-slow ${duration}s linear infinite`;
    marquee.style.animationPlayState = 'running';

    // Add manual scroll functionality while keeping CSS animation
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    // Mouse event handlers for manual scrolling
    const handleMouseDown = (e) => {
      isDragging = true;
      startX = e.pageX - marquee.offsetLeft;
      scrollLeft = marquee.scrollLeft;
      marquee.style.cursor = 'grabbing';
      // Pause CSS animation during drag
      marquee.style.animationPlayState = 'paused';
    };

    const handleMouseUp = () => {
      isDragging = false;
      marquee.style.cursor = 'grab';
      // Resume CSS animation after drag
      marquee.style.animationPlayState = 'running';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - marquee.offsetLeft;
      const walk = (x - startX) * 2;
      marquee.scrollLeft = scrollLeft - walk;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      marquee.scrollLeft += e.deltaY;
    };

    const handleTouchStart = (e) => {
      isDragging = true;
      startX = e.touches[0].pageX - marquee.offsetLeft;
      scrollLeft = marquee.scrollLeft;
      marquee.style.animationPlayState = 'paused';
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.touches[0].pageX - marquee.offsetLeft;
      const walk = (x - startX) * 2;
      marquee.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isDragging = false;
      marquee.style.animationPlayState = 'running';
    };

    // Pause on hover
    const handleMouseEnter = () => {
      marquee.style.animationPlayState = 'paused';
    };

    const handleMouseLeave = () => {
      if (!isDragging) {
        marquee.style.animationPlayState = 'running';
      }
    };

    // Add event listeners
    marquee.addEventListener('mousedown', handleMouseDown);
    marquee.addEventListener('mouseup', handleMouseUp);
    marquee.addEventListener('mousemove', handleMouseMove);
    marquee.addEventListener('wheel', handleWheel, { passive: false });
    marquee.addEventListener('touchstart', handleTouchStart, { passive: false });
    marquee.addEventListener('touchmove', handleTouchMove, { passive: false });
    marquee.addEventListener('touchend', handleTouchEnd);
    marquee.addEventListener('mouseenter', handleMouseEnter);
    marquee.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      marquee.removeEventListener('mousedown', handleMouseDown);
      marquee.removeEventListener('mouseup', handleMouseUp);
      marquee.removeEventListener('mousemove', handleMouseMove);
      marquee.removeEventListener('wheel', handleWheel);
      marquee.removeEventListener('touchstart', handleTouchStart);
      marquee.removeEventListener('touchmove', handleTouchMove);
      marquee.removeEventListener('touchend', handleTouchEnd);
      marquee.removeEventListener('mouseenter', handleMouseEnter);
      marquee.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [allStoryTags]);

  const handleTagSelect = (tag) => {
    if (tag === 'clear-all') {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const handleClearTags = () => {
    setSelectedTags([]);
  };

  const handleStoryClick = (storyId) => {
    // Open the story detail modal
    if (setSelectedStoryId) {
      setSelectedStoryId(storyId);
    }
  };

  // Create colorful tags with emojis
  const colorfulTags = allStoryTags.slice(0, 30).map((tag, index) => ({
    tag,
    color: colorPalette[index % colorPalette.length],
    emoji: emojiPalette[index % emojiPalette.length]
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Explore Stories</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover amazing stories by browsing through popular tags and themes</p>
        </div>
        
        {/* Popular Tags with Marquee */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Popular Tags</h2>
          <div className="hero-marquee">
            <div 
              ref={marqueeRef}
              className="marquee-container marquee-medium"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                cursor: 'grab'
              }}
            >
              {/* Duplicate tags for seamless marquee */}
              {[...colorfulTags, ...colorfulTags].map(({ tag, color, emoji }, index) => (
                <button
                  key={`${tag}-${index}`}
                  onClick={() => handleTagSelect(tag)}
                  className={`hero-tag tag-chip tag-motion px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 mx-2 animate-tag-scale-in tag-stagger-${(index % 10) + 1} ${
                    selectedTags.includes(tag)
                      ? `bg-${color}-500 text-white shadow-lg animate-tag-float-strong`
                      : `bg-${color}-100 text-${color}-600 hover:bg-${color}-200 hover:shadow-md animate-tag-float-subtle`
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    minWidth: 'fit-content'
                  }}
                >
                  <span className="mr-2">{emoji}</span>
                  <span className="tag-text">{tag}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Selected Tags ({selectedTags.length})</h3>
              <button
                onClick={handleClearTags}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag, index) => {
                const tagData = colorfulTags.find(t => t.tag === tag);
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 animate-tag-scale-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="mr-1">{tagData?.emoji || '🏷️'}</span>
                    {tag}
                    <button
                      onClick={() => handleTagSelect(tag)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Stories Feed */}
        <Storyfeed
          selectedTags={selectedTags}
          onTagSelect={handleTagSelect}
          onClearTags={handleClearTags}
          onStoryClick={handleStoryClick}
        />
      </div>
    </div>
  );
};

export default Explore;
