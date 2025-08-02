import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { searchContent } from "../api/stories";
import { getNotifications, markNotificationsRead } from '../api/social';
import { generatePrompts, generateStory, getAIStatus } from '../api';
import { emotionalTones, writingStyles, lengthOptions } from '../constants/aiOptions';

const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [length, setLength] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const userDropdownRef = useRef(null);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifSeen, setNotifSeen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // AI Writing Assistant states
  const [aiStatus, setAiStatus] = useState(null);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generationProgress, setGenerationProgress] = useState("");
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });



  const handleGeneratePrompts = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first!");
      return;
    }
    if (!selectedTone) {
      setError("Please select an emotional tone!");
      return;
    }
    if (!selectedStyle) {
      setError("Please select a writing style!");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await generatePrompts({
        topic,
        emotionalTone: selectedTone,
        writingStyle: selectedStyle
      });

      if (response.success) {
        setGeneratedPrompts(response.prompts || []);
        setShowPrompts(true);
        showNotification("Prompts generated successfully!", "success");
      } else {
        setError(response.message || "Failed to generate prompts");
      }
    } catch (error) {
      console.error('Error generating prompts:', error);
      setError("Failed to generate prompts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetStarted = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic first!");
      return;
    }
    if (!selectedTone) {
      setError("Please select an emotional tone!");
      return;
    }
    if (!selectedStyle) {
      setError("Please select a writing style!");
      return;
    }

    setIsGeneratingStory(true);
    setError("");
    setGenerationProgress("Initializing AI story generation...");

    try {
      const response = await generateStory({
        topic,
        emotionalTone: selectedTone,
        writingStyle: selectedStyle,
        length
      });

      if (response.success) {
        setGeneratedStory(response.story);
        setGenerationProgress("");
        showNotification("Story generated successfully!", "success");
      } else {
        setError(response.message || "Failed to generate story");
        setGenerationProgress("");
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setError("Failed to generate story. Please try again.");
      setGenerationProgress("");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handlePromptSelect = (prompt) => {
    setTopic(prompt);
    setShowPrompts(false);
  };

  // AI Writing Assistant functions
  const checkAIStatus = async () => {
    try {
      const response = await getAIStatus();
      setAiStatus(response);
    } catch (error) {
      console.error('Error checking AI status:', error);
      setAiStatus({ success: false, status: 'unavailable' });
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 3000);
  };

  // Check AI service status when modal opens
  useEffect(() => {
    if (showModal) {
      checkAIStatus();
    }
  }, [showModal]);

  // Search functionality methods
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (query.trim()) {
      // Debounce search to avoid too many searches
      searchTimeoutRef.current = setTimeout(async () => {
        await searchContent({ 
          query: query,
          type: 'all',
          limit: 20, 
          page: 1,
          sortBy: 'relevance'
        });
      }, 300);
    }
  };

  const handleSearchFocus = () => {
    // No-op, previously setShowSearchResults(true)
  };

  const handleSearchBlur = () => {
    // No-op, previously setShowSearchResults(false)
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  // Add a submit handler for the search bar
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    let interval;
    const fetchNotifs = async () => {
      if (!isAuthenticated) return;
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const res = await getNotifications(token);
        setNotifications(res.notifications || []);
        // Only count as unread if not seen
        if (!notifSeen) {
          setUnreadCount((res.notifications || []).filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifs();
    interval = setInterval(fetchNotifs, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isAuthenticated, notifSeen]);

  const handleNotifBellClick = async () => {
    setShowNotifDropdown(!showNotifDropdown);
    setUnreadCount(0); // Mark as read visually
    setNotifSeen(true); // Stop blinking
    const token = localStorage.getItem('token');
    if (token) await markNotificationsRead(token);
  };

  return (
    <>
      <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-2xl text-primary" style={{fontFamily: 'Qurovademo'}}>
             HeartThreads
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <div className="relative">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  className="search-input w-64 pl-10 pr-4 py-2 rounded-full bg-gray-50 border-none text-sm focus:outline-none"
                  placeholder="Search stories or tags..."
                  style={{fontFamily: 'Qurovademo'}}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400">
                  <i className="ri-search-line"></i>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                )}
              </form>
            </div>
            <Link
              to="/explore"
              style={{fontFamily: 'Qurovademo'}}
              className={`text-gray-700 hover:text-primary transition-colors duration-200 ${
                location.pathname === '/explore' ? 'text-primary font-medium' : ''
              }`}
            >
              Explore
            </Link>
            <Link
              to="/collections"
              style={{fontFamily: 'Qurovademo'}}
              className={`text-gray-700 hover:text-primary transition-colors duration-200 ${
                location.pathname === '/collections' ? 'text-primary font-medium' : ''
              }`}
            >
              Collections
            </Link>
            <div className="relative inline-block">
              <button
                className="bg-primary text-white px-4 py-2 !rounded-button whitespace-nowrap relative" 
                style={{fontFamily: 'Qurovademo'}}
                onClick={() => setShowModal(true)} // just make sure this is true if you want to show the modal or make it disabled
              >
                AI Story Writer <i className="ri-quill-pen-line text-xl"></i>
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs text-gray-900 font-bold px-2 py-0.5 rounded-full shadow-md border border-yellow-300 animate-pulse" style={{zIndex:2}}>
                  Try Now
                </span>
              </button>
            </div>
            <div className="relative" ref={userDropdownRef}>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <i className="ri-user-line text-primary"></i>
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium text-gray-700">{user?.name || user?.username || 'User'}</div>
                    </div>
                    <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`}></i>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-medium text-gray-800">{user?.name || user?.username || 'User'}</div>
                      </div>
                      
                      <div className="py-2" style={{fontFamily: 'Qurovademo'}}>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="ri-dashboard-line mr-3 text-gray-500"></i>
                          Dashboard
                        </Link>
                        <Link
                          to="/explore"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="ri-compass-line mr-3 text-gray-500"></i>
                          Explore Stories
                        </Link>
                        <Link
                          to="/collections"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="ri-folder-line mr-3 text-gray-500"></i>
                          My Collections
                        </Link>
                        <Link
                          to="/plans"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <i className="ri-vip-crown-line mr-3 text-gray-500"></i>
                          Upgrade Plans
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserDropdown(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          style={{fontFamily: 'Qurovademo'}}
                        >
                          <i className="ri-logout-box-line mr-3"></i>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <i className="ri-login-box-line text-gray-600"></i>
                </Link>
              )}
            </div>
            {!isAuthenticated && (
              <Link to="/signup" className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
                <i className="ri-user-add-line text-xl text-gray-700"></i>
              </Link>
            )}
            {isAuthenticated && (
              <div className="relative mr-2">
                <button
                  className={`relative focus:outline-none ${unreadCount > 0 && !notifSeen ? 'animate-bounce' : ''}`}
                  onClick={handleNotifBellClick}
                  aria-label="Notifications"
                >
                  <i className="ri-notification-3-line text-2xl text-primary"></i>
                  {unreadCount > 0 && !notifSeen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b font-semibold text-gray-700">Notifications</div>
                    <ul className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                      {notifications.length === 0 && (
                        <li className="p-4 text-gray-500 text-center">No notifications</li>
                      )}
                      {notifications.slice(-10).reverse().map((notif, idx) => (
                        <li key={idx} className="p-3 flex items-start space-x-2">
                          <span className="text-primary text-lg">
                            {notif.type === 'follow_request' && <i className="ri-user-add-line"></i>}
                            {notif.type === 'follow_approved' && <i className="ri-user-follow-line"></i>}
                            {(notif.type === 'like' || notif.type === 'story_like') && <i className="ri-heart-3-line"></i>}
                            {/* Add more icons as needed */}
                          </span>
                          <div>
                            <div className="text-sm text-gray-800">{notif.message}</div>
                            {notif.from && notif.from.username && (
                              <div className="text-xs text-gray-500">from {notif.from.username}</div>
                            )}
                            <div className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
          <button className="md:hidden w-10 h-10 flex items-center justify-center" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay & Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-40 transition-opacity" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu overlay"></div>
          {/* Drawer */}
          <div className="ml-auto w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in-right relative">
            <button className="absolute top-4 right-4 text-gray-500 hover:text-primary text-2xl" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
              <i className="ri-close-line"></i>
            </button>
            <Link to="/" className="text-2xl font-['Pacifico'] text-primary mb-8" onClick={() => setMobileMenuOpen(false)}>
              HeartThreads
            </Link>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-none text-sm focus:outline-none mb-2"
                placeholder="Search stories or tags..."
              />
              <div className="absolute left-3 top-3 text-gray-400">
                <i className="ri-search-line"></i>
              </div>
            </form>
            <Link to="/explore" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              Explore
            </Link>
            <Link to="/collections" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
              Collections
            </Link>
            <button className="block w-full bg-primary text-white py-2 rounded-lg font-semibold mt-4 mb-2" onClick={() => { setShowModal(true); setMobileMenuOpen(false); }}>
              Try AI Assistant <i className="ri-quill-pen-line text-xl"></i>
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium mt-2">
                  <i className="ri-logout-box-line mr-2"></i> Sign Out
                </button>
                <button className="block w-full text-left py-2 text-gray-700 hover:text-primary font-medium mt-2 flex items-center" onClick={handleNotifBellClick}>
                  <i className="ri-notification-3-line text-xl mr-2"></i> Notifications
                  {unreadCount > 0 && !notifSeen && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unreadCount}</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" className="block py-2 text-gray-700 hover:text-primary font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* AI Writing Assistant Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="ai-assistant-modal bg-white rounded-xl shadow-xl w-full max-w-7xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-primary/5 to-secondary/5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <i className="ri-robot-line text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-xl">AI Writing Assistant</h3>
                  <p className="text-sm text-gray-600">
                    Let AI help you craft your story
                  </p>
                </div>
              </div>
              <button
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => setShowModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-6">
              {/* Notification Popup */}
              {notification.show && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ${
                  notification.type === 'success' 
                    ? 'bg-green-500 text-white' 
                    : notification.type === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                }`}>
                  <div className="flex items-center space-x-2">
                    <i className={`ri-${notification.type === 'success' ? 'check' : notification.type === 'error' ? 'close' : 'information'}-line`}></i>
                    <span className="font-medium">{notification.message}</span>
                  </div>
                </div>
              )}

              {/* AI Status */}
              {aiStatus && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  aiStatus.success && aiStatus.status === 'available' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <i className={`ri-${aiStatus.success && aiStatus.status === 'available' ? 'check' : 'close'}-line`}></i>
                    <span>{aiStatus.message}</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <i className="ri-error-warning-line"></i>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Topic Input */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  What would you like to write about?
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic, emotion, or experience..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-700"
                  />
                  {topic && (
                    <button
                      onClick={() => setTopic("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>
              {/* Emotional Tone */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Emotional Tone
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {emotionalTones.map((tone) => (
                    <button
                      key={tone.name}
                      onClick={() => setSelectedTone(tone.name)}
                      className={`tag-chip px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                        selectedTone === tone.name
                          ? `bg-${tone.color}-100 text-${tone.color}-700 border-2 border-${tone.color}-300`
                          : `bg-${tone.color}-50 text-${tone.color}-600 hover:bg-${tone.color}-100`
                      }`}
                    >
                      <span>{tone.emoji}</span>
                      <span>{tone.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Writing Style */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-3">
                  Writing Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {writingStyles.map((style) => (
                    <div key={style.id} className="relative">
                      <input
                        type="radio"
                        id={style.id}
                        name="writing-style"
                        className="peer sr-only"
                        checked={selectedStyle === style.name}
                        onChange={() => setSelectedStyle(style.name)}
                      />
                      <label
                        htmlFor={style.id}
                        className="block p-4 bg-gray-50 rounded-lg border-2 border-transparent peer-checked:border-primary peer-checked:bg-primary/5 cursor-pointer hover:bg-gray-100 transition-all duration-200"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{style.icon}</span>
                          <div>
                            <div className="font-medium">{style.name}</div>
                            <div className="text-sm text-gray-500">
                              {style.description}
                            </div>
                          </div>
                        </div>
                        <div className="absolute hidden peer-checked:block top-3 right-3 text-primary">
                          <i className="ri-check-line text-xl"></i>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Length Slider */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <label className="block text-gray-700 font-medium">
                    Story Length
                  </label>
                  <span className="text-gray-500 text-sm">
                    {lengthOptions.find((opt) => opt.value === length)?.words}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="3"
                    value={length}
                    onChange={(e) => setLength(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    {lengthOptions.map((option) => (
                      <span
                        key={option.value}
                        className={
                          length === option.value
                            ? "text-primary font-medium"
                            : ""
                        }
                      >
                        {option.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {/* Generated Prompts */}
              {showPrompts && generatedPrompts.length > 0 && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-3">
                    Suggested Prompts:
                  </h4>
                  <div className="space-y-2">
                    {generatedPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => handlePromptSelect(prompt)}
                        className="block w-full text-left p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm text-blue-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <button
                  className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  onClick={handleGeneratePrompts}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-magic-line"></i>
                      <span>Generate Prompts</span>
                    </>
                  )}
                </button>
                <button
                  className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center space-x-2"
                  onClick={handleGetStarted}
                  disabled={isGeneratingStory}
                >
                  {isGeneratingStory ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      <span>Generating Story...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-arrow-right-line"></i>
                      <span>Generate Story</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Generation Progress */}
              {isGeneratingStory && generationProgress && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <i className="ri-loader-4-line animate-spin text-blue-600"></i>
                    <span className="text-sm text-blue-700">{generationProgress}</span>
                  </div>
                </div>
              )}

              {/* Spacing between sections */}
              <div className="h-8"></div>
              
              {/* Enhanced Generated Story Display */}
              {generatedStory && (
                <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-lg overflow-hidden">
                  {/* Story Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <i className="ri-book-open-line text-lg"></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">Your Generated Story</h4>
                          <p className="text-blue-100 text-sm">Ollama-powered creative writing</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setGeneratedStory(null)}
                        className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="p-6">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                      {/* Story Title and Meta */}
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-b border-gray-200">
                        <h5 className="font-bold text-xl text-gray-800 mb-2">{generatedStory.title}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <i className="ri-file-text-line"></i>
                            <span>{generatedStory.wordCount} words</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="ri-time-line"></i>
                            <span>{generatedStory.estimatedReadTime} min read</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <i className="ri-robot-line"></i>
                            <span>Ollama Generated</span>
                          </div>
                        </div>
                      </div>

                      {/* Story Text */}
                      <div className="p-6">
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                          {generatedStory.content}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(generatedStory.content);
                            showNotification("Story copied to clipboard!", "success");
                          } catch {
                            showNotification("Failed to copy story", "error");
                          }
                        }}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        <i className="ri-clipboard-line"></i>
                        <span>Copy Story</span>
                      </button>
                      <button
                        onClick={() => {
                          // Here you would typically save the story or navigate to edit page
                          console.log('Saving story:', generatedStory);
                          showNotification("Story saved successfully!", "success");
                        }}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <i className="ri-save-line"></i>
                        <span>Save Story</span>
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedStory(null);
                          showNotification("Ready to generate new story!", "success");
                        }}
                        className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                      >
                        <i className="ri-refresh-line"></i>
                        <span>Generate New</span>
                      </button>
                      <button
                        onClick={() => {
                          try {
                            // Download as text file
                            const blob = new Blob([generatedStory.content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${generatedStory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                            showNotification("Story downloaded successfully!", "success");
                          } catch {
                            showNotification("Failed to download story", "error");
                          }
                        }}
                        className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                      >
                        <i className="ri-download-line"></i>
                        <span>Download</span>
                      </button>
                    </div>

                    {/* Story Stats */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold text-gray-800">{generatedStory.wordCount}</div>
                          <div className="text-gray-600">Words</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{generatedStory.estimatedReadTime}</div>
                          <div className="text-gray-600">Min Read</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{Math.ceil(generatedStory.wordCount / 5)}</div>
                          <div className="text-gray-600">Sentences</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{Math.ceil(generatedStory.wordCount / 200)}</div>
                          <div className="text-gray-600">Paragraphs</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Additional Features */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <i className="ri-brain-line text-2xl text-primary mb-2"></i>
                    <div className="text-sm font-medium">Local AI</div>
                    <div className="text-xs text-gray-500">
                      Powered by Ollama
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <i className="ri-time-line text-2xl text-primary mb-2"></i>
                    <div className="text-sm font-medium">Time Estimates</div>
                    <div className="text-xs text-gray-500">
                      Reading time included
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <i className="ri-shield-check-line text-2xl text-primary mb-2"></i>
                    <div className="text-sm font-medium">Privacy First</div>
                    <div className="text-xs text-gray-500">
                      Your stories stay private
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
