import React, { useState, useRef, useEffect } from 'react';
import Storybookcollectionsdetailmodal from './Storybookcollectionsdetailmodal';
import { getBooks, createBook } from '../api/stories';
import { useUser } from '../context/UserContext';

const Storybookcollections = ({ filter = {}, children }) => {
  const { user } = useUser();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [newBook, setNewBook] = useState({
    title: '',
    description: '',
    chapters: [{ title: '', content: '' }]
  });

  // Banner highlight data
  const highlights = [
    {
      type: 'Trending',
      title: 'The Little Prince',
      color: 'bg-pink-200 text-pink-700',
      badge: '🔥 Trending Book',
    },
    {
      type: 'Best Seller',
      title: "Alice's Adventures in Wonderland",
      color: 'bg-blue-200 text-blue-700',
      badge: '🏆 Best Seller',
    },
    {
      type: "Author's Choice",
      title: 'Winnie-the-Pooh',
      color: 'bg-yellow-200 text-yellow-800',
      badge: '👑 Author Choice',
    },
  ];

  // Gradient themes for book cards
  const gradientThemes = [
    'from-yellow-50 to-pink-50',
    'from-blue-50 to-green-50',
    'from-green-50 to-teal-50',
    'from-purple-50 to-indigo-50',
    'from-orange-50 to-amber-50',
    'from-pink-50 to-rose-50',
    'from-indigo-50 to-purple-50',
    'from-emerald-50 to-green-50',
    'from-cyan-50 to-blue-50',
    'from-violet-50 to-purple-50',
  ];

  // Fetch books from API
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const response = await getBooks({ sortBy: 'createdAt', order: 'desc' });
        setBooks(response || []);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const scrollToNext = () => {
    if (currentIndex < books.length - 3) {
      setCurrentIndex(currentIndex + 1);
      scrollContainerRef.current?.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollContainerRef.current?.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const canScrollNext = currentIndex < books.length - 3;
  const canScrollPrev = currentIndex > 0;

  // Helper to get highlight for a book
  const getHighlight = (title) => highlights.find(h => h.title === title);

  const handleOpenModal = (book) => {
    setSelectedBook(book);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBook(null);
  };

  // Handle create book
  const handleCreateBook = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');
    setCreating(true);

    try {
      const payload = {
        title: newBook.title.trim(),
        chapters: newBook.chapters.filter(chapter => chapter.title.trim() && chapter.content.trim())
      };

      if (!payload.title) {
        setCreateError('Title is required.');
        setCreating(false);
        return;
      }

      if (payload.chapters.length === 0) {
        setCreateError('At least one chapter is required.');
        setCreating(false);
        return;
      }

      await createBook(payload);
      setCreateSuccess('Storybook collection created successfully!');
      setShowCreateModal(false);
      setNewBook({
        title: '',
        description: '',
        chapters: [{ title: '', content: '' }]
      });
      
      // Refresh books
      const response = await getBooks({ sortBy: 'createdAt', order: 'desc' });
      setBooks(response || []);
    } catch (err) {
      setCreateError(err.message || 'Failed to create book.');
    } finally {
      setCreating(false);
      setTimeout(() => setCreateSuccess(''), 3000);
    }
  };

  // Add new chapter
  const addChapter = () => {
    setNewBook(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', content: '' }]
    }));
  };

  // Remove chapter
  const removeChapter = (index) => {
    if (newBook.chapters.length > 1) {
      setNewBook(prev => ({
        ...prev,
        chapters: prev.chapters.filter((_, i) => i !== index)
      }));
    }
  };

  // Update chapter
  const updateChapter = (index, field, value) => {
    setNewBook(prev => ({
      ...prev,
      chapters: prev.chapters.map((chapter, i) => 
        i === index ? { ...chapter, [field]: value } : chapter
      )
    }));
  };

  // Filtering logic
  const filteredBooks = books.filter((book) => {
    const titleMatch = filter.title
      ? book.title.toLowerCase().includes(filter.title.toLowerCase())
      : true;
    const authorMatch = filter.author
      ? book.author && book.author.toLowerCase().includes(filter.author.toLowerCase())
      : true;
    return titleMatch && authorMatch;
  });

  if (loading) {
    return (
      <section>
        {children}
        <div className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      {children}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Title and Controls */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={{fontFamily: 'Qurovademo'}}>Featured Storybook collection</h2>
            <div className="flex items-center space-x-4">
              <button
                className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary-dark transition-colors duration-200 font-semibold flex items-center space-x-2"
                onClick={() => {
                  if (!user) {
                    alert('Please log in to create a storybook collection.');
                    return;
                  }
                  setShowCreateModal(true);
                }}
              >
                <i className="ri-add-line text-lg"></i>
                <span style={{fontFamily: 'Qurovademo'}}>Create Book Collection</span>
              </button>
              <div className="flex items-center space-x-2">
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
          </div>
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex space-x-8 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {books.length === 0 ? (
                <div className="flex-shrink-0 w-full text-center py-12">
                  <div className="text-gray-500 text-lg mb-4">
                    No storybook collections present. Please create a new one!
                  </div>
                  <button
                    className="bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors duration-200 font-semibold"
                    style={{fontFamily: 'Qurovademo'}}
                    onClick={() => {
                      if (!user) {
                        alert('Please log in to create a storybook collection.');
                        return;
                      }
                      setShowCreateModal(true);
                    }}
                  >
                    Create Your First Storybook Collection
                  </button>
                </div>
              ) : (
                filteredBooks.map((book, index) => {
                  const highlight = getHighlight(book.title);
                  const gradient = gradientThemes[index % gradientThemes.length];
                  return (
                    <div
                      key={book.id || book._id}
                      className="flex-shrink-0 w-64 sm:w-72 h-96 relative flex items-end"
                    >
                      {/* Book Spine */}
                      <div className="absolute left-0 top-0 bottom-0 w-8 rounded-l-2xl bg-gradient-to-b from-gray-300 to-gray-400 shadow-lg z-20 flex flex-col items-center justify-center border-r-4 border-gray-200">
                        <span className="text-[11px] text-gray-600 font-bold tracking-widest writing-vertical-ltr" style={{writingMode: 'vertical-rl', letterSpacing: '0.2em'}}>
                          STORYBOOK
                        </span>
                      </div>
                      {/* Book Cover */}
                      <div className={`relative w-full h-[92%] ml-7 bg-gradient-to-br ${gradient} rounded-r-2xl border border-gray-200 shadow-2xl flex flex-col justify-between items-center p-6 pt-8 pb-8 transition-transform duration-200 hover:-translate-y-1 z-10`}
                        style={{boxShadow: '0 6px 24px 0 rgba(0,0,0,0.10), 8px 0 16px -8px #e5e7eb'}}
                      >
                        {/* Highlight Ribbon */}
                        {highlight && (
                          <div className={`absolute -top-3 -right-3 z-30 transform rotate-12`}> 
                            <span className={`px-3 py-1 text-xs font-bold rounded shadow-lg ${highlight.color} whitespace-nowrap`}>
                              {highlight.badge}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-col items-center text-center w-full flex-1">
                          <h3 className="text-2xl font-extrabold text-gray-800 mb-1 font-serif leading-tight" style={{fontFamily: 'Qurovademo'}}>
                            {book.title}
                          </h3>
                          <div className="text-sm text-gray-500 font-medium mb-2">by {book.author}</div>
                          <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm inline-block mb-2">
                            {book.chapters ? `${book.chapters.length} chapters` : '0 chapters'}
                          </span>
                          <div className="text-xs text-gray-500 font-normal mb-3 w-full line-clamp-2" style={{fontFamily: 'Qurovademo'}}>
                            {book.description || 'A captivating storybook collection'}
                          </div>
                        </div>
                        <div className="w-full mt-auto relative">
                          <button
                            className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap font-semibold shadow"
                            onClick={() => handleOpenModal(book)}
                            style={{fontFamily: 'Qurovademo'}}
                          >
                            View Storybook
                          </button>
                        </div>
                        {/* Book page edge highlight */}
                        <div className="absolute right-0 top-0 h-full w-2 rounded-r-2xl bg-gradient-to-b from-white/80 to-gray-100 opacity-80 z-20" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Scroll indicator */}
            {filteredBooks.length > 3 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(filteredBooks.length / 3) }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIndex(i * 3);
                      scrollContainerRef.current?.scrollTo({
                        left: i * 3 * 400,
                        behavior: 'smooth'
                      });
                    }}
                    className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                      Math.floor(currentIndex / 3) === i 
                        ? 'bg-primary' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Detail Modal */}
          <Storybookcollectionsdetailmodal open={modalOpen} onClose={handleCloseModal} book={selectedBook} />
        </div>
      </div>

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800" style={{fontFamily: 'Qurovademo'}}>Create Storybook Collection</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleCreateBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="Enter storybook title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapters *</label>
                <div className="space-y-3">
                  {newBook.chapters.map((chapter, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Chapter {index + 1}</span>
                        {newBook.chapters.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeChapter(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        value={chapter.title}
                        onChange={e => updateChapter(index, 'title', e.target.value)}
                        placeholder="Chapter title"
                        required
                      />
                      <textarea
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        rows="3"
                        value={chapter.content}
                        onChange={e => updateChapter(index, 'content', e.target.value)}
                        placeholder="Chapter content"
                        required
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addChapter}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                  >
                    + Add Chapter
                  </button>
                </div>
              </div>
              
              {createError && <div className="text-red-500 text-sm text-center">{createError}</div>}
              {createSuccess && <div className="text-green-600 text-sm text-center">{createSuccess}</div>}
              <button
                type="submit"
                className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Storybook Collection'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Storybookcollections;
