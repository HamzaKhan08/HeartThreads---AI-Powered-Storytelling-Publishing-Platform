import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Storyfeed from './components/Storyfeed'
import Storycollection from './components/Storycollection'
import Createstory from './components/Createstory'
import Footer from './components/Footer'
import Floatingcreatebutton from './components/Floatingcreatebutton'
import Storydetailmodal from './components/Storydetailmodal'
import Explore from './pages/Explore'
import Collections from './pages/Collections'
import Storybookcollections from './components/Storybookcollections'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Communityguidelines from './pages/Communityguidelines'
import Writingtips from './pages/Writingtips'
import AIassistantguide from './pages/AIassistantguide'
import Mentalhealthresources from './pages/Mentalhealthresources'
import Supporthotlines from './pages/Supporthotlines'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookiesPolicy from './pages/CookiesPolicy'
import SearchResultsPage from './pages/SearchResultsPage'
import ContactUs from './pages/ContactUs'
import AuthorProfile from './pages/AuthorProfile'
import Plans from './pages/Plans';
import AIDisclosure from './pages/AIDisclosure';

const App = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedStoryId, setSelectedStoryId] = useState(null);

  const handleTagSelect = (tag) => {
    if (tag === 'clear-all') {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const clearTags = () => {
    setSelectedTags([]);
  };

  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero onTagSelect={handleTagSelect} selectedTags={selectedTags} />
                <Storyfeed selectedTags={selectedTags} onTagSelect={handleTagSelect} onClearTags={clearTags} onStoryClick={setSelectedStoryId} />
                <Storycollection setSelectedStoryId={setSelectedStoryId} />
                <Storybookcollections />
                <Createstory />   
              </>
            }
          />
          <Route path="/create" element={<Createstory />} />
          <Route path="/explore" element={<Explore setSelectedStoryId={setSelectedStoryId} />} />
          <Route path="/collections" element={<Collections setSelectedStoryId={setSelectedStoryId} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/community-guidelines" element={<Communityguidelines />} />
          <Route path="/writing-tips" element={<Writingtips />} />
          <Route path="/ai-assistant-guide" element={<AIassistantguide />} />
          <Route path="/mental-health-resources" element={<Mentalhealthresources />} />
          <Route path="/support-hotlines" element={<Supporthotlines />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<SearchResultsPage setSelectedStoryId={setSelectedStoryId} />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/author/:authorId" element={<AuthorProfile />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/ai-disclosure" element={<AIDisclosure />} />
          {/* Add more routes as needed */}
        </Routes>
        <Footer />
        <Floatingcreatebutton />
        <Storydetailmodal storyId={selectedStoryId} onClose={() => setSelectedStoryId(null)} />
      </Router>
    </UserProvider>
  )
}

export default App