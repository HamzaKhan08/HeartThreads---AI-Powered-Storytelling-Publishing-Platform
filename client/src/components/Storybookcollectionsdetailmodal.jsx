import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getBookById, likeBook } from '../api/stories';
import { io } from 'socket.io-client';

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

const Storybookcollectionsdetailmodal = ({ open, onClose, book }) => {
  const { user, token } = useUser();
  const [currentPage, setCurrentPage] = useState(0);
  const [shareFeedback, setShareFeedback] = useState('');
  const [currentBook, setCurrentBook] = useState(book);
  const [likes, setLikes] = useState(book?.likes || 0);
  const [liked, setLiked] = useState(book?.likedByCurrentUser || false);
  const [likeLoading, setLikeLoading] = useState(false);

  // Fetch latest book data on open or when book._id changes
  useEffect(() => {
    const fetchBook = async () => {
      if (open && book?._id) {
        try {
          const fresh = await getBookById(book._id);
          setCurrentBook(fresh);
          setLikes(fresh.likes || 0);
          setLiked(fresh.likedByCurrentUser || false);
        } catch {
          setCurrentBook(book);
          setLikes(book.likes || 0);
          setLiked(book.likedByCurrentUser || false);
        }
      } else {
        setCurrentBook(book);
        setLikes(book?.likes || 0);
        setLiked(book?.likedByCurrentUser || false);
      }
    };
    fetchBook();
  }, [open, book, user]);

  // Socket.IO for real-time like updates
  useEffect(() => {
    if (!open) return;
    
    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket'],
      withCredentials: true
    });

    const handleLikeEvent = (data) => {
      if (data.bookId === currentBook?._id) {
        setLikes(data.likes);
        setLiked(data.likedBy.includes(user?._id));
      }
    };

    const handleUnlikeEvent = (data) => {
      if (data.bookId === currentBook?._id) {
        setLikes(data.likes);
        setLiked(data.likedBy.includes(user?._id));
      }
    };

    s.on('bookLiked', handleLikeEvent);
    s.on('bookUnliked', handleUnlikeEvent);

    return () => {
      s.off('bookLiked', handleLikeEvent);
      s.off('bookUnliked', handleUnlikeEvent);
      s.disconnect();
    };
  }, [open, currentBook?._id, user?._id]);

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

  if (!open || !book) return null;

  // Defensive: If currentBook is not loaded yet, show loading
  if (!currentBook) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
        <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <div className="text-gray-500 text-lg font-semibold">Loading book...</div>
          <button onClick={onClose} className="mt-6 px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Close</button>
        </div>
      </div>
    );
  }

  // Defensive: If chapters is not an array, fallback to empty array
  const chapters = Array.isArray(currentBook.chapters) ? currentBook.chapters : [];

  const handlePrev = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(chapters.length - 1, p + 1));

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareFeedback('Link copied!');
      setTimeout(() => setShareFeedback(''), 1500);
    } catch {
      setShareFeedback('Failed to copy');
      setTimeout(() => setShareFeedback(''), 1500);
    }
  };

  const handleLike = async () => {
    if (likeLoading || !token || !currentBook?._id) return;
    
    setLikeLoading(true);
    // Optimistic UI update
    setLiked((prev) => !prev);
    setLikes((prev) => prev + (liked ? -1 : 1));
    
    try {
      const res = await likeBook(currentBook._id, token);
      // Update UI based on API response
      if (typeof res.liked === 'boolean') setLiked(res.liked);
      if (typeof res.likes === 'number') setLikes(res.likes);
    } catch {
      // Revert optimistic update on error
      setLiked((prev) => !prev);
      setLikes((prev) => prev + (liked ? 1 : -1));
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-black/40 backdrop-blur-sm transition-all">
      <div className="relative w-full h-full bg-gradient-to-br from-white via-gray-50 to-purple-50 rounded-none shadow-none overflow-y-auto animate-fadeInUp flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 z-10"
          aria-label="Close"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
        {/* Book Cover and Info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-8 pb-0">
          <div className="flex-shrink-0 w-32 h-44 bg-gradient-to-b from-purple-200 to-pink-100 rounded-xl shadow-lg border border-gray-200 flex items-center justify-center mb-4 md:mb-0">
            <i className="ri-book-3-line text-4xl text-primary"></i>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-serif font-extrabold text-gray-800 mb-2 leading-tight">
              {currentBook.title}
            </h2>
            <div className="text-lg text-gray-500 font-medium mb-2">
              by {currentBook.author}
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
              {currentBook.tags && currentBook.tags.map((tag, idx) => (
                <span key={idx} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                  {tag}
                </span>
              ))}
            </div>
            <div className="text-sm text-gray-400 mb-2">
              {currentBook.bookCount ? `${currentBook.bookCount} chapters` : `${chapters.length} chapters`}
            </div>
            {/* Created Date and Share */}
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-2">
              {currentBook.createdAt && (
                <span className="text-xs text-gray-400">
                  Created {timeAgo(currentBook.createdAt)}
                </span>
              )}
              <button
                onClick={handleLike}
                disabled={likeLoading || !token}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold hover:bg-red-100 hover:text-red-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Like"
              >
                <i className={`ri-heart-${liked ? 'fill text-red-500' : 'line'}`}></i>
                {likes} {likes === 1 ? 'like' : 'likes'}
                {likeLoading && <div className="animate-spin rounded-full h-3 w-3 border-b border-current"></div>}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold hover:bg-blue-100 transition relative"
                aria-label="Share"
              >
                <i className="ri-share-forward-line"></i>
                Share
                {shareFeedback && (
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-20">{shareFeedback}</span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Book Content Area */}
        <div className="px-8 py-6 bg-white/80 rounded-none mt-4 min-h-[300px] flex flex-col flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-xl font-bold font-serif text-gray-700 mb-2">
              {chapters[currentPage]?.title || 'No chapter title'}
            </h3>
            <div className="prose max-w-none text-gray-700 text-base leading-relaxed font-[500]">
              {chapters[currentPage]?.content || 'No chapter content available.'}
            </div>
          </div>
          {/* Navigation */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-500 font-semibold hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-arrow-left-s-line"></i> Previous
            </button>
            <div className="text-sm text-gray-400">
              Chapter {currentPage + 1} of {chapters.length}
            </div>
            <button
              onClick={handleNext}
              disabled={currentPage === chapters.length - 1}
              className="px-4 py-2 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Storybookcollectionsdetailmodal;