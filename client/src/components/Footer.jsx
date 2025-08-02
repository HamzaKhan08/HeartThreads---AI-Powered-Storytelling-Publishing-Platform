import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <>
    {/* Footer */}
    <footer className="bg-gray-50 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <a
              href="#"
              className="text-2xl text-primary mb-4 inline-block" style={{fontFamily: 'Qurovademo'}}
              >HeartThreads</a
            >
            <p className="text-gray-600 mb-4" style={{fontFamily: 'Qurovademo'}}>
              A safe space to share your emotional journey anonymously and
              connect with others through shared experiences.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <i className="ri-instagram-line"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <i className="ri-twitter-x-line"></i>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200"
              >
                <i className="ri-facebook-fill"></i>
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4" style={{fontFamily: 'Qurovademo'}}>Explore</h3>
            <ul className="space-y-2" style={{fontFamily: 'Qurovademo'}}>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >Featured Stories</a
                >
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                  >Popular Collections</a
                >
              </li>
              <li>
              <Link
              to="/contact"
              className="text-gray-600 hover:text-primary transition-colors duration-200"
            >
              Contact Us
            </Link>
              </li>
              <li>
                <Link
                  to="/community-guidelines"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4" style={{fontFamily: 'Qurovademo'}}>Resources</h3>
            <ul className="space-y-2" style={{fontFamily: 'Qurovademo'}}>
              <li>
                <Link
                  to="/writing-tips"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Writing Tips
                </Link>
              </li>
              <li>
                <Link
                  to="/ai-assistant-guide"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  AI Assistant Guide
                </Link>
              </li>
              <li>
                <Link
                  to="/mental-health-resources"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Mental Health Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/support-hotlines"
                  className="text-gray-600 hover:text-primary transition-colors duration-200"
                >
                  Support Hotlines
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-4" style={{fontFamily: 'Qurovademo'}}>Stay Connected</h3>
            <p className="text-gray-600 mb-4" style={{fontFamily: 'Qurovademo'}}>
              Subscribe to our newsletter for weekly stories and updates.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-l-full border-none focus:outline-none bg-white text-sm"
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-r-full whitespace-nowrap"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div
          className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © 2025 <span style={{fontFamily: 'Qurovademo'}}>HeartThreads.</span> All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              to="/privacy-policy"
              className="text-gray-500 text-sm hover:text-primary transition-colors duration-200" style={{fontFamily: 'Qurovademo'}}
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="text-gray-500 text-sm hover:text-primary transition-colors duration-200" style={{fontFamily: 'Qurovademo'}}
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies-policy"
              className="text-gray-500 text-sm hover:text-primary transition-colors duration-200" style={{fontFamily: 'Qurovademo'}}
            >
              Cookie Policy
            </Link>
            <Link
              to="/ai-disclosure"
              className="text-gray-500 text-sm hover:text-primary transition-colors duration-200" style={{fontFamily: 'Qurovademo'}}
            >
              AI Disclosure
            </Link>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}

export default Footer