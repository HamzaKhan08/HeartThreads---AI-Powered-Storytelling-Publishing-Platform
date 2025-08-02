import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import AIWritingAssistantModal from './AIWritingAssistantModal';

const toolbarButtons = [
  { cmd: 'bold', icon: <b>B</b>, title: 'Bold' },
  { cmd: 'italic', icon: <i>I</i>, title: 'Italic' },
  { cmd: 'underline', icon: <u>U</u>, title: 'Underline' },
  { cmd: 'strikeThrough', icon: <span style={{textDecoration: 'line-through'}}>S</span>, title: 'Strikethrough' },
  { cmd: 'insertUnorderedList', icon: <span>&bull; List</span>, title: 'Bulleted List' },
  { cmd: 'insertOrderedList', icon: <span>1. List</span>, title: 'Numbered List' },
  { cmd: 'formatBlock', arg: 'H1', icon: <span style={{fontWeight:'bold'}}>H1</span>, title: 'Heading 1', value: 'H1' },
  { cmd: 'formatBlock', arg: 'H2', icon: <span style={{fontWeight:'bold'}}>H2</span>, title: 'Heading 2', value: 'H2' },
  { cmd: 'formatBlock', arg: 'P', icon: <span>P</span>, title: 'Paragraph', value: 'P' },
  { cmd: 'foreColor', arg: '#e11d48', icon: <span style={{color:'#e11d48'}}>A</span>, title: 'Text Color' },
  { cmd: 'backColor', arg: '#fef08a', icon: <span style={{background:'#fef08a'}}>A</span>, title: 'Highlight' },
  { cmd: 'createLink', icon: <span>&#128279;</span>, title: 'Insert Link' },
  { cmd: 'removeFormat', icon: <span>&#10006;</span>, title: 'Clear Formatting' },
];

const storyTypes = [
  'Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'Mystery', 
  'Romance', 'Sci-Fi', 'Fantasy', 'Horror', 'Adventure', 'Biography',
  'Thriller', 'Comedy', 'Tragedy', 'Historical Fiction', 'Contemporary',
  'Young Adult', 'Children', 'Literary Fiction', 'Commercial Fiction',
  'Paranormal', 'Supernatural', 'Urban Fantasy', 'Epic Fantasy',
  'Space Opera', 'Cyberpunk', 'Steampunk', 'Dystopian', 'Utopian',
  'Crime', 'Detective', 'Legal Thriller', 'Medical Thriller',
  'Psychological Thriller', 'Political Thriller', 'Military Fiction',
  'Western', 'War', 'Post-Apocalyptic', 'Alternate History',
  'Magical Realism', 'Fairy Tale', 'Fable', 'Legend', 'Mythology',
  'Folklore', 'Gothic', 'Dark Fantasy', 'Light Fantasy', 'Sword & Sorcery',
  'High Fantasy', 'Low Fantasy', 'Contemporary Fantasy', 'Historical Fantasy',
  'Science Fantasy', 'Hard Science Fiction', 'Soft Science Fiction',
  'Time Travel', 'Parallel Worlds', 'Alien Contact', 'First Contact',
  'Space Exploration', 'Colonization', 'Artificial Intelligence',
  'Virtual Reality', 'Genetic Engineering', 'Climate Fiction',
  'Eco-Fiction', 'Social Commentary', 'Satire', 'Parody', 'Absurdist',
  'Experimental', 'Stream of Consciousness', 'Metafiction', 'Pastiche',
  'Slice of Life', 'Coming of Age', 'Family Drama', 'Domestic Fiction',
  'Women\'s Fiction', 'Men\'s Fiction', 'LGBTQ+ Fiction', 'Multicultural',
  'Immigration', 'Refugee', 'Cultural Identity', 'Social Justice',
  'Activism', 'Philosophical', 'Existential', 'Spiritual', 'Religious',
  'Inspirational', 'Self-Help', 'Memoir', 'Autobiography', 'Travel',
  'Food & Cooking', 'Sports', 'Music', 'Art', 'Fashion', 'Business',
  'Technology', 'Education', 'Health & Wellness', 'Mental Health',
  'Addiction & Recovery', 'Grief & Loss', 'Love & Relationships',
  'Friendship', 'Family', 'Parenting', 'Marriage', 'Divorce',
  'Workplace', 'Career', 'Academic', 'Research', 'Journalism',
  'True Crime', 'Documentary', 'Biography', 'Autobiography', 'Memoir',
  'Diary', 'Journal', 'Letter', 'Essay', 'Article', 'Review',
  'Criticism', 'Analysis', 'Commentary', 'Opinion', 'Editorial',
  'Short Story', 'Novella', 'Novel', 'Series', 'Anthology',
  'Collection', 'Compilation', 'Other'
];

const Createstory = (props) => {
  const { isAuthenticated: userIsAuthenticated, user: currentUser } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  
  // Local state for story creation (fallback if props not provided)
  const [localStoryTitle, setLocalStoryTitle] = useState('');
  const [localStoryContent, setLocalStoryContent] = useState('');
  const [localStoryType, setLocalStoryType] = useState('personal');
  const [localSelectedCollection, setLocalSelectedCollection] = useState('');
  const [localSelectedTags, setLocalSelectedTags] = useState([]);
  const [localAvailableTags] = useState(['Love', 'Loss', 'Hope', 'Fear', 'Joy', 'Sadness', 'Anger', 'Gratitude', 'Anxiety', 'Peace']);
  const [localCollections, setLocalCollections] = useState([]);
  const [localIsAnonymous, setLocalIsAnonymous] = useState(false);
  const [localIsPublishing, setLocalIsPublishing] = useState(false);
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  // Use props if provided, otherwise use local state
  const storyTitle = props.storyTitle !== undefined ? props.storyTitle : localStoryTitle;
  const setStoryTitle = props.setStoryTitle || setLocalStoryTitle;
  const storyContent = props.storyContent !== undefined ? props.storyContent : localStoryContent;
  const setStoryContent = props.setStoryContent || setLocalStoryContent;
  const storyType = props.storyType || localStoryType;
  const setStoryType = props.setStoryType || setLocalStoryType;
  const selectedCollection = props.selectedCollection || localSelectedCollection;
  const setSelectedCollection = props.setSelectedCollection || setLocalSelectedCollection;
  const selectedTags = props.selectedTags || localSelectedTags;
  const setSelectedTags = props.setSelectedTags || setLocalSelectedTags;
  const availableTags = props.availableTags || localAvailableTags;
  const collections = props.collections || localCollections;
  const isAnonymous = props.isAnonymous !== undefined ? props.isAnonymous : localIsAnonymous;
  const setIsAnonymous = props.setIsAnonymous || setLocalIsAnonymous;
  const isPublishing = props.isPublishing !== undefined ? props.isPublishing : localIsPublishing;
  const error = props.error || localError;
  const success = props.success || localSuccess;

  // Fetch collections if not provided via props
  React.useEffect(() => {
    const fetchCollections = async () => {
      if (userIsAuthenticated && !props.collections) {
        try {
          const collectionsData = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/collections`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (collectionsData.ok) {
            const collections = await collectionsData.json();
            setLocalCollections(collections);
          }
        } catch (error) {
          console.error('Error fetching collections:', error);
        }
      }
    };
    fetchCollections();
  }, [userIsAuthenticated, props.collections]);

  const handleSave = async (title, content) => {
    if (!userIsAuthenticated) return;
    if (!title.trim() || !content.trim()) return;
    if (!storyType) return;
    
    // If props.onSave is provided, use it, otherwise handle locally
    if (props.onSave) {
      props.onSave(title, content);
      return;
    }

    // Local save handling
    setLocalIsPublishing(true);
    setLocalError('');
    setLocalSuccess('');
    
    try {
      const storyData = {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        storyType,
        collection: selectedCollection || null,
        isAnonymous
      };
      
      const { createStory } = await import('../api/stories');
      await createStory(storyData);
      setShowModal(false);
      setLocalSuccess('Story published successfully!');
      
      // Reset form
      setLocalStoryTitle('');
      setLocalStoryContent('');
      setLocalStoryType('personal');
      setLocalSelectedCollection('');
      setLocalSelectedTags([]);
      setLocalIsAnonymous(false);
      
      // Reload page after a delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setLocalError(error.message || 'Failed to publish story. Please try again.');
    } finally {
      setLocalIsPublishing(false);
    }
  };

  const handleTagToggle = (tag) => {
    const setTags = setSelectedTags;
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleStartWriting = () => {
    if (!userIsAuthenticated) {
      // Optionally redirect to login page
      // window.location.href = '/login';
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      {/* Create Story CTA */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{fontFamily: 'Qurovademo'}}>Ready to Share Your Story?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8" style={{fontFamily: 'Qurovademo'}}>
            Every emotion deserves to be expressed. Your story could be the thread
            that connects someone to hope, healing, or understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 !rounded-button font-medium whitespace-nowrap"
              onClick={handleStartWriting}
              style={{fontFamily: 'Qurovademo'}}
            >
              {userIsAuthenticated ? 'Start Writing' : 'Login to Write'}
            </button>
            <div className="relative inline-block">
              <button
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-8 py-3 !rounded-button font-medium whitespace-nowrap relative"
                onClick={() => setShowAIModal(true)}
                style={{fontFamily: 'Qurovademo'}}
              >
                AI Story Writer
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-gray-900 font-bold px-2 py-0.5 rounded-full shadow-md border border-yellow-300 animate-pulse" style={{zIndex:2}}>
                  Try Now
                </span>
              </button>
            </div>
          </div>
          {!userIsAuthenticated && (
            <p className="text-sm text-gray-500 mt-4">
              Sign up or log in to publish your stories and connect with other storytellers
            </p>
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
          isAuthenticated={userIsAuthenticated}
          user={currentUser}
        />
      )}
      {showAIModal && (
        <AIWritingAssistantModal open={showAIModal} onClose={() => setShowAIModal(false)} />
      )}
    </>
  );
};

// For compatibility, export as ModalEditor
export const ModalEditor = (props) => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState(props.storyTitle);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [tagSearchTerm, setTagSearchTerm] = useState('');

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = props.storyContent || '';
      updateCounts(editorRef.current.textContent);
    }
  }, [props.storyContent]);

  // Update character, word count and reading time
  const updateCounts = (text) => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const reading = Math.ceil(words / 200); // Average reading speed
    
    setCharCount(chars);
    setWordCount(words);
    setReadingTime(reading);
  };

  // Keyboard shortcut: Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  // Toolbar actions
  const handleToolbar = (cmd, arg, value) => {
    if (cmd === 'createLink') {
      const url = prompt('Enter the link URL:');
      if (url) document.execCommand('createLink', false, url);
      return;
    }
    if (cmd === 'formatBlock') {
      document.execCommand('formatBlock', false, value);
      return;
    }
    if (cmd === 'foreColor' || cmd === 'backColor') {
      document.execCommand(cmd, false, arg);
      return;
    }
    document.execCommand(cmd, false, arg || null);
  };

  // Save handler
  const handleSave = () => {
    const content = editorRef.current ? editorRef.current.innerHTML : '';
    if (!title || !title.trim()) {
      alert('Please enter a story title');
      return;
    }
    if (!content || !content.trim()) {
      alert('Please enter story content');
      return;
    }
    
    // Extract clean text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const cleanContent = tempDiv.textContent || tempDiv.innerText || '';
    
    props.onSave(title, cleanContent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
      <div className="bg-white rounded-t-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header - Fixed */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <i className="ri-edit-2-line"></i>
            </div>
            <h3 className="font-bold text-xl">Write Your Story</h3>
          </div>
          <button
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            onClick={props.onClose || (() => {})}
            aria-label="Close"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Main Content Area - Flex */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Writing Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Fixed Writing Header */}
            <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gray-50">
              {/* Error/Success Messages */}
              {props.error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="ri-error-warning-line"></i>
                    <span>{props.error}</span>
                  </div>
                </div>
              )}
              {props.success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="ri-check-line"></i>
                    <span>{props.success}</span>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter your story title..."
                className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-700 text-lg font-semibold"
                autoFocus
              />

              {/* Toolbar */}
              <div className="mt-4 flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200">
                {toolbarButtons.map((btn, i) => (
                  <button
                    key={i}
                    type="button"
                    title={btn.title}
                    className="px-3 py-2 rounded-md hover:bg-primary/10 text-gray-700 transition-colors"
                    tabIndex={-1}
                    onMouseDown={e => {
                      e.preventDefault();
                      handleToolbar(btn.cmd, btn.arg, btn.value);
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
                <select
                  className="ml-2 px-3 py-2 rounded-md border border-gray-300 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onChange={e => document.execCommand('fontSize', false, e.target.value)}
                  defaultValue=""
                  tabIndex={-1}
                >
                  <option value="" disabled>Font Size</option>
                  <option value="1">10px</option>
                  <option value="2">13px</option>
                  <option value="3">16px</option>
                  <option value="4">18px</option>
                  <option value="5">24px</option>
                  <option value="6">32px</option>
                  <option value="7">48px</option>
                </select>
              </div>
            </div>

            {/* Scrollable Writing Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Content Editor */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                className="w-full min-h-[500px] p-6 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-800 prose prose-lg max-w-none"
                style={{ 
                  fontSize: 16, 
                  outline: 'none',
                  lineHeight: 1.6
                }}
                aria-label="Story Content"
                tabIndex={0}
                placeholder="Start writing your story here..."
                onInput={(e) => {
                  const text = e.target.textContent;
                  updateCounts(text);
                  
                  // Update border color for long stories
                  if (charCount > 10000) {
                    e.target.style.borderColor = '#ef4444';
                  } else {
                    e.target.style.borderColor = '';
                  }
                }}
              />
            
              {/* Character Count & Stats - Fixed at bottom */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex space-x-6 text-sm">
                    <span className={`font-medium ${charCount < 50 ? 'text-red-500' : 'text-gray-700'}`}>
                      {charCount} characters
                    </span>
                    <span className="text-gray-700 font-medium">{wordCount} words</span>
                    <span className="text-gray-700 font-medium">~{readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {charCount < 50 && (
                      <span className="text-red-500 text-sm">(Minimum 50 characters)</span>
                    )}
                    {charCount > 10000 && (
                      <span className="text-red-500 text-sm">(Story is quite long!)</span>
                    )}
                  </div>
                </div>
                {charCount > 0 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        charCount > 10000 ? 'bg-red-500' : 
                        charCount > 5000 ? 'bg-yellow-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min((charCount / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Settings Sidebar */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="flex-1 p-6 overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-6 text-lg">Story Settings</h4>
              
              {/* Authentication Status */}
              {props.isAuthenticated && props.user && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  props.isAnonymous 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <p className={`text-sm ${
                    props.isAnonymous ? 'text-gray-700' : 'text-green-700'
                  }`}>
                    {props.isAnonymous ? (
                      <>
                        <i className="ri-user-line mr-2"></i>
                        Publishing anonymously
                      </>
                    ) : (
                      <>
                        Publishing as: <span className="font-medium">{props.user.username || props.user.name || 'User'}</span>
                      </>
                    )}
                  </p>
                </div>
              )}
              
              {/* Story Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Story Type <span className="text-red-500">*</span>
                  {!props.storyType && (
                    <span className="text-red-500 text-xs ml-2">(Please select a story type)</span>
                  )}
                </label>
                <div className="relative">
                  {!props.storyType && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center text-yellow-800 text-sm">
                        <span className="mr-2">⚠️</span>
                        <span>Please choose a story type to help readers find your story</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-white border border-gray-300 rounded-lg">
                    {Array.from(new Set(storyTypes)).map(type => {
                      const isSelected = props.storyType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => props.setStoryType && props.setStoryType(type)}
                          className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5 hover:shadow-sm'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Series/Collection Selection */}
              {props.collections && props.collections.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Series/Collection (Optional)
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => props.setSelectedCollection && props.setSelectedCollection('')}
                      className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                        !props.selectedCollection
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5'
                      }`}
                    >
                      📚 No Series
                    </button>
                    {props.collections.map(collection => {
                      const isSelected = props.selectedCollection === collection._id;
                      return (
                        <button
                          key={collection._id}
                          type="button"
                          onClick={() => props.setSelectedCollection && props.setSelectedCollection(collection._id)}
                          className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                            isSelected
                              ? 'bg-gradient-to-r from-primary to-primary/80 text-white border-primary shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>📖 {collection.title}</span>
                            {isSelected && <span className="text-xs opacity-75">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags Selection */}
              {props.availableTags && props.availableTags.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tags {props.selectedTags && props.selectedTags.length > 0 && (
                      <span className="text-primary font-bold">({props.selectedTags.length} selected)</span>
                    )}
                  </label>
                  
                  {/* Selected Tags Display */}
                  {props.selectedTags && props.selectedTags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {props.selectedTags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-primary to-primary/80 text-white font-medium shadow-sm animate-pulse">
                          <span className="mr-1">🏷️</span>
                          {tag}
                          <button
                            type="button"
                            onClick={() => props.onTagToggle && props.onTagToggle(tag)}
                            className="ml-2 hover:bg-white hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tag Search and Selection */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={tagSearchTerm}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-sm mb-3"
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                    />
                    
                    <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                      <div className="grid grid-cols-1 gap-2">
                        {props.availableTags
                          .filter(tag => tag.toLowerCase().includes(tagSearchTerm.toLowerCase()))
                          .map(tag => {
                          const isSelected = props.selectedTags && props.selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => props.onTagToggle && props.onTagToggle(tag)}
                              className={`flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                                isSelected
                                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white border-primary shadow-md transform scale-105'
                                  : 'bg-white text-gray-700 border-gray-200 hover:border-primary hover:bg-primary/5 hover:shadow-sm'
                              }`}
                            >
                              <span className="flex items-center">
                                <span className="mr-2 text-xs">
                                  {isSelected ? '✓' : '○'}
                                </span>
                                {tag}
                              </span>
                              {isSelected && (
                                <span className="text-xs opacity-75">Selected</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Anonymous Publishing */}
              <div className="mb-6">
                <label className={`flex items-center cursor-pointer p-4 rounded-lg border transition-all duration-200 ${
                  props.isAnonymous 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'hover:bg-gray-100 border-gray-200 bg-white'
                }`}>
                  <input
                    type="checkbox"
                    checked={props.isAnonymous || false}
                    onChange={(e) => props.setIsAnonymous && props.setIsAnonymous(e.target.checked)}
                    className="mr-3 w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${props.isAnonymous ? 'text-gray-800' : 'text-gray-700'}`}>
                      Publish Anonymously
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {props.isAnonymous 
                        ? 'Your story will be published without showing your username' 
                        : 'Your username will be displayed with your story'
                      }
                    </p>
                  </div>
                  {props.isAnonymous && (
                    <div className="ml-2 p-1 bg-gray-200 rounded-full">
                      <i className="ri-user-line text-gray-600 text-sm"></i>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex flex-col gap-3 p-6 border-t border-gray-200 bg-white">
              <button
                className="bg-primary text-white px-5 py-3 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={handleSave}
                disabled={props.isPublishing || !title.trim() || !props.isAuthenticated || charCount < 50 || !props.storyType}
              >
                {!props.isAuthenticated ? 'Login Required' : 
                 props.isPublishing ? 'Publishing...' : 
                 charCount < 50 ? 'Story too short' : 
                 !props.storyType ? 'Select Story Type' : 'Publish Story'}
              </button>
              <button
                className="bg-gray-100 text-gray-700 px-5 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={props.onClose || (() => {})}
                disabled={props.isPublishing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Createstory;