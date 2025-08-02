import React, { useState, useEffect } from 'react'
import { ModalEditor } from './Createstory'
import { getAllTags, getCollections } from '../api/stories'
import { useUser } from '../context/UserContext'

const Floatingcreatebutton = () => {
  const { isAuthenticated, user } = useUser();
  const [showModal, setShowModal] = useState(false)
  const [storyTitle, setStoryTitle] = useState('')
  const [storyContent, setStoryContent] = useState('')
  const [storyType, setStoryType] = useState('personal') // Initialize with default value
  const [selectedCollection, setSelectedCollection] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [availableTags, setAvailableTags] = useState([])
  const [collections, setCollections] = useState([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch tags and collections on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch tags (they're public)
        const tags = await getAllTags();
        setAvailableTags(tags);
        
        // Only fetch collections if user is authenticated
        if (isAuthenticated) {
          try {
            const collectionsData = await getCollections();
            setCollections(collectionsData);
          } catch (collectionsError) {
            console.warn('Failed to fetch collections:', collectionsError);
            // Don't set error for collections, just use empty array
            setCollections([]);
          }
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load tags');
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleSave = async (title, content) => {
    if (!isAuthenticated) {
      setError('Please log in to publish your story');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content');
      return;
    }

    // Ensure content is clean text (not HTML)
    const cleanContent = typeof content === 'string' ? content : String(content);

    setIsPublishing(true);
    setError('');
    setSuccess('');

    try {
      const storyData = {
        title: title.trim(),
        content: cleanContent.trim(),
        tags: selectedTags,
        storyType,
        collection: selectedCollection || null,
        isAnonymous
      };

      console.log('Publishing story:', storyData);
      const { createStory } = await import('../api/stories');
      const result = await createStory(storyData);
      console.log('Story published successfully:', result);
      
      setSuccess('Story published successfully! It will appear in the stories section shortly.');
      setStoryTitle('');
      setStoryContent('');
      setStoryType('personal'); // Reset to default value
      setSelectedCollection('');
      setSelectedTags([]);
      setIsAnonymous(false);
      
      // Close modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        // Optionally refresh the page or trigger a story list refresh
        window.location.reload();
      }, 3000);
      
    } catch (error) {
      console.error('Error publishing story:', error);
      setError(error.message || 'Failed to publish story. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      setError('Please log in to write and publish stories');
      // Optionally redirect to login page
      // window.location.href = '/login';
      return;
    }
    setShowModal(true);
  };

  return (
    <>
    {/* Floating Create Button */}
    <div className="fixed bottom-6 right-6 z-40">
      <button
        className="create-button w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-opacity-90 transition-colors duration-200"
        onClick={handleCreateClick}
        title={isAuthenticated ? "Create a new story" : "Login to create stories"}
      >
        <i className="ri-quill-pen-line text-xl"></i>
      </button>
      {!isAuthenticated && (
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs text-gray-600 whitespace-nowrap">
          Login to write stories
        </div>
      )}
    </div>
    {/* Enhanced Story Writing Modal */}
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
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
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
  )
}

export default Floatingcreatebutton