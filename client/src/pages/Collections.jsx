import React, { useState, useRef, useEffect } from 'react';
import Storybookcollections from '../components/Storybookcollections';
import { getAllTags } from '../api/stories';
import Storycollection from '../components/Storycollection';

const Collections = ({ setSelectedStoryId }) => {
  const [collectionsToShow, setCollectionsToShow] = useState(10);
  const scrollContainerRef = useRef(null);
  const [allStoryTags, setAllStoryTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const marqueeRef = useRef(null);

  // Filtering state for both collections
  const [filter, setFilter] = useState({ 
    author: '', 
    tag: [], 
    title: '',
    type: 'all' // 'all', 'story', 'storybook'
  });

  // Color and emoji palettes for tags
  const colorPalette = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'teal', 'lime', 
    'cyan', 'rose', 'amber', 'violet', 'slate', 'sky', 'emerald', 'zinc', 'neutral', 'fuchsia'
  ];
  
  const emojiPalette = [
    '🌟', '🌸', '🌻', '🌼', '🍀', '🍁', '🍂', '🌊', '🔥', '🌈', '✨', '🎉', '🎈', '🎵', '🎨', 
    '📚', '📝', '🧩', '🦋', '🌙', '🪐', '🌍', '🧠', '💡', '🧭', '🕊️', '🦄', '🧸', '🛤️', '🧬'
  ];

  const handleLoadMore = () => {
    setCollectionsToShow(prev => prev + 10);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleClearFilters = () => {
    setFilter({ author: '', tag: [], title: '', type: 'all' });
  };

  const handleTypeFilter = (type) => {
    setFilter(prev => ({ ...prev, type }));
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // This will trigger re-render of filtered components
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filter.title, filter.author, filter.tag]);

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

  // Create colorful tags with emojis
  const colorfulTags = allStoryTags.slice(0, 25).map((tag, index) => ({
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
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Story Collections</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover curated collections of stories and storybooks organized by themes</p>
        </div>

        {/* Dynamic Filtering System */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-800">Filter Collections</h2>
              {(filter.title || filter.author || filter.tag.length > 0 || filter.type !== 'all') && (
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
            
            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Type:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                {[
                  { key: 'all', label: 'All', icon: '📚' },
                  { key: 'story', label: 'Stories', icon: '📖' },
                  { key: 'storybook', label: 'Storybooks', icon: '📚' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => handleTypeFilter(key)}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      filter.type === key
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <span className="mr-1">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search and Tag Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Collections</label>
              <input
                type="text"
                placeholder="Search by title or author..."
                value={filter.title}
                onChange={(e) => setFilter(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Filter</label>
              <input
                type="text"
                placeholder="Filter by author..."
                value={filter.author}
                onChange={(e) => setFilter(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filter.title || filter.author || filter.tag.length > 0 || filter.type !== 'all') && (
            <div className="flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors duration-200"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Popular Tags with Marquee */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Browse by Tags</h2>
          <div className="hero-marquee">
            <div 
              ref={marqueeRef}
              className="marquee-container marquee-fast"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                cursor: 'grab'
              }}
            >
              {/* Duplicate tags for seamless marquee */}
              {[...colorfulTags, ...colorfulTags].map(({ tag, color, emoji }, index) => (
                <button
                  key={`${tag}-${index}`}
                  onClick={() => handleFilterChange({ ...filter, tag: [tag] })}
                  className={`hero-tag tag-chip tag-motion px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 mx-2 animate-tag-scale-in tag-stagger-${(index % 10) + 1} ${
                    filter.tag.includes(tag)
                      ? `bg-${color}-500 text-white shadow-lg animate-tag-float-strong`
                      : `bg-${color}-100 text-${color}-600 hover:bg-${color}-200 hover:shadow-md animate-tag-float-medium`
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

        {/* Selected Filters Display */}
        {(filter.tag.length > 0 || filter.title || filter.author) && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Filters</h3>
            <div className="flex flex-wrap gap-2">
              {filter.tag.map((tag, index) => {
                const tagData = colorfulTags.find(t => t.tag === tag);
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700 animate-tag-scale-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="mr-1">{tagData?.emoji || '🏷️'}</span>
                    {tag}
                    <button
                      onClick={() => handleFilterChange({ ...filter, tag: filter.tag.filter(t => t !== tag) })}
                      className="ml-2 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              {filter.title && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  📝 "{filter.title}"
                  <button
                    onClick={() => setFilter(prev => ({ ...prev, title: '' }))}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              )}
              {filter.author && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  👤 {filter.author}
                  <button
                    onClick={() => setFilter(prev => ({ ...prev, author: '' }))}
                    className="ml-2 text-green-500 hover:text-green-700"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Conditional Rendering based on filter type */}
        {(filter.type === 'all' || filter.type === 'story') && (
          <Storycollection allTags={allStoryTags} filter={filter} setSelectedStoryId={setSelectedStoryId} />
        )}
        
        {(filter.type === 'all' || filter.type === 'storybook') && (
          <Storybookcollections
            filter={filter}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            collectionsToShow={collectionsToShow}
            onLoadMore={handleLoadMore}
            scrollContainerRef={scrollContainerRef}
          />
        )}
      </div>
    </div>
  );
};

export default Collections;
