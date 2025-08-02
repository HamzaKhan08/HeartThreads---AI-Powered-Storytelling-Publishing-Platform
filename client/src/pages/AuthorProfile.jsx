import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuthorProfile, sendFollowRequest } from '../api/social';
import { useUser } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Storydetailmodal from '../components/Storydetailmodal';

const AuthorProfile = () => {
  const { authorId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('stories');
  const [pending, setPending] = useState(false);
  const [selectedStoryId, setLocalSelectedStoryId] = useState(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const authorData = await getAuthorProfile(authorId);
        setAuthor(authorData);
        setPending(authorData.hasPendingRequest);
      } catch (err) {
        console.error('Error fetching author profile:', err);
        setError('Failed to load author profile');
      } finally {
        setLoading(false);
      }
    };

    if (authorId) {
      fetchAuthorProfile();
    }
  }, [authorId]);

  const handleFollowRequest = async () => {
    if (!user) {
      setNotification({ type: 'error', message: 'Please log in to follow authors.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      const res = await sendFollowRequest(authorId);
      setPending(true);
      setNotification({ type: 'success', message: res.message || 'Follow request sent!' });
      setTimeout(() => setNotification(null), 3000);
      
      // Update author state to reflect the change
      setAuthor(prev => ({
        ...prev,
        hasPendingRequest: true
      }));
    } catch (error) {
      console.error('Follow request error:', error);
      setNotification({ type: 'error', message: 'Failed to send follow request.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleStoryClick = (storyId) => {
    // Open story in modal
    setLocalSelectedStoryId(storyId);
  };

  const handleUserClick = (userId) => {
    // Navigate to user's profile in same tab
    navigate(`/author/${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading author profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Author not found'}</p>
            <button 
              onClick={() => navigate('/explore')}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Back to Explore
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Enhanced Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-xl shadow-2xl transition-all duration-500 transform ${
          notification.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-400' 
            : 'bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400'
        } animate-bounce-in`}>
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === 'success' ? 'bg-green-400' : 'bg-red-400'
            }`}>
              <span className="text-lg">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200"
            >
              <span className="text-sm">✕</span>
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Author Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                {author.profilePic ? (
                  <img 
                    src={author.profilePic} 
                    alt={author.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {author.name.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{author.name}</h1>
                <p className="text-gray-600 mb-3">Storyteller & Author</p>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>📅 Joined {author.joinedAt}</span>
                  <span>📍 HeartThreads Community</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {author.canFollow && (
                <button
                  onClick={handleFollowRequest}
                  disabled={pending || author.isFollowing}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    author.isFollowing 
                      ? 'bg-gray-100 text-gray-700 cursor-default' 
                      : pending 
                        ? 'bg-yellow-100 text-yellow-700 cursor-default' 
                        : 'bg-primary text-white hover:bg-primary/90'
                  }`}
                >
                  {author.isFollowing ? 'Following' : pending ? 'Request Sent' : 'Follow Author'}
                </button>
              )}
              
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Explore
              </button>
            </div>
          </div>
        </div>

        {/* Author Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-primary mb-1">{author.stats.stories}</div>
            <div className="text-sm text-gray-600">Stories</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-blue-600 mb-1">{author.stats.views}</div>
            <div className="text-sm text-gray-600">Views</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-red-500 mb-1">{author.stats.likes}</div>
            <div className="text-sm text-gray-600">Likes</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-green-600 mb-1">{author.stats.followers}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-purple-600 mb-1">{author.stats.following}</div>
            <div className="text-sm text-gray-600">Following</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-orange-600 mb-1">{author.stats.totalReadTime}</div>
            <div className="text-sm text-gray-600">Min Read</div>
          </div>
        </div>

        {/* Top Tags */}
        {author.topTags && author.topTags.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Favorite Topics</h3>
            <div className="flex flex-wrap gap-2">
              {author.topTags.map((tag, index) => (
                <span
                  key={index}
                  className="tag-chip bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 mb-8">
          <div className="border-b border-gray-100">
            <nav className="flex space-x-4 md:space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('stories')}
                className={`py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'stories'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Stories ({author.stories.length})
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'followers'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Followers ({author.stats.followers})
              </button>
              <button
                onClick={() => setActiveTab('following')}
                className={`py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'following'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Following ({author.stats.following})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 px-2 md:px-1 border-b-2 font-medium text-xs md:text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'stories' && (
              <div>
                {author.stories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {author.stories.map((story) => (
                      <div
                        key={story.id}
                        className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        onClick={() => handleStoryClick(story.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500">{story.publishedAt}</span>
                          <span className="text-xs text-gray-500">{story.readTime} min read</span>
                        </div>
                        
                        <h3 className="font-bold text-gray-800 mb-3 line-clamp-2">{story.title}</h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.content}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>👁️ {story.views}</span>
                            <span>❤️ {story.likes}</span>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {story.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="tag-chip bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {story.tags.length > 2 && (
                              <span className="text-xs text-gray-500">+{story.tags.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-quill-pen-line text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No stories yet</h3>
                    <p className="text-gray-600">This author hasn't published any stories yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div>
                {author.followers && author.followers.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {author.stats.followers} Followers
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {author.followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                          onClick={() => handleUserClick(follower.id)}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            {follower.profilePic ? (
                              <img 
                                src={follower.profilePic} 
                                alt={follower.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-bold">
                                {follower.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {follower.isAnonymous ? 'Anonymous User' : follower.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              @{follower.isAnonymous ? 'anonymous' : follower.username}
                            </p>
                          </div>
                          <button className="text-primary hover:text-primary/80">
                            <i className="ri-arrow-right-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-user-line text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No followers yet</h3>
                    <p className="text-gray-600">This author doesn't have any followers yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'following' && (
              <div>
                {author.following && author.following.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">
                        {author.stats.following} Following
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {author.following.map((followingUser) => (
                        <div
                          key={followingUser.id}
                          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                          onClick={() => handleUserClick(followingUser.id)}
                        >
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            {followingUser.profilePic ? (
                              <img 
                                src={followingUser.profilePic} 
                                alt={followingUser.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-lg font-bold">
                                {followingUser.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-800">
                              {followingUser.isAnonymous ? 'Anonymous User' : followingUser.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              @{followingUser.isAnonymous ? 'anonymous' : followingUser.username}
                            </p>
                          </div>
                          <button className="text-primary hover:text-primary/80">
                            <i className="ri-arrow-right-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-user-line text-2xl text-gray-400"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Not following anyone yet</h3>
                    <p className="text-gray-600">This author hasn't started following anyone yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-3">About {author.name}</h4>
                  <p className="text-blue-700">
                    {author.name} is a passionate storyteller who joined the HeartThreads community {author.joinedAt}. 
                    They love sharing stories that inspire, entertain, and connect with readers around the world.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Writing Style</h4>
                    <p className="text-gray-600 text-sm">
                      {author.topTags && author.topTags.length > 0 
                        ? `Specializes in ${author.topTags.slice(0, 3).join(', ')} stories.`
                        : 'Explores various themes and genres in their writing.'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-bold text-gray-800 mb-3">Community Impact</h4>
                    <p className="text-gray-600 text-sm">
                      Has shared {author.stats.stories} stories with {author.stats.views} total views 
                      and {author.stats.likes} likes from the community.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                  <h4 className="font-bold text-green-800 mb-3">Connect</h4>
                  <p className="text-green-700 text-sm">
                    Follow {author.name} to get notified when they publish new stories and join the conversation 
                    in the comments section.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <Storydetailmodal storyId={selectedStoryId} onClose={() => setLocalSelectedStoryId(null)} />
    </div>
  );
};

export default AuthorProfile; 