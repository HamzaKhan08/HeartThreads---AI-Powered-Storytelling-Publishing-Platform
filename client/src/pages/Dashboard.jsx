import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  getFollowers, 
  getFollowing, 
  followUser,
  likeStory, 
  likeCollection,
  sendFollowRequest,
  getPendingFollowRequests,
  approveFollowRequest,
  rejectFollowRequest,
  getNotifications
} from '../api/social';
import { getBookmarkedStories } from '../api/stories';
import Storydetailmodal from '../components/Storydetailmodal';
import Modal from '../components/Modal'; // Add a generic modal if you have one, or implement inline

const Dashboard = () => {
  const { user, logout, updateProfile } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(user?.isAnonymous || false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || ''
  });
  const [userStats, setUserStats] = useState({
    storiesWritten: 0,
    collectionsCreated: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [myStories, setMyStories] = useState([]);
  const [myCollections, setMyCollections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [likedStories, setLikedStories] = useState([]);
  const [likedCollections, setLikedCollections] = useState([]);
  const [bookmarkedStories, setBookmarkedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [pendingFollowRequests, setPendingFollowRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState(null);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch user statistics and activity
  const fetchUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token');
      }

      console.log('Current user:', user);
      console.log('User ID:', user._id || user.id);

      console.log('Starting to fetch user data...');

      // Fetch user statistics
      try {
        const statsResponse = await fetch(`${API_URL}/users/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('User stats fetched successfully:', statsData);
          setUserStats(statsData);
        } else {
          console.warn('Stats endpoint returned:', statsResponse.status);
          // Try to get error details
          const errorData = await statsResponse.json().catch(() => ({}));
          console.warn('Stats error details:', errorData);
          setUserStats({
            storiesWritten: 0,
            collectionsCreated: 0,
            totalViews: 0,
            totalLikes: 0
          });
        }
      } catch (statsError) {
        console.warn('Error fetching stats:', statsError);
        setUserStats({
          storiesWritten: 0,
          collectionsCreated: 0,
          totalViews: 0,
          totalLikes: 0
        });
      }

      // Fetch recent activity
      try {
        const activityResponse = await fetch(`${API_URL}/users/activity`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (activityResponse.ok) {
          const activityData = await activityResponse.json();
          console.log('User activity fetched successfully:', activityData);
          setRecentActivity(activityData.activities || []);
        } else {
          console.warn('Activity endpoint returned:', activityResponse.status);
          const errorData = await activityResponse.json().catch(() => ({}));
          console.warn('Activity error details:', errorData);
          setRecentActivity([]);
        }
      } catch (activityError) {
        console.warn('Error fetching activity:', activityError);
        setRecentActivity([]);
      }

      // Fetch user's stories
      try {
        const storiesResponse = await fetch(`${API_URL}/users/stories`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (storiesResponse.ok) {
          const storiesData = await storiesResponse.json();
          console.log('My stories data:', storiesData);
          setMyStories(storiesData.stories || []);
        } else {
          console.warn('Stories endpoint returned:', storiesResponse.status);
          setMyStories([]);
        }
      } catch (storiesError) {
        console.warn('Error fetching stories:', storiesError);
        setMyStories([]);
      }

      // Fetch user's collections
      try {
        const collectionsResponse = await fetch(`${API_URL}/collections?author=${user._id || user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json();
          console.log('User collections fetched successfully:', collectionsData);
          setMyCollections(collectionsData.collections || []);
        } else {
          console.warn('Collections endpoint returned:', collectionsResponse.status);
          setMyCollections([]);
        }
      } catch (collectionsError) {
        console.warn('Error fetching collections:', collectionsError);
        setMyCollections([]);
      }

      // Fetch followers
      try {
        const followersResponse = await getFollowers(user._id || user.id);
        console.log('Followers fetched successfully:', followersResponse);
        setFollowers(followersResponse.followers || []);
      } catch (followersError) {
        console.warn('Error fetching followers:', followersError);
        setFollowers([]);
      }

      // Fetch following
      try {
        const followingResponse = await getFollowing(user._id || user.id);
        console.log('Following fetched successfully:', followingResponse);
        setFollowing(followingResponse.following || []);
      } catch (followingError) {
        console.warn('Error fetching following:', followingError);
        setFollowing([]);
      }

      // Fetch bookmarked stories
      try {
        const bookmarkedResponse = await getBookmarkedStories();
        console.log('Bookmarked stories fetched successfully:', bookmarkedResponse);
        setBookmarkedStories(bookmarkedResponse.stories || []);
      } catch (bookmarkedError) {
        console.warn('Error fetching bookmarked stories:', bookmarkedError);
        setBookmarkedStories([]);
      }

      // Fetch liked stories
      try {
        const likedStoriesResponse = await fetch(`${API_URL}/stories?likedBy=${user._id || user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (likedStoriesResponse.ok) {
          const likedStoriesData = await likedStoriesResponse.json();
          console.log('Liked stories fetched successfully:', likedStoriesData);
          setLikedStories(likedStoriesData.stories || []);
        } else {
          console.warn('Liked stories endpoint returned:', likedStoriesResponse.status);
          setLikedStories([]);
        }
      } catch (likedStoriesError) {
        console.warn('Error fetching liked stories:', likedStoriesError);
        setLikedStories([]);
      }

      // Fetch liked collections
      try {
        const likedCollectionsResponse = await fetch(`${API_URL}/collections?likedBy=${user._id || user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (likedCollectionsResponse.ok) {
          const likedCollectionsData = await likedCollectionsResponse.json();
          console.log('Liked collections fetched successfully:', likedCollectionsData);
          setLikedCollections(likedCollectionsData.collections || []);
        } else {
          console.warn('Liked collections endpoint returned:', likedCollectionsResponse.status);
          setLikedCollections([]);
        }
      } catch (likedCollectionsError) {
        console.warn('Error fetching liked collections:', likedCollectionsError);
        setLikedCollections([]);
      }

      // Fetch pending follow requests
      try {
        const pendingRes = await getPendingFollowRequests(token);
        console.log('Pending follow requests fetched successfully:', pendingRes);
        setPendingFollowRequests(pendingRes.pendingFollowRequests || []);
      } catch (error) {
        console.warn('Error fetching pending follow requests:', error);
        setPendingFollowRequests([]);
      }

      // Fetch notifications
      try {
        const notifRes = await getNotifications(token);
        console.log('Notifications fetched successfully:', notifRes);
        setNotifications(notifRes.notifications || []);
      } catch (error) {
        console.warn('Error fetching notifications:', error);
        setNotifications([]);
      }

    } catch (err) {
      console.error('Error in fetchUserData:', err);
      setError(err.message);
    } finally {
      console.log('User data fetch completed');
      console.log('Summary of fetched data:', {
        stories: myStories.length,
        collections: myCollections.length,
        followers: followers.length,
        following: following.length,
        bookmarkedStories: bookmarkedStories.length,
        likedStories: likedStories.length,
        likedCollections: likedCollections.length,
        pendingRequests: pendingFollowRequests.length,
        notifications: notifications.length,
        recentActivity: recentActivity.length
      });
      setLoading(false);
    }
  }, [user, API_URL]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Update form data when user changes
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || ''
    });
    setIsAnonymous(user?.isAnonymous || false);

    // Fetch user data
    fetchUserData();
  }, [user, navigate, fetchUserData]);

  // Refresh data when user publishes new content
  useEffect(() => {
    const handleStorageChange = () => {
      // Refresh data when localStorage changes (indicating new content)
      fetchUserData();
    };

    const handleBookmarkUpdate = () => {
      // Refresh bookmarked stories when bookmark is updated
      fetchUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bookmarkUpdated', handleBookmarkUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bookmarkUpdated', handleBookmarkUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || ''
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Make API call to update the user profile
      const result = await updateProfile({
        name: formData.name,
        username: formData.username,
        isAnonymous: isAnonymous
      });
      
      if (result.success) {
        setIsEditing(false);
        alert('Profile updated successfully!');
        // Refresh user data after profile update
        fetchUserData();
      } else {
        alert(result.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleAnonymousMode = async () => {
    try {
      const newAnonymousState = !isAnonymous;
      
      // Make API call to update the anonymous status
      const result = await updateProfile({
        isAnonymous: newAnonymousState
      });
      
      if (result.success) {
        setIsAnonymous(newAnonymousState);
        alert(`Switched to ${newAnonymousState ? 'anonymous' : 'public'} mode!`);
        // Refresh user data after mode change
        fetchUserData();
      } else {
        alert(result.error || 'Failed to update anonymous mode. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling anonymous mode:', error);
      alert('Failed to update anonymous mode. Please try again.');
    }
  };

  const deleteStory = async (storyId) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('Deleting story with ID:', storyId);
      console.log('API URL:', `${API_URL}/stories/${storyId}`);
      
      const response = await fetch(`${API_URL}/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        setNotification({ type: 'success', message: 'Story deleted successfully!' });
        // Refresh data
        fetchUserData();
        // Auto-hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Delete error response:', errorData);
        setNotification({ type: 'error', message: errorData.message || 'Failed to delete story' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      setNotification({ type: 'error', message: 'Failed to delete story. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const deleteCollection = async (collectionId) => {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/collections/${collectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotification({ type: 'success', message: 'Collection deleted successfully!' });
        // Refresh data
        fetchUserData();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const errorData = await response.json();
        setNotification({ type: 'error', message: errorData.message || 'Failed to delete collection' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      setNotification({ type: 'error', message: 'Failed to delete collection. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLikeStory = async (storyId) => {
    try {
      const token = localStorage.getItem('token');
      await likeStory(storyId, token);
      // Refresh liked stories
      fetchUserData();
    } catch (error) {
      console.error('Error liking story:', error);
      setNotification({ type: 'error', message: 'Failed to like story. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLikeCollection = async (collectionId) => {
    try {
      const token = localStorage.getItem('token');
      await likeCollection(collectionId, token);
      // Refresh liked collections
      fetchUserData();
    } catch (error) {
      console.error('Error liking collection:', error);
      setNotification({ type: 'error', message: 'Failed to like collection. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleFollowUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const result = await followUser(userId, token);
      // Refresh followers/following data
      fetchUserData();
      // Show success notification
      setNotification({ 
        type: 'success', 
        message: result.following ? 'Successfully followed user!' : 'Successfully unfollowed user!' 
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Error following user:', error);
      setNotification({ type: 'error', message: 'Failed to follow user. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleSendFollowRequest = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const result = await sendFollowRequest(userId, token);
      fetchUserData();
      setNotification({ type: 'success', message: result.message || 'Follow request sent!' });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: 'Failed to send follow request.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleApproveFollowRequest = async (requesterId) => {
    try {
      const token = localStorage.getItem('token');
      const result = await approveFollowRequest(requesterId, token);
      await fetchUserData(); // Ensure UI refreshes
      setNotification({ type: 'success', message: result.message || 'Follow request approved!' });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: 'Failed to approve follow request.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleRejectFollowRequest = async (requesterId) => {
    try {
      const token = localStorage.getItem('token');
      const result = await rejectFollowRequest(requesterId, token);
      await fetchUserData(); // Ensure UI refreshes
      setNotification({ type: 'success', message: result.message || 'Follow request rejected.' });
      setTimeout(() => setNotification(null), 3000);
    } catch {
      setNotification({ type: 'error', message: 'Failed to reject follow request.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Unknown time';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'story_created':
        return '📝';
      case 'collection_created':
        return '📚';
      case 'story_viewed':
        return '👁️';
      case 'story_liked':
        return '❤️';
      case 'comment_added':
        return '💬';
      case 'profile_updated':
        return '👤';
      default:
        return '📋';
    }
  };

  const getActivityColor = (activityType) => {
    switch (activityType) {
      case 'story_created':
        return 'bg-blue-100';
      case 'collection_created':
        return 'bg-purple-100';
      case 'story_viewed':
        return 'bg-green-100';
      case 'story_liked':
        return 'bg-red-100';
      case 'comment_added':
        return 'bg-yellow-100';
      case 'profile_updated':
        return 'bg-indigo-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Loading your dashboard...</p>
            <p className="text-sm text-gray-500 mt-2">Fetching stories, collections, and activity data</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchUserData}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
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
      {/* Followers Modal */}
      {showFollowersModal && (
        <Modal onClose={() => setShowFollowersModal(false)} title="Followers">
          <div className="space-y-2">
            {followers.map(follower => (
              <div key={follower._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">
                    {follower.name ? follower.name[0] : follower.username[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {follower.isAnonymous ? 'Anonymous' : (follower.name || follower.username || 'User')}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {/* Following Modal */}
      {showFollowingModal && (
        <Modal onClose={() => setShowFollowingModal(false)} title="Following">
          <div className="space-y-2">
            {following.map(followed => (
              <div key={followed._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-green-600">
                    {followed.name ? followed.name[0] : followed.username[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  {followed.isAnonymous ? 'Anonymous' : (followed.name || followed.username || 'User')}
                </span>
              </div>
            ))}
          </div>
        </Modal>
      )}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              <span style={{fontFamily: 'Qurovademo'}}>Welcome Back,</span> {user.name || user.username || 'User'}!
            </h1>
            <button 
              onClick={fetchUserData}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{fontFamily: 'Qurovademo'}}>
            Your personal dashboard where you can manage your profile and view your activity
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-white">
                    {(user.name || user.username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.name || user.username || 'User'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
                {user.isAnonymous && (
                  <span className="inline-block mt-2 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Anonymous Mode
                  </span>
                )}
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <span className="text-gray-800">{user.name || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                      placeholder="Enter your username"
                    />
                  ) : (
                    <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                      <span className="text-gray-800">{user.username}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-gray-800">{user.email}</span>
                  </div>
                </div>

                {user.password && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                      <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 flex items-center justify-between">
                        <span className="text-gray-800">
                          {showPassword ? user.password : '••••••••'}
                        </span>
                        <button
                          onClick={togglePasswordVisibility}
                          className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {showPassword ? 'Hide password' : 'Click to view your password'}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                    <span className="text-gray-800 capitalize">
                      {user.googleId ? 'Google Account' : 'Email Account'}
                    </span>
                  </div>
                </div>

                {/* Anonymous Mode Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Anonymous Mode</label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {isAnonymous ? 'Anonymous Mode' : 'Public Mode'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {isAnonymous 
                          ? 'Your stories will be published anonymously' 
                          : 'Your name will be shown with your stories'
                        }
                      </p>
                    </div>
                    <button
                      onClick={toggleAnonymousMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isAnonymous ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isAnonymous ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={handleSaveProfile}
                      className="w-full bg-primary hover:bg-opacity-90 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={handleEditProfile}
                    className="w-full bg-primary hover:bg-opacity-90 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                  >
                    Edit Profile
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Stories Written</p>
                    <p className="text-3xl font-bold text-gray-800">{userStats.storiesWritten}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📝</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Collections Created</p>
                    <p className="text-3xl font-bold text-gray-800">{userStats.collectionsCreated}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-3xl font-bold text-gray-800">{userStats.totalViews}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👁️</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-3xl font-bold text-gray-800">{userStats.totalLikes}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">❤️</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Followers</h3>
                  <span className="text-2xl font-bold text-primary cursor-pointer" onClick={() => setShowFollowersModal(true)}>{followers.length}</span>
                </div>
                <div className="space-y-2">
                  {followers.slice(0, 3).map((follower) => {
                    const isFollowing = following.some(f => f._id === follower._id);
                    const isPending = pendingFollowRequests.some(r => r._id === follower._id);
                    return (
                      <div key={follower._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {follower.name ? follower.name[0] : follower.username[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">
                            {follower.isAnonymous ? 'Anonymous' : (follower.name || follower.username || 'User')}
                          </span>
                        </div>
                        {/* No follow/unfollow button for self */}
                        {user._id !== follower._id && (
                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (isFollowing) handleFollowUser(follower._id);
                            else if (!isPending) handleSendFollowRequest(follower._id);
                          }}
                          className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          {isFollowing ? 'Unfollow' : isPending ? 'Requested' : 'Request to Follow'}
                        </button>
                        )}
                      </div>
                    );
                  })}
                  {followers.length > 3 && (
                    <p className="text-sm text-gray-500 text-center cursor-pointer" onClick={() => setShowFollowersModal(true)}>
                      +{followers.length - 3} more followers
                    </p>
                  )}
                  {followers.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No followers yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Following</h3>
                  <span className="text-2xl font-bold text-primary cursor-pointer" onClick={() => setShowFollowingModal(true)}>{following.length}</span>
                </div>
                <div className="space-y-2">
                  {following.slice(0, 3).map((followed) => {
                    const isFollowing = followers.some(f => f._id === followed._id);
                    const isPending = pendingFollowRequests.some(r => r._id === followed._id);
                    return (
                      <div key={followed._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-green-600">
                            {followed.name ? followed.name[0] : followed.username[0]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {followed.isAnonymous ? 'Anonymous' : (followed.name || followed.username || 'User')}
                        </span>
                        {/* No follow/unfollow button for self */}
                        {user._id !== followed._id && (
                        <button
                          disabled={isPending}
                          onClick={() => {
                            if (isFollowing) handleFollowUser(followed._id);
                            else if (!isPending) handleSendFollowRequest(followed._id);
                          }}
                          className="text-xs px-2 py-1 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          {isFollowing ? 'Unfollow' : isPending ? 'Requested' : 'Request to Follow'}
                        </button>
                        )}
                      </div>
                    );
                  })}
                  {following.length > 3 && (
                    <p className="text-sm text-gray-500 text-center cursor-pointer" onClick={() => setShowFollowingModal(true)}>
                      +{following.length - 3} more following
                    </p>
                  )}
                  {following.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">Not following anyone yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* My Stories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>My Stories</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {myStories.length} {myStories.length !== 1 ? 'Stories' : ''} •  
                    {myStories.reduce((total, story) => total + (story.views || 0), 0)} total views •  
                    {myStories.reduce((total, story) => total + (story.likes || 0), 0)} total likes
                  </p>
                </div>
                <button 
                  onClick={fetchUserData}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Refresh
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto dashboard-scroll pr-2">
                <div className="space-y-3">
                {myStories.length > 0 ? (
                  myStories.map((story) => (
                    <div key={story.id || story._id} className="story-item p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary/30 transition-all duration-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2 text-lg">{story.title}</h4>
                          
                          {/* Tags */}
                          {story.tags && story.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {story.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {/* Collection info */}
                          {story.collection && (
                            <div className="mb-2">
                              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                📚 In Collection: {story.collection.title}
                              </span>
                            </div>
                          )}
                          
                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <span className="mr-1">👁️</span>
                              {story.views || 0} views
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">❤️</span>
                              {story.likes || 0} likes
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">📖</span>
                              {story.readTime || 1} min read
                            </span>
                            <span className="flex items-center">
                              <span className="mr-1">🕒</span>
                              {story.publishedAt || 'Unknown time'}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleLikeStory(story.id || story._id)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${story.likedBy && story.likedBy.includes(user._id || user.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                            title={story.likedBy && story.likedBy.includes(user._id || user.id) ? 'Unlike' : 'Like'}
                          >
                            <i className={story.likedBy && story.likedBy.includes(user._id || user.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                          </button>
                          <button
                            onClick={() => setSelectedStoryId(story.id || story._id)}
                            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            title="View Story"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteStory(story.id || story._id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            title="Delete Story"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {/* Story preview */}
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {story.content && story.content.length > 150 
                          ? `${story.content.substring(0, 150)}...` 
                          : story.content
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📝</span>
                    </div>
                    <p className="text-gray-500">No stories yet</p>
                    <p className="text-sm text-gray-400">Start writing your first story!</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Bookmarked Stories */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>Bookmarked Stories</h3>
                <button 
                  onClick={fetchUserData}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Refresh
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto dashboard-scroll pr-2">
                <div className="space-y-3">
                {bookmarkedStories.length > 0 ? (
                  bookmarkedStories.map((story) => (
                    <div key={story.id || story._id} className="story-item flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{story.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>by {story.author}</span>
                          <span>{story.likes || 0} likes</span>
                          <span>{story.publishedAt || 'Unknown time'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLikeStory(story.id || story._id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${story.likedBy && story.likedBy.includes(user._id || user.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                        >
                          <i className={story.likedBy && story.likedBy.includes(user._id || user.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                        </button>
                        <button
                          onClick={() => setSelectedStoryId(story.id || story._id)}
                          className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔖</span>
                    </div>
                    <p className="text-gray-500">No bookmarked stories yet</p>
                    <p className="text-sm text-gray-400">Bookmark stories you want to read later!</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* My Collections */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>My Collections</h3>
                <button 
                  onClick={fetchUserData}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Refresh
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto dashboard-scroll pr-2">
                <div className="space-y-3">
                {myCollections.length > 0 ? (
                  myCollections.map((collection) => (
                    <div key={collection._id} className="collection-item flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{collection.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{collection.stories?.length || 0} stories</span>
                          <span>{collection.likes || 0} likes</span>
                          <span>{collection.createdAt ? formatTimeAgo(collection.createdAt) : 'Unknown time'}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLikeCollection(collection.id || collection._id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${collection.likedBy && collection.likedBy.includes(user._id || user.id) ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                        >
                          <i className={collection.likedBy && collection.likedBy.includes(user._id || user.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                        </button>
                        <button
                          onClick={() => window.open(`/collection/${collection.id || collection._id}`, '_blank')}
                          className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteCollection(collection.id || collection._id)}
                          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📚</span>
                    </div>
                    <p className="text-gray-500">No collections yet</p>
                    <p className="text-sm text-gray-400">Start creating your first collection!</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Liked Content */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>Liked Stories</h3>
                  <span className="text-sm text-gray-500">{likedStories.length}</span>
                </div>
                <div className="space-y-2">
                  {likedStories.slice(0, 3).map((story) => (
                    <div key={story._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-red-600">❤️</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{story.title}</p>
                        <p className="text-xs text-gray-500">by {story.author}</p>
                      </div>
                    </div>
                  ))}
                  {likedStories.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{likedStories.length - 3} more liked stories
                    </p>
                  )}
                  {likedStories.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No liked stories yet</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>Liked Collections</h3>
                  <span className="text-sm text-gray-500">{likedCollections.length}</span>
                </div>
                <div className="space-y-2">
                  {likedCollections.slice(0, 3).map((collection) => (
                    <div key={collection._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-600">📚</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 truncate">{collection.title}</p>
                        <p className="text-xs text-gray-500">by {collection.author}</p>
                      </div>
                    </div>
                  ))}
                  {likedCollections.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{likedCollections.length - 3} more liked collections
                    </p>
                  )}
                  {likedCollections.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">No liked collections yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>Recent Activity</h3>
                <button 
                  onClick={fetchUserData}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  Refresh
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto dashboard-scroll pr-2">
                <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={activity.id || index} className="activity-item flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center`}>
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{activity.description}</p>
                        <p className="text-sm text-gray-600">{formatTimeAgo(activity.createdAt)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📋</span>
                    </div>
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400">Start writing stories to see your activity here</p>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Qurovademo'}}>Quick Actions</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg hover:from-primary/90 hover:to-purple-600/90 transition-all duration-200">
                  <span className="text-2xl">✍️</span>
                  <div className="text-left">
                    <p className="font-medium">Write New Story</p>
                    <p className="text-sm opacity-90">Share your thoughts</p>
                  </div>
                </button>
                
                <button 
                  onClick={async () => {
                    try {
                      const token = localStorage.getItem('token');
                      const response = await fetch(`${API_URL}/stories`, {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          title: 'Test Story for Deletion',
                          content: 'This is a test story to verify delete functionality.',
                          tags: ['test']
                        })
                      });
                      if (response.ok) {
                        setNotification({ type: 'success', message: 'Test story created! Check My Stories section.' });
                        fetchUserData();
                        setTimeout(() => setNotification(null), 3000);
                      } else {
                        setNotification({ type: 'error', message: 'Failed to create test story' });
                        setTimeout(() => setNotification(null), 3000);
                      }
                    } catch (error) {
                      console.error('Error creating test story:', error);
                      setNotification({ type: 'error', message: 'Failed to create test story' });
                      setTimeout(() => setNotification(null), 3000);
                    }
                  }}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-500/90 hover:to-orange-500/90 transition-all duration-200"
                >
                  <span className="text-2xl">🧪</span>
                  <div className="text-left">
                    <p className="font-medium">Create Test Story</p>
                    <p className="text-sm opacity-90">For testing delete functionality</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-500/90 hover:to-cyan-500/90 transition-all duration-200">
                  <span className="text-2xl">📚</span>
                  <div className="text-left">
                    <p className="font-medium">Create Collection</p>
                    <p className="text-sm opacity-90">Organize your stories</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-500/90 hover:to-emerald-500/90 transition-all duration-200">
                  <span className="text-2xl">🔍</span>
                  <div className="text-left">
                    <p className="font-medium">Explore Stories</p>
                    <p className="text-sm opacity-90">Discover new content</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-500/90 hover:to-pink-500/90 transition-all duration-200">
                  <span className="text-2xl">⚙️</span>
                  <div className="text-left">
                    <p className="font-medium">Settings</p>
                    <p className="text-sm opacity-90">Manage preferences</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Pending Follow Requests */}
            <div className="mb-8">
              {/* Pending Follow Requests */}
              {pendingFollowRequests.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-yellow-800 mb-2" style={{fontFamily: 'Qurovademo'}}>Pending Follow Requests</h3>
                  <ul className="space-y-2">
                    {pendingFollowRequests.map(req => (
                      <li key={req._id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={req.profilePic || '/default-avatar.png'} alt="avatar" className="w-8 h-8 rounded-full" />
                          <span className="font-medium text-gray-800">{req.username || req.name}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => handleApproveFollowRequest(req._id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Approve</button>
                          <button onClick={() => handleRejectFollowRequest(req._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Notifications */}
              {notifications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-blue-800 mb-2" style={{fontFamily: 'Qurovademo'}}>Notifications</h3>
                  <ul className="space-y-2">
                    {notifications.slice(-5).reverse().map((notif, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-xs text-gray-600">{formatTimeAgo(notif.createdAt)}</span>
                        {(notif.type === 'like' || notif.type === 'story_like') && <span className="text-primary"><i className="ri-heart-3-line"></i></span>}
                        {notif.type === 'follow_request' && <span className="text-primary"><i className="ri-user-add-line"></i></span>}
                        {notif.type === 'follow_approved' && <span className="text-primary"><i className="ri-user-follow-line"></i></span>}
                        <span className="font-medium text-gray-800">{notif.message}</span>
                        {notif.from && notif.from.username && (
                          <span className="text-gray-500">from {notif.from.username}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {selectedStoryId && (
        <Storydetailmodal storyId={selectedStoryId} onClose={() => setSelectedStoryId(null)} />
      )}
    </div>
  );
};

export default Dashboard; 