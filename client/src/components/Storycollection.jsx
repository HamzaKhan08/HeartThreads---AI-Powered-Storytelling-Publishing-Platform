import React, { useState, useRef, useEffect } from 'react'
import { createCollection, getCollections } from '../api/stories';
import StorycollectionsDetailModal from './StorycollectionsDetailModal';
import { likeCollection } from '../api/social';
import { useUser } from '../context/UserContext';
import { io } from 'socket.io-client';

const Storycollection = ({ filter = null }) => {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeStates, setLikeStates] = useState({}); // { [collectionId]: { liked: bool, count: number } }
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [creating, setCreating] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    tags: '',
    coverImage: ''
  });
  const [sortOption, setSortOption] = useState('recent');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'mostLiked', label: 'Most Liked' },
    { value: 'az', label: 'A-Z' },
    { value: 'za', label: 'Z-A' },
  ];

  const gradientThemes = [
    'from-pink-100 via-purple-100 to-white',
    'from-yellow-100 via-orange-100 to-white',
    'from-green-100 via-teal-100 to-white',
    'from-blue-100 via-indigo-100 to-white',
    'from-fuchsia-100 via-pink-100 to-white',
    'from-amber-100 via-lime-100 to-white',
    'from-rose-100 via-red-100 to-white',
    'from-cyan-100 via-sky-100 to-white',
    'from-violet-100 via-purple-100 to-white',
    'from-emerald-100 via-green-100 to-white',
  ];

  // Fetch stories and create collections from API
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        // Only apply sort, not any filter, unless user provides one
        let sortBy = 'createdAt';
        let order = 'desc';
        if (sortOption === 'oldest') { sortBy = 'createdAt'; order = 'asc'; }
        if (sortOption === 'mostLiked') { sortBy = 'likes'; order = 'desc'; }
        if (sortOption === 'az') { sortBy = 'title'; order = 'asc'; }
        if (sortOption === 'za') { sortBy = 'title'; order = 'desc'; }
        const response = await getCollections({ sortBy, order });
        setCollections(response.collections || []);
        // Set like states
        const likeStatesObj = {};
        (response.collections || []).forEach(col => {
          likeStatesObj[col.id || col._id] = {
            liked: col.likedBy && user ? col.likedBy.includes(user.id) : false,
            count: col.likes || 0
          };
        });
        setLikeStates(likeStatesObj);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [user, sortOption]);

  useEffect(() => {
    if (collections.length > 0) {
      console.log('Fetched collections:', collections);
    }
  }, [collections]);

  // Real-time updates: Socket.IO
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      withCredentials: true
    });
    const handleRealtime = () => {
      // Refetch collections on any collection change
      let sortBy = 'createdAt';
      let order = 'desc';
      if (sortOption === 'oldest') { sortBy = 'createdAt'; order = 'asc'; }
      if (sortOption === 'mostLiked') { sortBy = 'likes'; order = 'desc'; }
      if (sortOption === 'az') { sortBy = 'title'; order = 'asc'; }
      if (sortOption === 'za') { sortBy = 'title'; order = 'desc'; }
      getCollections({ sortBy, order }).then(response => {
        setCollections(response.collections || []);
      });
    };
    socket.on('collectionCreated', handleRealtime);
    socket.on('collectionDeleted', handleRealtime);
    // Optionally: socket.on('collectionUpdated', handleRealtime);
    return () => {
      socket.disconnect();
    };
  }, [sortOption]);

  const handleLike = async (collectionId) => {
    if (!user) return alert('Please log in to like collections.');
    const token = localStorage.getItem('token');
    const res = await likeCollection(collectionId, token);
    setLikeStates(prev => {
      const prevState = prev[collectionId] || { liked: false, count: 0 };
      if (res.liked) {
        return { ...prev, [collectionId]: { liked: true, count: prevState.count + 1 } };
      } else {
        return { ...prev, [collectionId]: { liked: false, count: Math.max(0, prevState.count - 1) } };
      }
    });
  };

  const scrollContainerRef = useRef(null);

  const scrollToNext = () => {
    if (currentIndex < collections.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollContainerRef.current?.scrollBy({
        left: 320, // Width of card + gap
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollContainerRef.current?.scrollBy({
        left: -320, // Width of card + gap
        behavior: 'smooth'
      });
    }
  };

  const canScrollNext = currentIndex < collections.length - 1;
  const canScrollPrev = currentIndex > 0;

  // Handler for creating a collection
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);
    try {
      const payload = {
        title: newCollection.title.trim(),
        description: newCollection.description.trim(),
        tags: newCollection.tags.split(',').map(t => t.trim()).filter(Boolean),
        coverImage: newCollection.coverImage.trim() || undefined
      };
      if (!payload.title || !payload.description) {
        setCreateError('Title and description are required.');
        setCreating(false);
        return;
      }
      await createCollection(payload);
      setCreateSuccess('Collection created successfully!');
      setShowCreateModal(false);
      setNewCollection({ title: '', description: '', tags: '', coverImage: '' });
      // Always refetch collections from backend for correct order
      const response = await getCollections();
      setCollections(response.collections || []);
    } catch (err) {
      setCreateError(err.message || 'Failed to create collection.');
    } finally {
      setCreating(false);
      setTimeout(() => setCreateSuccess(''), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Story Collections</h2>
            <p className="text-gray-600 mb-8">No collections found matching your filters.</p>
            <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-500">Try adjusting your search criteria or browse all collections.</p>
              {user && (
                <button
                  className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow hover:bg-primary/90 transition-all text-base"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="ri-add-line mr-2"></i> Create Collection
                </button>
              )}
            </div>
          </div>
        </div>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <button
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Collection</h3>
              <form onSubmit={handleCreateCollection} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newCollection.title}
                    onChange={e => setNewCollection({ ...newCollection, title: e.target.value })}
                    required
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                  <textarea
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newCollection.description}
                    onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                    required
                    rows={3}
                    maxLength={300}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newCollection.tags}
                    onChange={e => setNewCollection({ ...newCollection, tags: e.target.value })}
                    placeholder="e.g. Adventure, Sci-Fi, Friendship"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL <span className="text-gray-400">(optional)</span></label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={newCollection.coverImage}
                    onChange={e => setNewCollection({ ...newCollection, coverImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                {createError && <div className="text-red-500 text-sm text-center">{createError}</div>}
                {createSuccess && <div className="text-green-600 text-sm text-center">{createSuccess}</div>}
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Collection'}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  return (
    <>
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 mb-3" style={{fontFamily: 'Qurovademo'}}>Story Collections</h2>
              <p className="text-gray-600 max-w-2xl">
                {filter && (filter.tag.length > 0 || filter.title || filter.author) 
                  ? `Found ${collections.length} collection${collections.length !== 1 ? 's' : ''} matching your filters`
                  : 'Discover curated stories organized by themes and emotions'
                }
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-600 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary" style={{fontFamily: 'Qurovademo'}}
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                aria-label="Sort collections"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {user && (
                <button
                  className="mt-6 md:mt-0 px-6 py-3 rounded-xl bg-primary text-white font-semibold shadow hover:bg-primary/90 transition-all text-base"
                  style={{fontFamily: 'Qurovademo'}}
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="ri-add-line mr-2"></i> Create Collection
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            {/* Navigation arrows */}
            <div className="hidden lg:flex absolute -left-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={scrollToPrev}
                disabled={!canScrollPrev}
                className={`p-3 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-200 ${
                  canScrollPrev 
                    ? 'hover:bg-gray-50 hover:shadow-xl text-gray-600' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <i className="ri-arrow-left-s-line text-xl"></i>
              </button>
            </div>

            <div className="hidden lg:flex absolute -right-4 top-1/2 transform -translate-y-1/2 z-10">
              <button
                onClick={scrollToNext}
                disabled={!canScrollNext}
                className={`p-3 rounded-full bg-white shadow-lg border border-gray-200 transition-all duration-200 ${
                  canScrollNext 
                    ? 'hover:bg-gray-50 hover:shadow-xl text-gray-600' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <i className="ri-arrow-right-s-line text-xl"></i>
              </button>
            </div>

            {/* Mobile navigation */}
            <div className="flex justify-center mb-6 lg:hidden">
              <div className="flex items-center space-x-3">
                <button
                  onClick={scrollToPrev}
                  disabled={!canScrollPrev}
                  className={`p-2 rounded-full border transition-colors duration-200 ${
                    canScrollPrev 
                      ? 'border-gray-300 hover:bg-gray-50 text-gray-600' 
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-arrow-left-s-line text-lg"></i>
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} of {(collections || []).length}
                </span>
                <button
                  onClick={scrollToNext}
                  disabled={!canScrollNext}
                  className={`p-2 rounded-full border transition-colors duration-200 ${
                    canScrollNext 
                      ? 'border-gray-300 hover:bg-gray-50 text-gray-600' 
                      : 'border-gray-200 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <i className="ri-arrow-right-s-line text-lg"></i>
                </button>
              </div>
            </div>

            {/* Collections grid */}
            <div 
              ref={scrollContainerRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide horizontal-scroll pb-6 px-2 lg:px-0"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {collections.map((collection, idx) => (
                <div
                  key={collection.id || collection._id}
                  className={`flex-shrink-0 w-80 bg-gradient-to-br ${gradientThemes[idx % gradientThemes.length]} rounded-2xl p-6 shadow-lg border border-gray-100 collection-card cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                  onClick={() => {
                    console.log('Opening modal for collection:', collection);
                    setSelectedCollection(collection);
                    setModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 truncate flex-1 mr-3" style={{fontFamily: 'Qurovademo'}}>
                      {collection.title}
                    </h3>
                    <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-sm px-3 py-1.5 rounded-full font-semibold whitespace-nowrap shadow-sm">
                      {(collection.stories ? collection.stories.length : (collection.storyCount || 0))} stories
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4 text-sm line-clamp-3 leading-relaxed" style={{fontFamily: 'Qurovademo'}}>
                    {collection.description}
                  </p>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2 font-medium">
                      By {collection.author}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {(collection.tags || []).slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tag}
                        className={`tag-chip tag-motion inline-block px-3 py-1.5 rounded-full text-xs font-medium animate-tag-scale-in tag-stagger-${(tagIndex % 5) + 1} bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-300 animate-tag-float-medium shadow-sm`}
                        style={{
                          animationDelay: `${tagIndex * 0.1}s`
                        }}
                      >
                        <span className="tag-icon">{tag}</span>
                      </span>
                    ))}
                    {(collection.tags || []).length > 3 && (
                      <span className="inline-block px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 backdrop-blur-sm text-gray-600 shadow-sm">
                        +{(collection.tags || []).length - 3} more
                      </span>
                    )}
                  </div>
                  
                  {/* Like Button */}
                  <div className="flex items-center space-x-2 mb-3">
                    <button
                      onClick={e => { e.stopPropagation(); handleLike(collection.id || collection._id); }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${likeStates[collection.id || collection._id]?.liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                    >
                      <i className={likeStates[collection.id || collection._id]?.liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                    </button>
                    <span className="text-xs text-gray-500">
                      {typeof collection.likes === 'number' ? collection.likes : (likeStates[collection.id || collection._id]?.count || 0)} like
                    </span>
                  </div>
                  <button className="w-full bg-white/90 backdrop-blur-sm border border-white/50 text-gray-700 px-4 py-3 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 whitespace-nowrap font-semibold text-sm">
                    <span className="flex items-center justify-center" style={{fontFamily: 'Qurovademo'}}>
                      View Collection
                      <i className="ri-arrow-right-line ml-2"></i>
                    </span>
                  </button>
                </div>
              ))}
            </div>

            {/* Progress indicator */}
            {(collections || []).length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {Array.from({ length: Math.min(5, Math.ceil((collections || []).length / 2)) }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                        Math.floor(currentIndex / 2) === i
                          ? 'bg-primary'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {modalOpen && selectedCollection && (
        <StorycollectionsDetailModal
          collection={selectedCollection}
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedCollection(null);
          }}
        />
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
              onClick={() => setShowCreateModal(false)}
              aria-label="Close"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={{fontFamily: 'Qurovademo'}}>Create New Collection</h3>
            <form onSubmit={handleCreateCollection} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCollection.title}
                  onChange={e => setNewCollection({ ...newCollection, title: e.target.value })}
                  required
                  maxLength={80}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCollection.description}
                  onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
                  required
                  rows={3}
                  maxLength={300}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400">(comma separated)</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCollection.tags}
                  onChange={e => setNewCollection({ ...newCollection, tags: e.target.value })}
                  placeholder="e.g. Adventure, Sci-Fi, Friendship"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL <span className="text-gray-400">(optional)</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newCollection.coverImage}
                  onChange={e => setNewCollection({ ...newCollection, coverImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              {createError && <div className="text-red-500 text-sm text-center">{createError}</div>}
              {createSuccess && <div className="text-green-600 text-sm text-center">{createSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Collection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Storycollection;