import React, { useState, useEffect } from 'react';
import { likeCollection, followUser, getFollowers } from '../api/social';
import { getCollectionById, createStory } from '../api/stories';
import { useUser } from '../context/UserContext';
import { ModalEditor } from './Createstory';

const StorycollectionsDetailModal = ({ open, onClose, collection, setSelectedStoryId }) => {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyModalKey, setStoryModalKey] = useState(0); // To force re-mount
  const [modalCollection, setModalCollection] = useState(collection);
  // Add state for story creation fields
  const [storyTitle, setStoryTitle] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [storyType, setStoryType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setCurrentIndex(0);
    setModalCollection(collection);
    if (collection) {
      setLikeCount(collection.likedBy ? collection.likedBy.length : 0);
      setLiked(collection.likedBy && user ? collection.likedBy.includes(user.id) : false);
      if (collection.authors && collection.authors.length > 0 && user) {
        const mainAuthor = collection.authors[0];
        getFollowers(mainAuthor._id || mainAuthor.id || mainAuthor).then(res => {
          setFollowing(res.followers && res.followers.some(f => f._id === user.id));
        }).catch(err => {
          console.error('Error fetching followers:', err);
        });
      }
    }
  }, [collection, user]);

  // Only allow like if collection._id exists (real collection)
  const isRealCollection = Boolean(collection._id);

  const handleLike = async () => {
    if (!user) return alert('Please log in to like collections.');
    if (likeLoading) return;
    if (!isRealCollection) {
      setNotification({ type: 'error', message: 'Only real collections can be liked.' });
      return;
    }
    const collectionId = collection._id;
    setLikeLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await likeCollection(collectionId, token);
      if (res.liked) {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to like collection.' });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !collection.authors || collection.authors.length === 0) return alert('Please log in to follow authors.');
    const token = localStorage.getItem('token');
    const mainAuthor = collection.authors[0];
    const res = await followUser(mainAuthor._id || mainAuthor.id || mainAuthor, token);
    setFollowing(res.following);
    setNotification({ 
      type: 'success', 
      message: res.following ? 'Successfully followed author!' : 'Successfully unfollowed author!' 
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handler to open story modal with collection pre-selected
  const handleWriteStory = () => {
    if (!modalCollection || !modalCollection._id) {
      setNotification({ type: 'error', message: 'This collection does not exist. Please create a real collection first.' });
      return;
    }
    setShowStoryModal(true);
    setStoryModalKey(prev => prev + 1); // Force remount for clean state
  };

  // Handler after story is published: refresh collection stories
  const handleStoryPublished = async () => {
    setShowStoryModal(false);
    // Defensive: Only refetch if collection exists
    if (!modalCollection || !modalCollection._id) {
      setNotification({ type: 'error', message: 'This collection does not exist. Please create a real collection first.' });
      return;
    }
    // Refetch the collection to get the updated stories
    const updated = await getCollectionById(modalCollection._id);
    console.log('Updated collection after publishing story:', updated);
    if (updated) {
      setModalCollection(updated);
      setCurrentIndex((updated.stories || []).length - 1); // Go to the new story
    }
  };

  const handleCreateStory = async (title, content) => {
    if (!modalCollection || !modalCollection._id) return;
    await createStory({
      title,
      content,
      tags: selectedTags,
      storyType,
      collection: modalCollection._id,
      isAnonymous
    });
    setShowStoryModal(false);
    // Refetch the collection to update stories
    const updated = await getCollectionById(modalCollection._id);
    setModalCollection(updated);
    setCurrentIndex((updated.stories || []).length - 1);
  };

  if (!open || !modalCollection) return null;
  const stories = modalCollection.stories || [];
  const story = stories[currentIndex];

  // Helper for author initials
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <span>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
        <div className="relative w-full max-w-7xl h-[92vh] bg-gradient-to-br from-white/80 via-gray-50 to-purple-50 rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-row">
          {/* Sidebar: Story List */}
          <aside className="hidden md:flex flex-col w-64 bg-white/60 border-r border-gray-100 p-6 gap-2 overflow-y-auto relative">
            {/* Stunning Write Story Button (desktop) */}
            <button
              className="w-full mb-6 px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2"
              onClick={handleWriteStory}
            >
              <i className="ri-quill-pen-line text-xl"></i>
              Write Story in this Collection
            </button>
            <h3 className="text-lg font-bold text-gray-700 mb-4 tracking-wide">Stories in Collection</h3>
            <div className="flex-1 flex flex-col gap-1">
              {stories.map((s, idx) => (
                <button
                  key={s._id || idx}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-left font-medium text-gray-700 hover:bg-primary/10 hover:text-primary ${
                    idx === currentIndex ? 'bg-primary/20 text-primary font-bold shadow' : ''
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                >
                  <span className="truncate flex-1">{s.title || 'Untitled Story'}</span>
                  {idx === currentIndex && <i className="ri-arrow-right-s-line text-xl" />}
                </button>
              ))}
            </div>
          </aside>
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white/70">
              <div className="flex items-center gap-4">
                <div className="w-14 h-20 bg-gradient-to-b from-pink-200 to-purple-100 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center">
                  <i className="ri-book-3-line text-3xl text-primary"></i>
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-gray-800 leading-tight mb-1">
                    {modalCollection.title}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-500 text-base font-medium mb-1 flex-wrap">
                    {modalCollection.authorNames && modalCollection.authorNames.map((name, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-xs mr-1">
                          {getInitials(name)}
                        </span>
                        {name}
                      </span>
                    ))}
                    {modalCollection.authors && modalCollection.authors.length > 0 && user && modalCollection.authors[0]._id !== user.id && (
                      <button
                        className={`ml-4 px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors duration-200 text-xs ${following ? 'opacity-70' : ''}`}
                        onClick={handleFollow}
                      >
                        {following ? 'Following' : 'Follow Author'}
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {modalCollection.createdAt && (
                      <>Created {new Date(modalCollection.createdAt).toLocaleDateString()}</>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <i className="ri-book-2-line text-base"></i> {stories.length} stories
                    </span>
                    <span className="flex items-center gap-1 text-gray-500 text-xs">
                      <i className="ri-heart-3-line text-base"></i> {likeCount} likes
                    </span>
                  </div>
                </div>
              </div>
              {/* Like & Close Buttons */}
              <div className="flex items-center gap-2">
                {isRealCollection ? (
                  <>
                    <button
                      onClick={handleLike}
                      disabled={likeLoading}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'} ${likeLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      title={liked ? 'Unlike' : 'Like'}
                    >
                      {likeLoading ? (
                        <span className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></span>
                      ) : (
                        <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                      )}
                    </button>
                    <span className="text-sm text-gray-500">{likeCount}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400" title="Only real collections can be liked">(Cannot like virtual collection)</span>
                )}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                  aria-label="Close"
                >
                  <i className="ri-close-line text-2xl"></i>
                </button>
              </div>
            </div>
            {/* Stunning Write Story Button (mobile) */}
            <div className="md:hidden flex px-4 pt-4 pb-2">
              <button
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-primary to-purple-500 text-white font-bold text-base shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={handleWriteStory}
              >
                <i className="ri-quill-pen-line text-xl"></i>
                Write Story in this Collection
              </button>
            </div>
            {/* Collection Description */}
            {collection.description && (
              <div className="px-8 pt-4 pb-2 text-gray-600 text-base font-[500] bg-white/60 border-b border-gray-100">
                {collection.description}
              </div>
            )}
            {/* Story Content Area */}
            <div className="flex-1 flex flex-col px-8 py-6 bg-white/80 overflow-y-auto min-h-[300px]">
              {/* Main Area: Story Title and Content */}
              <div className="mb-4">
                <h2 className="text-xl font-bold font-serif text-center text-gray-700 mb-4">
                  {story?.title || 'Untitled Story'}
                </h2>
                <div className="prose max-w-none text-gray-700 text-base leading-relaxed font-[500]">
                  {story?.content || 'No content.'}
                </div>
                {setSelectedStoryId && story?._id && (
                  <button
                    className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                    onClick={() => setSelectedStoryId(story._id)}
                  >
                    Open Full Story
                  </button>
                )}
              </div>
              {/* Navigation (mobile only) */}
              <div className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 mb-2">
                {stories.map((s, idx) => (
                  <button
                    key={s._id || idx}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      idx === currentIndex ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-primary/10 hover:text-primary'
                    }`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {s.title}
                  </button>
                ))}
              </div>
              {/* Prev/Next Navigation */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="ri-arrow-left-s-line"></i> Previous
                </button>
                <div className="text-sm text-gray-400">
                  Story {currentIndex + 1} of {stories.length}
                </div>
                <button
                  onClick={() => setCurrentIndex((i) => Math.min(stories.length - 1, i + 1))}
                  disabled={currentIndex === stories.length - 1}
                  className="px-4 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <i className="ri-arrow-right-s-line"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile overlay for closing */}
        <button
          className="fixed inset-0 z-40 md:hidden cursor-default"
          onClick={onClose}
          aria-label="Close modal overlay"
          tabIndex={-1}
          style={{ background: 'transparent', pointerEvents: 'auto' }}
        />
      </div>
      {/* Story Creation Modal */}
      {showStoryModal && (
        <ModalEditor
          key={storyModalKey}
          storyTitle={storyTitle}
          setStoryTitle={setStoryTitle}
          storyContent={storyContent}
          setStoryContent={setStoryContent}
          storyType={storyType}
          setStoryType={setStoryType}
          selectedCollection={modalCollection._id}
          setSelectedCollection={() => {}}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          availableTags={[]}
          collections={[{ _id: modalCollection._id, title: modalCollection.title }]}
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          onClose={() => setShowStoryModal(false)}
          onSave={handleCreateStory}
          isPublishing={false}
          error={null}
          success={null}
          onTagToggle={() => {}}
          isAuthenticated={true}
          user={user}
        />
      )}
    </>
  );
};

export default StorycollectionsDetailModal; 