import React, { useState, useEffect, useRef } from 'react';
import { getStories, toggleLike, searchContent } from '../api/stories';
import GuestNotification from './GuestNotification';
import { useUser } from '../context/UserContext';
import Storydetailmodal from './Storydetailmodal';

const Storyfeed = () => {
  const [stories, setStories] = useState([]);
  const [displayedStories, setDisplayedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestNotification, setShowGuestNotification] = useState(false);
  const [likeLoading, setLikeLoading] = useState({});
  const [openStoryId, setOpenStoryId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const { isAuthenticated, user } = useUser();
  const searchTimeoutRef = useRef(null);

  // Fetch stories from API
  const fetchStories = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      const response = await getStories({ 
        limit: 40, 
        sortBy: 'recent',
        page: pageNum
      });
      
      if (append) {
        setStories(prev => [...prev, ...response.stories]);
        setDisplayedStories(prev => [...prev, ...response.stories]);
      } else {
        setStories(response.stories);
        setDisplayedStories(response.stories);
      }
      
      setHasMore(response.stories.length === 40);
      setPage(pageNum);
      
      if (!isAuthenticated && response.pagination) {
        setIsGuest(response.pagination.isGuest || false);
      }
    } catch {
      setError('Failed to load stories. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchStories();
    // eslint-disable-next-line
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Search functionality methods
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      setIsSearching(true);
      // Debounce search to avoid too many searches
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const searchResults = await searchContent({ 
            query: query,
            type: 'stories',
            limit: 100, 
            page: 1,
            sortBy: 'relevance'
          });
          
          // Update displayed stories with search results
          if (searchResults.results && searchResults.results.stories) {
            setDisplayedStories(searchResults.results.stories);
          } else if (searchResults.stories) {
            // Handle direct stories array response
            setDisplayedStories(searchResults.stories);
          }
        } catch (error) {
          console.error('Search error:', error);
          // Fallback to local filtering if search fails
          filterStoriesLocally(query);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      // If search is empty, show all stories
      setDisplayedStories(stories);
      setIsSearching(false);
    }
  };

  const filterStoriesLocally = (query) => {
    const term = query.toLowerCase();
    const filtered = stories.filter(story =>
      (story.title && story.title.toLowerCase().includes(term)) ||
      (story.author && story.author.toLowerCase().includes(term)) ||
      (story.originalAuthor && story.originalAuthor.toLowerCase().includes(term)) ||
      (story.tags && story.tags.some(tag => tag.toLowerCase().includes(term)))
    );
    setDisplayedStories(filtered);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by handleSearchChange
  };

  // Guest notification logic
  useEffect(() => {
    if (!isAuthenticated) {
      setIsGuest(true);
      setShowGuestNotification(true);
    } else {
      setIsGuest(false);
      setShowGuestNotification(false);
    }
  }, [isAuthenticated]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchStories(page + 1, true);
    }
  };

  const handleLike = async (storyId) => {
    if (likeLoading[storyId]) return;
    if (!user) return;
    setLikeLoading(prev => ({ ...prev, [storyId]: true }));
    try {
      const res = await toggleLike(storyId);
      const userId = user.id || user._id;
      setStories(prevStories => prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              likes: res.likes,
              likedBy: res.liked ?
                [...(story.likedBy || []), userId] :
                (story.likedBy || []).filter(id => id !== userId)
            }
          : story
      ));
      setDisplayedStories(prevStories => prevStories.map(story =>
        story.id === storyId
          ? {
              ...story,
              likes: res.likes,
              likedBy: res.liked ?
                [...(story.likedBy || []), userId] :
                (story.likedBy || []).filter(id => id !== userId)
            }
          : story
      ));
    } catch {
      setError('Failed to update like. Please try again.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLikeLoading(prev => ({ ...prev, [storyId]: false }));
    }
  };

  const handleCardClick = (storyId) => {
    setOpenStoryId(storyId);
  };

  const handleCloseModal = () => {
    setOpenStoryId(null);
  };

  const isStoryLikedByUser = (story) => {
    if (!user || !story.likedBy) return false;
    const userId = user.id || user._id;
    return story.likedBy.includes(userId);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchStories()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl">
            <input
              type="text"
              placeholder="Search stories, tags, or authors..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-base"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              ) : (
                <i className="ri-search-line"></i>
              )}
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line"></i>
              </button>
            )}
          </form>
        </div>
        
        {/* Search Results Info */}
        {searchTerm && (
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-600">
              {isSearching ? (
                <span>Searching for "{searchTerm}"...</span>
              ) : (
                <span>
                  Found {displayedStories.length} result{displayedStories.length !== 1 ? 's' : ''} for "{searchTerm}"
                </span>
              )}
            </p>
          </div>
        )}

        {/* Guest Notification */}
        {!isAuthenticated && (
          <GuestNotification
            isVisible={showGuestNotification && isGuest}
            onClose={() => setShowGuestNotification(false)}
          />
        )}

        {/* Scrollable Stories Container */}
        <div className="relative">
          {/* Stories Grid - Scrollable */}
          <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="masonry-grid">
              {displayedStories.map(story => (
                <div
                  key={story.id}
                  className="w-full max-w-xl mx-auto mb-8 cursor-pointer group"
                  onClick={() => handleCardClick(story.id)}
                  tabIndex={0}
                  role="button"
                  style={{ outline: 'none' }}
                >
                  <div className={`bg-white rounded-xl shadow-lg p-6 border transition-shadow duration-200 group-hover:shadow-2xl ${
                    story.isUserStory
                      ? 'border-green-200 bg-green-50/30 group-hover:border-green-300'
                      : 'border-gray-100 group-hover:border-primary/40'
                  }`}>
                    <div className="flex items-center mb-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 ${story.isAnonymous ? 'bg-gray-100' : story.isUserStory ? 'bg-green-100' : 'bg-primary/10'}`}>
                        {story.isAnonymous ? (
                          <i className="ri-user-line text-gray-600 text-base"></i>
                        ) : story.isUserStory ? (
                          <span className="text-green-600 text-base font-bold">{story.authorInitials}</span>
                        ) : (
                          <span className="text-primary text-base font-bold">{story.authorInitials}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className="font-semibold text-gray-800 text-sm">
                            {story.isAnonymous ? 'Anonymous Author' : story.author}
                          </div>
                          {story.isUserStory && (
                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Your Story
                            </span>
                          )}
                        </div>
                        {story.isAnonymous && story.originalAuthor && (
                          <div className="text-xs text-gray-500 mt-1">
                            Originally by: {story.originalAuthor}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">{story.publishedAt}</div>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-200">{story.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {story.tags && story.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-700 mb-4 line-clamp-4 whitespace-pre-line">
                      {story.content}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-3">
                        <button
                          className={`like-button w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none ${
                            isStoryLikedByUser(story)
                              ? 'bg-red-100 text-red-500 hover:bg-red-200 shadow-md'
                              : 'bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500'
                          }`}
                          onClick={e => { e.stopPropagation(); handleLike(story.id); }}
                          disabled={likeLoading[story.id]}
                          title={isStoryLikedByUser(story) ? 'Unlike this story' : 'Like this story'}
                        >
                          {likeLoading[story.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill={isStoryLikedByUser(story) ? '#ef4444' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isStoryLikedByUser(story) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover:text-red-500'}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.435 7.24a5.373 5.373 0 0 0-9.435-2.28A5.373 5.373 0 0 0 2.565 7.24c-1.14 2.28-.21 5.13 2.28 6.84l6.155 4.32a1.5 1.5 0 0 0 1.8 0l6.155-4.32c2.49-1.71 3.42-4.56 2.28-6.84Z" />
                            </svg>
                          )}
                        </button>
                        <span className="text-sm text-gray-500">{story.likes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Reading time {story.readTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Stories Message */}
            {!loading && displayedStories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No stories found.</p>
                <p className="text-gray-400 text-sm mt-2">Try searching for a different story, tag, or author.</p>
              </div>
            )}

            {/* End of Stories Message */}
            {!loading && !hasMore && displayedStories.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">You've reached the end of all stories.</p>
              </div>
            )}
          </div>

                  {/* Load More Button - Fixed at bottom */}
        {hasMore && !loading && !searchTerm && (
          <div className="flex justify-center mt-6 pb-4 bg-white border-t border-gray-100 pt-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
            >
              {loadingMore ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                'Load More Stories'
              )}
            </button>
          </div>
        )}
        </div>
      </div>
      {/* Story Detail Modal */}
      {openStoryId && (
        <Storydetailmodal
          storyId={openStoryId}
          open={!!openStoryId}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Storyfeed;