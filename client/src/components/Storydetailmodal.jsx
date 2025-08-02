import React, { useEffect, useState } from 'react'
import { getStoryById, toggleBookmark, checkStoryBookmarked } from '../api/stories'
import {
  likeStory,
  addComment,
  deleteComment,
  updateComment,
  toggleCommentLike,
  sendFollowRequest,
  getFollowers
} from '../api/social'

import { useUser } from '../context/UserContext'

const Storydetailmodal = ({ storyId, onClose }) => {
  const { user } = useUser();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [pending, setPending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    comments: 0
  });

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [copyLinkLoading, setCopyLinkLoading] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (!storyId) return;
    const fetchStory = async () => {
      try {
        setLoading(true);
        setError(null);
        const storyData = await getStoryById(storyId);
        setStory(storyData);
        setLiked(storyData.likedBy && user ? storyData.likedBy.includes(user.id) : false);
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story');
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId, user]);

  useEffect(() => {
    if (!story) return;
    
    // Set real-time stats from story data
    setStats({
      views: story.views || 0,
      likes: story.likes || 0,
      comments: story.commentCount || 0
    });
    
    // Set comments from story data (now included in story response)
    if (story.comments) {
      setComments(story.comments);
    }
    
    // Fetch followers for follow state
    if (story.authorId && !story.isAnonymous && user) {
      getFollowers(story.authorId).then(res => {
        setFollowing(res.followers && res.followers.some(f => f._id === user.id));
      });
      setPending(false);
    }
    
    // Check if story is bookmarked
    checkBookmarkStatus();
  }, [story, storyId, user]);


  const checkBookmarkStatus = async () => {
    if (!user || !storyId) return;
    try {
      const isBookmarked = await checkStoryBookmarked(storyId);
      setIsBookmarked(isBookmarked);
    } catch (error) {
      console.warn('Error checking bookmark status:', error);
      setIsBookmarked(false);
    }
  };

  const handleLike = async () => {
    if (!user) return alert('Please log in to like stories.');
    const token = localStorage.getItem('token');
    const res = await likeStory(storyId, token);
    if (res.liked) {
      setLiked(true);
      setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
    } else {
      setLiked(false);
      setStats(prev => ({ ...prev, likes: Math.max(0, prev.likes - 1) }));
    }
  };

  const handleSendFollowRequest = async () => {
    if (!user || !story.authorId || story.isAnonymous) return alert('Please log in to follow authors.');
    const token = localStorage.getItem('token');
    const res = await sendFollowRequest(story.authorId, token);
    setPending(true);
    setNotification({ type: 'success', message: res.message || 'Follow request sent!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment.');
    if (!commentInput.trim()) return;
    
    // Additional validation to prevent dummy content
    const trimmedContent = commentInput.trim();
    if (trimmedContent.length < 2) {
      setNotification({ type: 'error', message: 'Comment must be at least 2 characters long.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    
    // Prevent common dummy content patterns
    const dummyPatterns = [
      'test',
      'dummy',
      'sample',
      'example',
      'placeholder'
    ];
    
    const lowerContent = trimmedContent.toLowerCase();
    if (dummyPatterns.some(pattern => lowerContent.includes(pattern))) {
      setNotification({ type: 'error', message: 'Please write a meaningful comment.' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setCommentLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await addComment(storyId, commentInput, token, replyingTo ? replyingTo.toString() : null);
      
      if (res.comment) {
        setComments([...comments, res.comment]);
        setCommentInput('');
        setReplyingTo(null);
        // Update stats
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        setNotification({ type: 'success', message: 'Comment posted successfully! 💬' });
        setTimeout(() => setNotification(null), 3000);
        
        // Refresh story data to ensure all users see the latest comments
        setTimeout(async () => {
          try {
            const updatedStory = await getStoryById(storyId);
            setStory(updatedStory);
            if (updatedStory.comments) {
              setComments(updatedStory.comments);
            }
          } catch (err) {
            console.error('Error refreshing story data:', err);
          }
        }, 1000);
      } else if (res.reply) {
        // Update the parent comment with the new reply
        setComments(prevComments => {
          const updatedComments = prevComments.map(comment => {
            if (comment._id.toString() === replyingTo?.toString() || comment._id === replyingTo) {
              return { 
                ...comment, 
                replies: [...(comment.replies || []), res.reply] 
              };
            }
            return comment;
          });
          return updatedComments;
        });
        
        setCommentInput('');
        setReplyingTo(null);
        // Update stats for replies too
        setStats(prev => ({ ...prev, comments: prev.comments + 1 }));
        setNotification({ type: 'success', message: 'Reply posted successfully! 💬' });
        setTimeout(() => setNotification(null), 3000);
        
        // Refresh story data to ensure all users see the latest comments
        setTimeout(async () => {
          try {
            const updatedStory = await getStoryById(storyId);
            setStory(updatedStory);
            if (updatedStory.comments) {
              setComments(updatedStory.comments);
            }
          } catch (err) {
            console.error('Error refreshing story data:', err);
          }
        }, 1000);
      } else {
        console.error('Unexpected response format:', res);
        setNotification({ type: 'error', message: 'Unexpected response from server.' });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setNotification({ type: 'error', message: 'Failed to post comment. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = (commentId, username) => {
    setReplyingTo(commentId);
    setCommentInput(`@${username} `);
    
    // Focus the comment input after a short delay to ensure state is updated
    setTimeout(() => {
      const commentInput = document.getElementById('comment-input');
      if (commentInput) {
        commentInput.focus();
        commentInput.setSelectionRange(commentInput.value.length, commentInput.value.length);
      }
    }, 100);
  };

  const handleEditComment = async (commentId, content, replyId = null) => {
    if (!editContent.trim()) return;
    const token = localStorage.getItem('token');
    
    try {
      await updateComment(storyId, commentId, editContent, token, replyId);
      
      if (replyId) {
        // Update reply in comments
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? {
                  ...comment,
                  replies: comment.replies.map(reply => 
                    reply._id === replyId 
                      ? { ...reply, content: editContent, isEdited: true }
                      : reply
                  )
                }
              : comment
          )
        );
      } else {
        // Update comment
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, content: editContent, isEdited: true }
              : comment
          )
        );
      }
      
      setEditingComment(null);
      setEditContent('');
      setNotification({ type: 'success', message: 'Comment updated successfully! ✏️' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error updating comment:', err);
      setNotification({ type: 'error', message: 'Failed to update comment. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleDeleteComment = async (commentId, replyId = null) => {
    if (!user) return;
    
    // Add confirmation dialog
    const isReply = replyId !== null;
    const confirmMessage = isReply 
      ? 'Are you sure you want to delete this reply?' 
      : 'Are you sure you want to delete this comment?';
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    console.log('=== Frontend Delete Request ===');
    console.log('StoryId:', storyId);
    console.log('CommentId:', commentId);
    console.log('ReplyId:', replyId);
    console.log('IsReply:', isReply);
    
    const token = localStorage.getItem('token');
    
    try {
      console.log('Making delete request...');
      const response = await deleteComment(storyId, commentId, token, replyId);
      console.log('Delete response:', response);
      
      if (replyId) {
        // Remove reply from comments (ensure string comparison)
        setComments(prevComments => {
          console.log('Previous comments:', prevComments.length);
          const updatedComments = prevComments.map(comment => {
            if (comment._id === commentId) {
              console.log('Found matching comment, replies before:', comment.replies?.length || 0);
              const filteredReplies = (comment.replies || []).filter(reply => reply._id.toString() !== replyId.toString());
              console.log('Replies after filtering:', filteredReplies.length);
              return {
                ...comment,
                replies: filteredReplies
              };
            }
            return comment;
          });
          console.log('Updated comments:', updatedComments.length);
          return updatedComments;
        });
        // Refetch story/comments for full sync
        setTimeout(async () => {
          try {
            console.log('Refetching story data...');
            const updatedStory = await getStoryById(storyId);
            setStory(updatedStory);
            if (updatedStory.comments) {
              setComments(updatedStory.comments);
            }
          } catch (err) {
            console.error('Error refreshing story data:', err);
          }
        }, 500);
      } else {
        // Remove comment
        setComments(prevComments => prevComments.filter(c => c._id !== commentId));
        // Update stats
        setStats(prev => ({ ...prev, comments: prev.comments - 1 }));
      }
      
      setNotification({ type: 'success', message: replyId ? 'Reply deleted successfully! 🗑️' : 'Comment deleted successfully! 🗑️' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setNotification({ type: 'error', message: 'Failed to delete comment. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCommentLike = async (commentId, replyId = null) => {
    if (!user) return alert('Please log in to like comments.');
    const token = localStorage.getItem('token');
    
    try {
      const res = await toggleCommentLike(storyId, commentId, token, replyId);
      
      if (replyId) {
        // Update reply like status
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? {
                  ...comment,
                  replies: comment.replies.map(reply => 
                    reply._id === replyId 
                      ? { ...reply, likes: res.likes, likedBy: res.isLiked ? [...reply.likedBy, user.id] : reply.likedBy.filter(id => id !== user.id) }
                      : reply
                  )
                }
              : comment
          )
        );
      } else {
        // Update comment like status
        setComments(prevComments => 
          prevComments.map(comment => 
            comment._id === commentId 
              ? { ...comment, likes: res.likes, likedBy: res.isLiked ? [...comment.likedBy, user.id] : comment.likedBy.filter(id => id !== user.id) }
              : comment
          )
        );
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      setNotification({ type: 'error', message: 'Failed to like comment. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    }
  };


  const handleBookmark = async () => {
    if (!user) return alert('Please log in to bookmark stories.');
    if (bookmarkLoading) return;
    
    setBookmarkLoading(true);
    try {
      const res = await toggleBookmark(storyId);
      setIsBookmarked(res.bookmarked);
      setNotification({ 
        type: 'success', 
        message: res.bookmarked 
          ? `"${story.title}" added to bookmarks! 📚` 
          : `"${story.title}" removed from bookmarks! 📚` 
      });
      setTimeout(() => setNotification(null), 3000);
      
      // Trigger a custom event to refresh dashboard bookmarks
      window.dispatchEvent(new CustomEvent('bookmarkUpdated'));
    } catch (error) {
      setNotification({ type: 'error', message: error.message || 'Failed to bookmark.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: 'ri-link',
      action: async () => {
        setCopyLinkLoading(true);
        try {
          // Create a more specific URL for the story
          const storyUrl = `${window.location.origin}/story/${storyId}`;
          
          // Try to use the modern clipboard API
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(storyUrl);
            setNotification({ 
              type: 'success', 
              message: 'Story link copied to clipboard! 📋' 
            });
          } else {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement('textarea');
            textArea.value = storyUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setNotification({ 
              type: 'success', 
              message: 'Story link copied to clipboard! 📋' 
            });
          }
          setTimeout(() => setNotification(null), 3000);
          setShowShareModal(false);
        } catch (error) {
          console.error('Failed to copy link:', error);
          setNotification({ 
            type: 'error', 
            message: 'Failed to copy link. Please try again.' 
          });
          setTimeout(() => setNotification(null), 3000);
        } finally {
          setCopyLinkLoading(false);
        }
      }
    },
    {
      name: 'Twitter',
      icon: 'ri-twitter-fill',
      action: () => {
        const text = `Check out this amazing story: ${story.title}`;
        const url = window.location.href;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        setShowShareModal(false);
      }
    },
    {
      name: 'Facebook',
      icon: 'ri-facebook-fill',
      action: () => {
        const url = window.location.href;
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        setShowShareModal(false);
      }
    },
    {
      name: 'LinkedIn',
      icon: 'ri-linkedin-fill',
      action: () => {
        const url = window.location.href;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        setShowShareModal(false);
      }
    },
    {
      name: 'WhatsApp',
      icon: 'ri-whatsapp-fill',
      action: () => {
        const text = `Check out this amazing story: ${story.title} - ${window.location.href}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setShowShareModal(false);
      }
    },
    {
      name: 'Email',
      icon: 'ri-mail-fill',
      action: () => {
        const subject = `Check out this story: ${story.title}`;
        const body = `I thought you might enjoy this story: ${story.title}\n\nRead it here: ${window.location.href}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setShowShareModal(false);
      }
    }
  ];

  useEffect(() => {
    if (!story) return;
    
    // Reading progress tracking
    const handleScroll = () => {
      const modal = document.getElementById("story-detail-modal");
      if (modal) {
        const scrollTop = modal.scrollTop;
        const scrollHeight = modal.scrollHeight - modal.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        setReadingProgress(Math.min(progress, 100));
        setShowBackToTop(scrollTop > 300);
      }
    };

    const modal = document.getElementById("story-detail-modal");
    if (modal) {
      modal.addEventListener('scroll', handleScroll);
    }

    // Selectors
    const aiAssistantModal = document.getElementById("ai-assistant-modal");
    const closeAiModal = document.getElementById("close-ai-modal");
    const storyDetailModal = document.getElementById("story-detail-modal");
    const closeStoryModal = document.getElementById("close-story-modal");
    // --- Story Detail Modal: Open/Close, Like, Comment, Reaction, Reply ---

    // --- 2. Like Buttons for Comments ---
    function handleCommentLike(e) {
      const btn = e.currentTarget;
      const liked = btn.getAttribute("data-liked") === "true";
      const countSpan = btn.querySelector(".comment-like-count");
      let count = parseInt(btn.getAttribute("data-count") || "0", 10);

      if (!liked) {
        btn.setAttribute("data-liked", "true");
        btn.classList.add("text-primary");
        btn.querySelector("i").classList.remove("ri-heart-line");
        btn.querySelector("i").classList.add("ri-heart-fill");
        count += 1;
      } else {
        btn.setAttribute("data-liked", "false");
        btn.classList.remove("text-primary");
        btn.querySelector("i").classList.remove("ri-heart-fill");
        btn.querySelector("i").classList.add("ri-heart-line");
        count -= 1;
      }
      btn.setAttribute("data-count", count);
      if (countSpan) countSpan.textContent = count;
    }

    function attachCommentLikeListeners() {
      const likeBtns = document.querySelectorAll(".comment-like-button");
      likeBtns.forEach((btn) => {
        btn.removeEventListener("click", handleCommentLike);
        btn.addEventListener("click", handleCommentLike);
      });
    }
    attachCommentLikeListeners();

    // --- 3. Emoji Reactions ---
    function handleReactionClick(e) {
      const btn = e.currentTarget;
      const countSpan = btn.querySelector("span.text-gray-700");
      let count = parseInt(countSpan.textContent, 10);
      // Toggle reaction (for demo, just increment once)
      if (!btn.classList.contains("bg-primary/10")) {
        btn.classList.add("bg-primary/10", "text-primary");
        countSpan.textContent = count + 1;
      } else {
        btn.classList.remove("bg-primary/10", "text-primary");
        countSpan.textContent = count - 1;
      }
    }
    function attachReactionListeners() {
      const reactionBtns = document.querySelectorAll(".emoji-reaction");
      reactionBtns.forEach((btn) => {
        btn.removeEventListener("click", handleReactionClick);
        btn.addEventListener("click", handleReactionClick);
      });
    }
    attachReactionListeners();

    // --- 4. Comment Form: Character Count, Enable/Disable, Submit ---
    const commentInput = document.getElementById("comment-input");
    const charCount = document.getElementById("char-count");
    const commentForm = document.getElementById("comment-form");
    const commentsContainer = document.getElementById("comments-container");
    if (commentInput && charCount && commentForm && commentsContainer) {
      // Remove old DOM-based input handling - React state handles this now

      // Remove the old DOM-based form submission handler
      // The form will use React's handleCommentSubmit function instead
    }

    // Remove old DOM-based reply handling - React state handles this now

    // --- 6. Re-attach listeners on modal open (for dynamic content) ---
    if (storyDetailModal) {
      storyDetailModal.addEventListener("transitionend", () => {
        attachCommentLikeListeners();
        attachReactionListeners();
        // React state handles reply functionality now
      });
    }

    // Close AI Assistant Modal
    const handleCloseAiModal = () => {
      aiAssistantModal?.classList.add("hidden");
    };
    if (closeAiModal) {
      closeAiModal.addEventListener("click", handleCloseAiModal);
    }

    // Close Story Detail Modal
    const handleCloseStoryModal = () => {
      storyDetailModal?.classList.add("hidden");
      document.body.style.overflow = "";
    };
    if (closeStoryModal) {
      closeStoryModal.addEventListener("click", handleCloseStoryModal);
    }

    // AI Assistant Button Triggers
    const aiAssistantButtons = document.querySelectorAll(
      "button:not(#close-ai-modal):not(#close-story-modal)"
    );
    const handleAiAssistantButton = () => {
      aiAssistantModal?.classList.remove("hidden");
    };
    aiAssistantButtons.forEach((button) => {
      if (button.textContent.includes("AI Assistant")) {
        button.addEventListener("click", handleAiAssistantButton);
      }
    });

    // Cleanup to avoid memory leaks
    return () => {
      if (closeAiModal) closeAiModal.removeEventListener("click", handleCloseAiModal);
      if (closeStoryModal) closeStoryModal.removeEventListener("click", handleCloseStoryModal);
      aiAssistantButtons.forEach((button) => {
        if (button.textContent.includes("AI Assistant")) {
          button.removeEventListener("click", handleAiAssistantButton);
        }
      });
      if (modal) {
        modal.removeEventListener('scroll', handleScroll);
      }
    };
  }, [story]);

  if (!storyId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <>
    <style jsx>{`
      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3) translateY(-50px);
        }
        50% {
          opacity: 1;
          transform: scale(1.05) translateY(0);
        }
        70% {
          transform: scale(0.9) translateY(0);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      .animate-bounce-in {
        animation: bounceIn 0.6s ease-out;
      }
      
      .story-content .prose p {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .story-content .prose p:hover {
        transform: translateX(4px);
        background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
        padding-left: 8px;
        border-radius: 8px;
      }
      
      .story-content .prose p:first-child::before {
        content: '';
        position: absolute;
        left: -20px;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 2px;
      }
      
      .story-content .prose p:nth-child(even) {
        background: rgba(249, 250, 251, 0.5);
        padding: 16px;
        border-radius: 12px;
        margin: 20px 0;
        border-left: 4px solid #e5e7eb;
      }
      
      .story-content .prose p:nth-child(odd):not(:first-child) {
        background: rgba(255, 255, 255, 0.8);
        padding: 16px;
        border-radius: 12px;
        margin: 20px 0;
        border-left: 4px solid #3b82f6;
      }
      
      @media (max-width: 768px) {
        .story-content .prose p {
          font-size: 16px;
          line-height: 1.7;
        }
        
        .story-content .prose p:first-letter {
          font-size: 2.5rem;
        }
      }
      
      @media (min-width: 1200px) {
        .story-content .prose p {
          font-size: 20px;
          line-height: 1.8;
        }
        
        .story-content .prose p:first-letter {
          font-size: 3.5rem;
        }
      }
    `}</style>
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
            <p className="text-xs opacity-90">
              {notification.type === 'success' ? 'Action completed successfully!' : 'Something went wrong'}
            </p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="w-6 h-6 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-3000 ease-linear" style={{ width: '100%' }}></div>
        </div>
      </div>
    )}
    
    {/* Reading Progress Bar */}
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
      <div 
        className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 ease-out"
        style={{ width: `${readingProgress}%` }}
      ></div>
    </div>

    {/* Floating Action Buttons */}
    <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => {
            const modal = document.getElementById("story-detail-modal");
            if (modal) {
              modal.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 flex items-center justify-center"
          title="Back to top"
        >
          <i className="ri-arrow-up-line text-lg"></i>
        </button>
      )}
      
      {/* Quick Share Button */}
      <button
        onClick={handleShare}
        className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 flex items-center justify-center"
        title="Share story"
      >
        <i className="ri-share-line text-lg"></i>
      </button>
      
      {/* Quick Bookmark Button */}
      <button
        onClick={handleBookmark}
        disabled={bookmarkLoading}
        className={`w-12 h-12 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center ${
          bookmarkLoading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : isBookmarked 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
        title={bookmarkLoading ? 'Processing...' : (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks')}
      >
        {bookmarkLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
        ) : (
          <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'} text-lg`}></i>
        )}
      </button>
    </div>

    {/* Story Detail Modal (Hidden by default) */}
    <div
      id="story-detail-modal"
      className="fixed inset-0 bg-white z-50 overflow-auto"
    >
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <button
            id="close-story-modal"
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"
            onClick={onClose}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="flex space-x-4">
            <button
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                bookmarkLoading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : isBookmarked 
                    ? 'bg-primary text-white shadow-lg scale-105 animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white hover:scale-105'
              }`}
              onClick={handleBookmark}
              disabled={bookmarkLoading}
              title={bookmarkLoading ? 'Processing...' : (isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks')}
            >
              {bookmarkLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <i className={`${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'} transition-all duration-300 ${isBookmarked ? 'animate-bounce' : ''}`}></i>
              )}
            </button>
            <button
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors duration-200"
              onClick={handleShare}
              title="Share story"
            >
              <i className="ri-share-line"></i>
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full ${
                  story.isAnonymous 
                    ? 'bg-gray-100' 
                    : `bg-${story.authorColor}-100`
                } flex items-center justify-center`}
              >
                {story.isAnonymous ? (
                  <i className="ri-user-line text-gray-600 text-sm"></i>
                ) : (
                  <span className={`text-${story.authorColor}-600 text-xs font-medium`}>{story.authorInitials}</span>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <div className={`font-medium ${
                    story.isAnonymous ? 'text-gray-800' : 'text-gray-800'
                  }`}>
                    {story.isAnonymous ? (
                      <>
                        <i className="ri-user-line mr-1"></i>
                        Anonymous Author
                      </>
                    ) : (
                      story.author
                    )}
                  </div>
                  {story.isAnonymous && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      Anonymous
                    </span>
                  )}
                </div>
                {story.isAnonymous && story.originalAuthor && (
                  <div className="text-sm text-gray-600 mt-1">
                    Originally by: {story.originalAuthor}
                  </div>
                )}
                <div className="text-gray-500 text-sm">
                  {story.publishedAt} · Reading time {story.readTime} min 
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <button
                  className={`detail-like-button w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${liked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                  onClick={handleLike}
                >
                  <i className={liked ? 'ri-heart-fill' : 'ri-heart-line'}></i>
                </button>
                <span className="text-sm text-gray-500 detail-like-count">{stats.likes}</span>
              </div>
              {!story.isAnonymous && story.authorId && user && story.authorId !== user.id && (
                <button
                  className={`detail-follow-button px-4 py-2 !rounded-button bg-primary text-white hover:bg-opacity-90 transition-colors duration-200 ${following ? 'opacity-70' : ''}`}
                  disabled={pending}
                  onClick={() => {
                    if (following) handleSendFollowRequest();
                    else if (!pending) handleSendFollowRequest();
                  }}
                >
                  {following ? 'Unfollow' : pending ? 'Requested' : 'Request to Follow'}
                </button>
              )}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {story.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-8">
            {story.tags.map((tag, idx) => (
              <span
                key={idx}
                className="tag-chip bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="story-content w-full text-gray-700 mb-10">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-10 shadow-sm border border-gray-100">
              <div className="prose prose-xl max-w-none">
                <div className="text-gray-800 leading-relaxed text-xl font-light max-w-4xl mx-auto">
                  {story.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-6 text-gray-700 leading-8 first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:mr-2 first-letter:float-left">
                        {paragraph}
                      </p>
                    ) : null
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Dynamic Share Section */}
          <div className="border-t border-gray-100 pt-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Share this story</h3>
              <span className="text-sm text-gray-500">Help others discover this story</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Quick Share Buttons */}
              <button
                onClick={() => {
                  const text = `Check out this amazing story: ${story.title}`;
                  const url = `${window.location.origin}/story/${storyId}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <i className="ri-twitter-fill"></i>
                <span className="text-sm font-medium">Twitter</span>
              </button>
              
              <button
                onClick={() => {
                  const url = `${window.location.origin}/story/${storyId}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <i className="ri-facebook-fill"></i>
                <span className="text-sm font-medium">Facebook</span>
              </button>
              
              <button
                onClick={() => {
                  const text = `Check out this amazing story: ${story.title} - ${window.location.origin}/story/${storyId}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <i className="ri-whatsapp-fill"></i>
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              
              <button
                onClick={() => {
                  const url = `${window.location.origin}/story/${storyId}`;
                  navigator.clipboard.writeText(url).then(() => {
                    setNotification({ 
                      type: 'success', 
                      message: 'Story link copied to clipboard! 📋' 
                    });
                    setTimeout(() => setNotification(null), 3000);
                  }).catch(() => {
                    setNotification({ 
                      type: 'error', 
                      message: 'Failed to copy link. Please try again.' 
                    });
                    setTimeout(() => setNotification(null), 3000);
                  });
                }}
                className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <i className="ri-link"></i>
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>
            
            {/* Share Stats */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>📊 Real-time Story Stats</span>
                <div className="flex items-center space-x-4">
                  <span>👁️ {stats.views} views</span>
                  <span>❤️ {stats.likes} likes</span>
                  <span>💬 {stats.comments} comments</span>
                  <span>📖 {story.readTime} min read</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-800">Comments</h3>
              <span className="text-gray-500 text-sm comment-count">
                {stats.comments} comments
                {comments.some(c => c.replies && c.replies.length > 0) && (
                  <span className="text-blue-500 ml-1">
                    ({comments.reduce((total, c) => total + (c.replies?.length || 0), 0)} replies)
                  </span>
                )}
              </span>
            </div>
            <div className="mb-6">
              <form id="comment-form" className="space-y-4" onSubmit={handleCommentSubmit}>
                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0"
                  >
                    <i className="ri-user-line text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    {replyingTo && (
                      <div className="mb-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <i className="ri-reply-line text-blue-600"></i>
                            <span className="text-sm font-medium text-blue-700">
                              Replying to a comment
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setCommentInput('');
                            }}
                            className="text-blue-500 hover:text-blue-700 transition-colors duration-200"
                            title="Cancel reply"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      </div>
                    )}
                    <textarea
                      id="comment-input"
                      placeholder={replyingTo ? "Write your reply..." : "Share your thoughts..."}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 text-sm resize-none"
                      rows="3"
                      value={commentInput}
                      onChange={e => {
                        const value = e.target.value;
                        // Limit to 500 characters
                        if (value.length <= 500) {
                          setCommentInput(value);
                        }
                      }}
                      maxLength={500}
                      disabled={commentLoading}
                    ></textarea>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-gray-500">
                        <span>{commentInput.length}</span>/500 characters
                      </div>
                      <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 !rounded-button text-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        disabled={!commentInput.trim() || commentLoading || commentInput.length > 500}
                      >
                        {commentLoading && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        <span>
                          {commentLoading 
                            ? (replyingTo ? 'Posting Reply...' : 'Posting...') 
                            : (replyingTo ? 'Reply' : 'Post')
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="space-y-6" id="comments-container" key={`comments-${comments.length}-${comments.reduce((total, c) => total + (c.replies?.length || 0), 0)}`}>
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment._id} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                  replyingTo === comment._id ? 'bg-blue-50 border border-blue-200' : ''
                }`}>
                  <div
                    className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-purple-600 text-xs font-medium">
                      {comment.user && comment.user.username ? comment.user.username[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {comment.user && comment.user.isAnonymous ? 'Anonymous' : (comment.user && comment.user.username ? comment.user.username : 'User')}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        {comment.isEdited && <span className="text-xs text-gray-400 ml-1">(edited)</span>}
                      </span>
                      {(user && comment.user && comment.user._id === user.id) || (user && story.authorId === user.id) ? (
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-xs text-blue-500 hover:underline"
                            onClick={() => {
                              setEditingComment(comment._id);
                              setEditContent(comment.content);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs text-red-500 hover:underline"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                    
                    {editingComment === comment._id ? (
                      <div className="mb-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 text-sm resize-none"
                          rows="2"
                          maxLength={500}
                        />
                        <div className="flex items-center space-x-2 mt-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                            className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                    )}
 
                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={() => handleCommentLike(comment._id)}
                        className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${
                          comment.likedBy && comment.likedBy.includes(user?.id) 
                            ? 'text-red-500' 
                            : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <i className={`${comment.likedBy && comment.likedBy.includes(user?.id) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleReply(comment._id, comment.user?.username || 'User')}
                        className={`text-sm transition-all duration-200 flex items-center space-x-1 ${
                          replyingTo === comment._id 
                            ? 'text-primary font-medium' 
                            : 'text-gray-500 hover:text-primary'
                        }`}
                        title="Reply to this comment"
                      >
                        <i className="ri-reply-line"></i>
                        <span>Reply</span>
                      </button>

                    </div>
                    
                    {/* Replies */}
                    {(comment.replies && comment.replies.length > 0) && (
                      <div className="ml-6 space-y-3 border-l-2 border-blue-200 pl-4 mt-3">
                        <div className="text-xs text-gray-500 mb-2 font-medium">
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </div>

                        {comment.replies.map((reply) => (
                          <div key={reply._id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-blue-600 text-xs font-medium">
                                {reply.user && reply.user.username ? reply.user.username[0].toUpperCase() : 'U'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-800 text-sm">
                                  {reply.user && reply.user.isAnonymous ? 'Anonymous' : (reply.user && reply.user.username ? reply.user.username : 'User')}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {new Date(reply.createdAt).toLocaleDateString()} at {new Date(reply.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  {reply.isEdited && <span className="text-xs text-gray-400 ml-1">(edited)</span>}
                                </span>
                                {(user && reply.user && reply.user._id === user.id) || (user && story.authorId === user.id) ? (
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className="text-xs text-blue-500 hover:underline"
                                      onClick={() => {
                                        setEditingComment(`${comment._id}-${reply._id}`);
                                        setEditContent(reply.content);
                                      }}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="text-xs text-red-500 hover:underline"
                                      onClick={() => handleDeleteComment(comment._id, reply._id)}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ) : null}
                              </div>
                              
                              {editingComment === `${comment._id}-${reply._id}` ? (
                                <div className="mb-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 text-sm resize-none"
                                    rows="2"
                                    maxLength={500}
                                  />
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => handleEditComment(comment._id, editContent, reply._id)}
                                      className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/90"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditContent('');
                                      }}
                                      className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                              )}
                              
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleCommentLike(comment._id, reply._id)}
                                  className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${
                                    reply.likedBy && reply.likedBy.includes(user?.id) 
                                      ? 'text-red-500' 
                                      : 'text-gray-500 hover:text-red-500'
                                  }`}
                                >
                                  <i className={`${reply.likedBy && reply.likedBy.includes(user?.id) ? 'ri-heart-fill' : 'ri-heart-line'}`}></i>
                                  <span>{reply.likes || 0}</span>
                                </button>
                                <button
                                  onClick={() => handleReply(comment._id, reply.user?.username || 'User')}
                                  className="text-xs text-gray-500 hover:text-primary transition-colors duration-200 flex items-center space-x-1"
                                  title="Reply to this reply"
                                >
                                  <i className="ri-reply-line"></i>
                                  <span>Reply</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-gray-500">No comments yet. Be the first to comment!</div>
              )}
            </div>
          </div>
          {/* Author Information & Actions */}
          {story.authorId && (
            <div className="mb-10 p-6 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full bg-${story.authorColor}-100 flex items-center justify-center`}>
                    <span className={`text-${story.authorColor}-600 text-xl font-bold`}>{story.authorInitials}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {story.isAnonymous ? 'Anonymous Author' : story.author}
                    </h3>
                    <p className="text-gray-600">
                      {story.isAnonymous ? 'Anonymous Storyteller' : 'Story author'}
                    </p>
                    {story.isAnonymous && story.originalAuthor && (
                      <p className="text-sm text-gray-500 mt-1">
                        Originally by: {story.originalAuthor}
                      </p>
                    )}
                    {!story.isAnonymous && (
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>📝 {story.authorStories || 0} stories</span>
                        <span>👥 {story.authorFollowers || 0} followers</span>
                        <span>📅 Joined {story.authorJoined || 'Recently'}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-3">
                  {/* Only show follow button if user is not the author */}
                  {user && story.authorId !== user.id && (
                  <button
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      story.isAnonymous
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : following 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                          : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                    onClick={handleSendFollowRequest}
                    disabled={pending || story.isAnonymous}
                    title={story.isAnonymous ? 'Cannot follow anonymous authors' : 'Follow this author'}
                  >
                    {story.isAnonymous ? 'Anonymous' : (following ? 'Following' : pending ? 'Requested' : 'Follow Author')}
                  </button>
                  )}
                  <button
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      !story.authorId || story.isAnonymous
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      // Navigate to author profile in same tab
                      if (story.authorId && !story.isAnonymous) {
                        window.location.href = `/author/${story.authorId}`;
                      }
                    }}
                    disabled={!story.authorId || story.isAnonymous}
                    title={story.isAnonymous ? 'Anonymous authors don\'t have profiles' : 'View author profile'}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reading Time & Difficulty */}
          <div className="mb-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <i className="ri-time-line text-blue-600"></i>
                  <span className="text-blue-800 font-medium">{story.readTime} min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-speed-line text-blue-600"></i>
                  <span className="text-blue-800 font-medium">
                    {story.readTime <= 3 ? 'Quick Read' : 
                     story.readTime <= 8 ? 'Medium Read' : 'Long Read'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-eye-line text-blue-600"></i>
                  <span className="text-blue-800 font-medium">{stats.views} views</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">Published {story.publishedAt}</p>
                <p className="text-xs text-blue-500">Last updated {story.updatedAt || story.publishedAt}</p>
              </div>
            </div>
          </div>
          {/* Related Stories Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Related Stories</h3>
              <span className="text-sm text-gray-500">Based on tags and themes</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {story.tags.slice(0, 4).map((tag, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="tag-chip bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                    <span className="text-gray-500 text-xs">~3 min read</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    More stories about {tag.toLowerCase()}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Discover other stories exploring similar themes and topics.
                  </p>
                  <button
                    className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1"
                    onClick={() => {
                      // Navigate to tag search
                      window.open(`/explore?tags=${encodeURIComponent(tag)}`, '_blank');
                    }}
                  >
                    <span>Explore {tag}</span>
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reading Recommendations */}
          <div className="mb-10">
            <h3 className="font-bold text-gray-800 mb-4">
              Recommended for you
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 flex items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="tag-chip bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                      Personal Growth
                    </span>
                    <span className="text-gray-500 text-xs">5 min read</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    The Art of Mindful Living
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Simple practices to bring more awareness and peace into your daily life.
                  </p>
                </div>
                <div className="ml-4">
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-200 hover:bg-purple-50 transition-colors duration-200">
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 flex items-center">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="tag-chip bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                      Relationships
                    </span>
                    <span className="text-gray-500 text-xs">4 min read</span>
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">
                    Building Meaningful Connections
                  </h4>
                  <p className="text-gray-600 text-sm">
                    How to cultivate deeper, more authentic relationships in the digital age.
                  </p>
                </div>
                <div className="ml-4">
                  <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-200 hover:bg-blue-50 transition-colors duration-200">
                    <i className="ri-arrow-right-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Share Modal */}
    {showShareModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Share Story</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {shareOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.action}
                disabled={option.name === 'Copy Link' && copyLinkLoading}
                className={`flex flex-col items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all duration-200 transform ${
                  option.name === 'Copy Link' && copyLinkLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {option.name === 'Copy Link' && copyLinkLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                ) : (
                  <i className={`${option.icon} text-2xl mb-2 ${
                    option.name === 'Twitter' ? 'text-blue-500' :
                    option.name === 'Facebook' ? 'text-blue-600' :
                    option.name === 'LinkedIn' ? 'text-blue-700' :
                    option.name === 'WhatsApp' ? 'text-green-500' :
                    option.name === 'Email' ? 'text-gray-600' :
                    'text-primary'
                  }`}></i>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {option.name === 'Copy Link' && copyLinkLoading ? 'Copying...' : option.name}
                </span>
                {option.name === 'Copy Link' && !copyLinkLoading && (
                  <span className="text-xs text-gray-500 mt-1">Click to copy</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Storydetailmodal