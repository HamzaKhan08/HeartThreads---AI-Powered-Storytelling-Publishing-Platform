import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getCollections, createStory, getAllTags } from '../api/stories';
import { ModalEditor } from './Createstory';
import { useUser } from '../context/UserContext';

const Hero = () => {
  const { isAuthenticated, user } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyType, setStoryType] = useState('personal'); // Initialize with default value
  const [selectedCollection, setSelectedCollection] = useState('');
  const [storySelectedTags, setStorySelectedTags] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Color and emoji palettes for tags
  const colorPalette = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 'indigo', 'orange', 'teal', 'lime', 
    'cyan', 'rose', 'amber', 'violet', 'slate', 'sky', 'emerald', 'zinc', 'neutral', 'fuchsia'
  ];
  
  const emojiPalette = [
    '🌟', '🌸', '🌻', '🌼', '🍀', '🍁', '🍂', '🌊', '🔥', '🌈', '✨', '🎉', '🎈', '🎵', '🎨', 
    '📚', '📝', '🧩', '🦋', '🌙', '🪐', '🌍', '🧠', '💡', '🧭', '🕊️', '🦄', '🧸', '🛤️', '🧬'
  ];

  // Fetch collections on mount if authenticated
  React.useEffect(() => {
    const fetchCollections = async () => {
      if (isAuthenticated) {
        try {
          const collectionsData = await getCollections();
          setCollections(collectionsData);
        } catch {
          setCollections([]);
        }
      } else {
        setCollections([]);
      }
      setLoading(false);
    };
    fetchCollections();
  }, [isAuthenticated]);

  // Fetch all tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getAllTags();
        // Remove duplicates and filter out empty/null tags
        const uniqueTags = [...new Set(tags.filter(tag => tag && tag.trim() !== ''))];
        setAllTags(uniqueTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setAllTags([]);
      } finally {
        setTagsLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Debug modal state
  React.useEffect(() => {
    console.log('Modal state changed:', showModal);
  }, [showModal]);

  const handleSave = async (title, content) => {
    if (!isAuthenticated) {
      setError('Please log in to publish your story');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content');
      return;
    }
    const cleanContent = typeof content === 'string' ? content : String(content);
    setIsPublishing(true);
    setError('');
    setSuccess('');
    try {
      const storyData = {
        title: title.trim(),
        content: cleanContent.trim(),
        tags: storySelectedTags,
        storyType,
        collection: selectedCollection || null,
        isAnonymous
      };
      await createStory(storyData);
      setSuccess('Story published successfully! It will appear in the stories section shortly.');
      setStoryTitle('');
      setStoryContent('');
      setStoryType('personal');
      setSelectedCollection('');
      setStorySelectedTags([]);
      setIsAnonymous(false);
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        window.location.reload();
      }, 3000);
    } catch (error) {
      setError(error.message || 'Failed to publish story. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleStartWriting = () => {
    if (!isAuthenticated) {
      // Optionally redirect to login page
      // window.location.href = '/login';
      return;
    }
    setShowModal(true);
  };

  const handleTagToggle = (tag) => {
    setStorySelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="pt-20 pb-12 md:pt-24 md:pb-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <section
        className="pt-20 pb-12 md:pt-24 md:pb-16 relative overflow-hidden"
        style={{
          backgroundImage:
            "url('https://readdy.ai/api/search-image?query=abstract%20pastel%20background%20with%20soft%20pink%2C%20lavender%20and%20mint%20green%20colors%2C%20gentle%20flowing%20shapes%2C%20dreamy%20atmosphere%2C%20emotional%2C%20modern%2C%20digital%20art%2C%20high%20quality%2C%20soft%20lighting%2C%20gradient%2C%20minimalist%20design%2C%20with%20empty%20space%20on%20the%20left%20side%20for%20text%20and%20content%20on%20the%20right%20side&width=1920&height=600&seq=hero1&orientation=landscape')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="container mx-auto px-4 w-full">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Qurovademo'}}>
                Share Your Heart, Find Your Thread
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg" style={{fontFamily: 'Qurovademo'}}>
                Connect through anonymous stories that resonate with your
                emotional journey. Express, heal, and discover together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button
                  className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 !rounded-button font-medium whitespace-nowrap" 
                  onClick={handleStartWriting}
                  type="button"
                  style={{fontFamily: 'Qurovademo'}}
                >
                  {isAuthenticated ? 'Start Writing' : 'Login to Write'}
                </button>
                <Link
                  to="/explore"
                  style={{fontFamily: 'Qurovademo'}}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-8 py-3 !rounded-button font-medium whitespace-nowrap inline-block text-center"
                >
                  Explore Stories
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              {/* Intentionally left empty as the background image serves as the visual element */}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tags Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8" style={{fontFamily: 'Qurovademo'}}>Browse by Emotion/Tags</h2>
          
          {tagsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* First row of tags - Left to Right */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 cursor-grab active:cursor-grabbing">
                <div className="flex gap-3 pb-2 min-w-max">
                  {allTags.slice(0, Math.ceil(allTags.length / 3)).map((tag, index) => {
                    const colorIndex = index % colorPalette.length;
                    const emojiIndex = index % emojiPalette.length;
                    const color = colorPalette[colorIndex];
                    const emoji = emojiPalette[emojiIndex];
                    
                    return (
                      <button
                        key={tag}
                        className={`tag-chip bg-${color}-100 text-${color}-600 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 hover:bg-${color}-200 transition-all duration-300 hover:scale-105`}
                      >
                        <span className="mr-1">{emoji}</span> {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Second row of tags - Right to Left */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 cursor-grab active:cursor-grabbing">
                <div className="flex gap-3 pb-2 min-w-max">
                  {allTags.slice(Math.ceil(allTags.length / 3), Math.ceil(allTags.length * 2 / 3)).map((tag, index) => {
                    const colorIndex = (index + Math.ceil(allTags.length / 3)) % colorPalette.length;
                    const emojiIndex = (index + Math.ceil(allTags.length / 3)) % emojiPalette.length;
                    const color = colorPalette[colorIndex];
                    const emoji = emojiPalette[emojiIndex];
                    
                    return (
                      <button
                        key={tag}
                        className={`tag-chip bg-${color}-100 text-${color}-600 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 hover:bg-${color}-200 transition-all duration-300 hover:scale-105`}
                      >
                        <span className="mr-1">{emoji}</span> {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Third row of tags - Left to Right */}
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 cursor-grab active:cursor-grabbing">
                <div className="flex gap-3 pb-2 min-w-max">
                  {allTags.slice(Math.ceil(allTags.length * 2 / 3)).map((tag, index) => {
                    const colorIndex = (index + Math.ceil(allTags.length * 2 / 3)) % colorPalette.length;
                    const emojiIndex = (index + Math.ceil(allTags.length * 2 / 3)) % emojiPalette.length;
                    const color = colorPalette[colorIndex];
                    const emoji = emojiPalette[emojiIndex];
                    
                    return (
                      <button
                        key={tag}
                        className={`tag-chip bg-${color}-100 text-${color}-600 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap flex-shrink-0 hover:bg-${color}-200 transition-all duration-300 hover:scale-105`}
                      >
                        <span className="mr-1">{emoji}</span> {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {showModal && (
        <ModalEditor
          storyTitle={storyTitle}
          setStoryTitle={setStoryTitle}
          storyContent={storyContent}
          setStoryContent={setStoryContent}
          storyType={storyType}
          setStoryType={setStoryType}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
          selectedTags={storySelectedTags}
          setSelectedTags={setStorySelectedTags}
          availableTags={['Love', 'Loss', 'Hope', 'Fear', 'Joy', 'Sadness', 'Anger', 'Gratitude', 'Anxiety', 'Peace']}
          collections={collections}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          isPublishing={isPublishing}
          error={error}
          success={success}
          onTagToggle={handleTagToggle}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      )}
    </>
  );
};

export default Hero;