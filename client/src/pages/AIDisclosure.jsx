import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const AIDisclosure = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-primary/10 rounded-full p-6 mb-6 inline-block">
            <i className="ri-robot-line text-4xl text-primary"></i>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 font-['Inter']">
            AI Disclosure & Transparency
          </h1>
          <p className="text-lg text-gray-600 font-['DM_Sans'] max-w-2xl mx-auto">
            We believe in complete transparency about how artificial intelligence is used on our platform. 
            This disclosure explains how AI technologies enhance your experience while protecting your privacy.
          </p>
        </div>

        {/* AI Technologies Used */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-cpu-line text-primary"></i>
            AI Technologies We Use
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-magic-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">AI Story Generation</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Powered by advanced language models to help you create compelling stories from prompts and ideas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-lightbulb-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Creative Prompt Generation</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    AI-assisted brainstorming to help overcome writer's block and generate story ideas.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-search-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Content Discovery</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    AI-powered recommendations to help you discover relevant stories and content.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-shield-check-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Content Moderation</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    AI-assisted content filtering to maintain community guidelines and safety standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Usage & Privacy */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-lock-line text-primary"></i>
            How We Use Your Data with AI
          </h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-primary/20 pl-6">
              <h3 className="font-bold text-gray-800 mb-2 font-['Inter']">Story Content Processing</h3>
              <p className="text-gray-600 font-['DM_Sans'] mb-3">
                When you use AI features, your story content may be processed by AI systems to:
              </p>
              <ul className="text-gray-600 font-['DM_Sans'] space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Generate relevant writing prompts and suggestions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Improve story recommendations and discovery
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Enhance content moderation and community safety
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Train and improve our AI systems (with your consent)
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-primary/20 pl-6">
              <h3 className="font-bold text-gray-800 mb-2 font-['Inter']">Data Retention & Security</h3>
              <p className="text-gray-600 font-['DM_Sans'] mb-3">
                Your data is handled with the utmost care and security:
              </p>
              <ul className="text-gray-600 font-['DM_Sans'] space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  All AI processing is encrypted and secure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Personal information is anonymized when possible
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  You can request deletion of your AI training data
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold mt-1">•</span>
                  Data is never sold to third parties
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* AI Models & Providers */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-database-2-line text-primary"></i>
            AI Models & Service Providers
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-3 font-['Inter']">Primary AI Services</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2 font-['Inter']">OpenAI GPT Models</h4>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Used for story generation, creative writing assistance, and content enhancement.
                  </p>
                </div>
                {/* <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2 font-['Inter']">Ollama Llama 3</h4>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Used for story generation, creative writing assistance, and content enhancement.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2 font-['Inter']">Deepseek r1</h4>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Used for story generation, creative writing assistance, and content enhancement.
                  </p>
                </div> */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-2 font-['Inter']">Custom AI Models</h4>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Proprietary models trained on community data for specialized content recommendations.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3 font-['Inter']">Third-Party AI Services</h3>
              <p className="text-gray-600 font-['DM_Sans'] mb-4">
                We may use additional AI services for specific features. All providers are carefully vetted for:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-3 mb-2 mx-auto w-fit">
                    <i className="ri-shield-check-line text-primary"></i>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm font-['Inter']">Security Standards</h4>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-3 mb-2 mx-auto w-fit">
                    <i className="ri-user-privacy-line text-primary"></i>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm font-['Inter']">Privacy Compliance</h4>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-3 mb-2 mx-auto w-fit">
                    <i className="ri-global-line text-primary"></i>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm font-['Inter']">Data Protection</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Rights & Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-user-settings-line text-primary"></i>
            Your Rights & Controls
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-toggle-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Opt-Out Options</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    You can disable AI features at any time through your account settings.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-delete-bin-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Data Deletion</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Request complete deletion of your data from AI training datasets.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-eye-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Transparency</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Access detailed information about how your data is processed by AI systems.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <i className="ri-customer-service-line text-primary text-sm"></i>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 font-['Inter']">Support</h3>
                  <p className="text-gray-600 text-sm font-['DM_Sans']">
                    Contact our team for questions about AI usage and data handling.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Updates & Changes */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-notification-line text-primary"></i>
            Updates & Changes
          </h2>
          
          <div className="space-y-4">
            <p className="text-gray-600 font-['DM_Sans']">
              As AI technology evolves, we may update our AI systems and this disclosure. We will notify you of any significant changes that affect how your data is processed.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <i className="ri-information-line text-blue-600 mt-1"></i>
                <div>
                  <h3 className="font-bold text-blue-800 font-['Inter']">Last Updated</h3>
                  <p className="text-blue-700 text-sm font-['DM_Sans']">
                    This AI Disclosure was last updated on {new Date().toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Resources */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-['Inter'] flex items-center gap-3">
            <i className="ri-question-line text-primary"></i>
            Questions & Resources
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-gray-800 mb-3 font-['Inter']">Get Help</h3>
              <div className="space-y-3">
                <Link to="/contact-us" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-mail-line"></i>
                  Contact Support
                </Link>
                <Link to="/privacy-policy" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-shield-user-line"></i>
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-file-text-line"></i>
                  Terms of Service
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-3 font-['Inter']">Learn More</h3>
              <div className="space-y-3">
                <Link to="/ai-assistant-guide" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-book-open-line"></i>
                  AI Assistant Guide
                </Link>
                <Link to="/writing-tips" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-lightbulb-line"></i>
                  Writing Tips
                </Link>
                <Link to="/community-guidelines" className="flex items-center gap-3 text-primary hover:text-primary/80 font-['DM_Sans'] font-medium">
                  <i className="ri-team-line"></i>
                  Community Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDisclosure; 