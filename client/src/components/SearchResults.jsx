import React from 'react';

const SearchResults = ({ searchQuery, searchResults, onClose, onStoryClick }) => {
  if (!searchQuery.trim()) return null;

  const { stories = [], authors = [], tags = [], collections = [] } = searchResults;
  const totalResults = stories.length + authors.length + tags.length + collections.length;

  const renderStory = (story) => (
    <div
      key={story.id}
      className="story-card bg-white rounded-xl border border-gray-100 shadow hover:shadow-md transition-all duration-200 cursor-pointer p-8 flex flex-col gap-3 min-w-0 max-w-2xl mx-auto"
      onClick={() => onStoryClick(story)}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${story.isAnonymous ? 'bg-gray-100' : 'bg-blue-100'}`}
          title={story.isAnonymous ? 'Anonymous Author' : story.author}
        >
                  {story.isAnonymous ? (
            <i className="ri-user-line text-gray-600 text-base"></i>
                  ) : (
            <span className="text-blue-600 text-base font-bold">{story.authorInitials || 'A'}</span>
                  )}
                </div>
        <span className="text-gray-700 text-sm">
          {story.isAnonymous ? 'Anonymous Author' : story.author}
                    </span>
              <span className="text-xs text-gray-400">{story.publishedAt}</span>
            </div>
      <div className="font-semibold text-base text-gray-900 mb-1 line-clamp-1">{story.title}</div>
      <div className="flex flex-wrap gap-1 mb-1">
                {story.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-gray-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">{tag}</span>
                ))}
                {story.tags.length > 3 && (
          <span className="bg-blue-50 text-blue-400 px-2 py-0.5 rounded-full text-xs font-medium">+{story.tags.length - 3} more</span>
                )}
              </div>
      <div className="text-gray-600 text-sm mb-1 line-clamp-2">{story.content}</div>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
        <span>Reading time {story.readTime} min</span>
        <span className="flex items-center gap-1"><i className="ri-heart-line"></i> {story.likes} likes</span>
      </div>
    </div>
  );

  const renderAuthor = (author) => (
    <div 
      key={author.id} 
      className="bg-white rounded-lg border border-gray-100 p-8 hover:border-gray-200 transition-all duration-200 cursor-pointer max-w-2xl mx-auto"
      onClick={() => onStoryClick(author)}
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
          <i className="ri-user-line text-2xl text-purple-600"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-800 mb-1">{author.name}</h4>
          <p className="text-sm text-gray-600 mb-2">@{author.username}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Joined {author.joinedAt}</span>
            {author.isAnonymous && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                Anonymous
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCollection = (collection) => (
    <div 
      key={collection.id} 
      className="bg-white rounded-lg border border-gray-100 p-8 hover:border-gray-200 transition-all duration-200 cursor-pointer max-w-2xl mx-auto"
      onClick={() => onStoryClick(collection)}
    >
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
          <i className="ri-folder-line text-2xl text-orange-600"></i>
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-800 mb-1">{collection.title}</h4>
          <p className="text-sm text-gray-600 mb-2">{collection.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>By {collection.author}</span>
              <span>{collection.storyCount} stories</span>
              <span>{collection.createdAt}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {collection.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="tag-chip bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/40 backdrop-blur-sm animate-fadeIn">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden border border-gray-200 relative animate-slideInUp">
        {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-none flex items-center justify-center text-black shadow-md">
            <i className="ri-search-line text-2xl"></i>
            </div>
            <div>
            <h3 className="font-semibold text-xl text-gray-800" style={{fontFamily: 'Qurovademo'}}>Search Results</h3>
            <p className="text-l text-gray-500 mt-1">
              <span className="font-semibold text-black">{totalResults}</span> result{totalResults !== 1 ? 's' : ''} for <span className="font-semibold text-blue-600">"{searchQuery}"</span>
              </p>
            </div>
          </div>
          <button
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200 text-xl"
            onClick={onClose}
          aria-label="Close search results"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Results */}
      <div className="overflow-y-auto max-h-[calc(80vh-80px)] custom-scrollbar">
          {totalResults === 0 ? (
            <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow">
              <i className="ri-search-line text-3xl text-gray-400"></i>
              </div>
            <h4 className="text-2xl font-semibold text-gray-700 mb-2">No results found</h4>
            <p className="text-gray-500 text-base">
                Try searching with different keywords or browse our story collections
              </p>
            </div>
          ) : (
          <div className="p-6 space-y-10">
              {/* Stories Section */}
              {stories.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center mb-4 gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow">
                    <i className="ri-file-text-line text-xl text-blue-600"></i>
                  </div>
                  <h4 className="text-xl font-bold text-blue-800 tracking-tight">Stories <span className='text-blue-400 font-normal'>({stories.length})</span></h4>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    {stories.map(renderStory)}
                  </div>
                </div>
              )}
            {stories.length > 0 && (authors.length > 0 || collections.length > 0 || tags.length > 0) && <div className="my-8 border-t border-gray-200" />}

              {/* Authors Section */}
              {authors.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center mb-5 gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shadow">
                    <i className="ri-user-line text-xl text-purple-600"></i>
                  </div>
                  <h4 className="text-xl font-bold text-purple-800 tracking-tight">Authors <span className='text-purple-400 font-normal'>({authors.length})</span></h4>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                    {authors.map(renderAuthor)}
                  </div>
                </div>
              )}
            {authors.length > 0 && (collections.length > 0 || tags.length > 0) && <div className="my-8 border-t border-gray-200" />}

              {/* Collections Section */}
              {collections.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center mb-5 gap-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shadow">
                    <i className="ri-folder-line text-xl text-orange-600"></i>
                  </div>
                  <h4 className="text-xl font-bold text-orange-800 tracking-tight">Collections <span className='text-orange-400 font-normal'>({collections.length})</span></h4>
                </div>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
                  {collections.map(renderCollection)}
                  </div>
                </div>
              )}
            {collections.length > 0 && tags.length > 0 && <div className="my-8 border-t border-gray-200" />}

            </div>
          )}
        </div>
      </div>
    <style jsx>{`
      .animate-fadeIn { animation: fadeIn 0.3s ease; }
      .animate-slideInUp { animation: slideInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInUp {
        from { transform: translateY(40px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e0e7ef;
        border-radius: 8px;
      }
      .story-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 4px 24px 0 rgba(30,41,59,0.07), 0 1.5px 6px 0 rgba(30,41,59,0.03);
        border: 1.5px solid #e5e7eb;
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        transition: box-shadow 0.2s, border 0.2s, transform 0.15s;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 1.2rem;
      }
      .story-card:hover {
        box-shadow: 0 8px 32px 0 rgba(30,41,59,0.13), 0 2px 8px 0 rgba(30,41,59,0.06);
        border-color: #a5b4fc;
        transform: translateY(-2px) scale(1.015);
      }
      .story-card .story-title {
        font-size: 1.18rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 0.5rem;
        line-height: 1.3;
      }
      .story-card .story-meta {
        display: flex;
        align-items: center;
        gap: 0.7rem;
        font-size: 0.97rem;
        color: #64748b;
        margin-bottom: 0.2rem;
      }
      .story-card .story-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 0.5rem;
      }
      .story-card .story-tag {
        background: #f1f5f9;
        color: #2563eb;
        font-size: 0.85rem;
        border-radius: 9999px;
        padding: 0.18rem 0.8rem;
        font-weight: 500;
      }
      .story-card .story-content {
        color: #475569;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 0.5rem;
        min-height: 2.5em;
        max-height: 3.5em;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .story-card .story-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.93rem;
        color: #64748b;
        margin-top: 0.5rem;
      }
      .story-card .story-footer .likes {
        display: flex;
        align-items: center;
        gap: 0.3rem;
        color: #ef4444;
        font-weight: 500;
      }
      .tag-card {
        background: #fff;
        border-radius: 1.25rem;
        box-shadow: 0 2px 8px 0 rgba(16,185,129,0.04);
        border: 1.5px solid #e5e7eb;
        padding: 1.5rem 1.25rem 1.25rem 1.25rem;
        transition: box-shadow 0.2s, border 0.2s, transform 0.15s;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 0;
        min-height: 80px;
        max-width: 100%;
      }
      .tag-card:hover {
        box-shadow: 0 8px 32px 0 rgba(16,185,129,0.13), 0 2px 8px 0 rgba(16,185,129,0.06);
        border-color: #6ee7b7;
        transform: translateY(-2px) scale(1.015);
      }
    `}</style>
    </div>
  );
};

export default SearchResults; 