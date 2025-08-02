import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchContent } from '../api/stories';
import SearchResults from '../components/SearchResults';

const SearchResultsPage = ({ setSelectedStoryId }) => {
  const [searchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState({ stories: [], authors: [], tags: [], collections: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const response = await searchContent({ query: searchQuery, type: 'all', limit: 20, page: 1, sortBy: 'relevance' });
        setSearchResults(response.results || { stories: [], authors: [], tags: [], collections: [] });
      } catch {
        setError('Failed to fetch search results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchQuery]);

  const handleResultClick = (item) => {
    if (item.type === 'story') {
      setSelectedStoryId(item.id);
    } else if (item.type === 'author') {
      navigate(`/author/${item.id}`);
    } else if (item.type === 'collection') {
      navigate(`/collection/${item.id}`);
    } else if (item.type === 'tag') {
      navigate(`/search?q=${encodeURIComponent(item.name)}`);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Search Results</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && searchQuery && (
          <SearchResults
            searchQuery={searchQuery}
            searchResults={searchResults}
            onClose={handleClose}
            onStoryClick={handleResultClick}
          />
        )}
        {!loading && !error && !searchQuery && (
          <div className="text-gray-500">Type something in the search bar to see results.</div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 