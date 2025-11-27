import React from 'react';
import { Heart, Github, Mail, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 border-t border-slate-700 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Developer Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">About the Developer</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">Y</span>
              </div>
              <div>
                <div className="text-white font-semibold">Your Name</div>
                <div className="text-gray-400 text-sm">Full-Stack Developer</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Passionate developer creating innovative trading tools and platforms.
              Specializing in modern web technologies and blockchain applications.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="/dashboard" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Dashboard
              </a>
              <a href="/portfolio" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Portfolio
              </a>
              <a href="/crypto-news" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                News
              </a>
              <a href="/social-hub" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Community
              </a>
              <a href="/analytics" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                Analytics
              </a>
              <a href="/about" className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                About
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg">Connect</h3>
            <div className="space-y-3">
              <a
                href="mailto:your.email@example.com"
                className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="text-sm">your.email@example.com</span>
              </a>

              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors"
              >
                <Github className="w-5 h-5" />
                <span className="text-sm">GitHub Profile</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href="https://linkedin.com/in/yourprofile"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span className="text-sm">LinkedIn Profile</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>© 2024 Crypto Trading Hub</span>
            <span>•</span>
            <span>Built with modern web technologies</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-400">Made with</span>
            <Heart className="w-4 h-4 text-red-400" />
            <span className="text-gray-400">by Your Name</span>
            <span className="text-gray-500">•</span>
            <span className="text-yellow-400 flex items-center gap-1">
              ☕ Fueled by coffee
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;