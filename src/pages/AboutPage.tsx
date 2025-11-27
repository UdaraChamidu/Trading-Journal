import React from 'react';
import { User, Mail, Github, Linkedin, Globe, Code, Heart, Coffee, Star, Award, Zap } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-4 rounded-full mb-6 shadow-2xl shadow-blue-500/25">
          <User className="w-8 h-8 text-white" />
          <div>
            <h1 className="text-4xl font-bold text-white">About the Developer</h1>
            <p className="text-blue-100 text-lg">Meet the creator behind Crypto Trading Hub</p>
          </div>
        </div>
      </div>

      {/* Developer Profile */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-16 h-16 text-blue-400" />
            </div>
          </div>

          {/* Developer Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">Udara Chamidu</h2>
            <p className="text-xl text-blue-400 mb-4">AI/ML and Full-Stack Developer & Crypto Enthusiast</p>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              Passionate developer specializing in modern web technologies and blockchain applications.
              Created this comprehensive crypto trading platform to help traders manage their portfolios,
              track performance, and stay informed about market developments.
            </p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Supabase',
                'Tailwind CSS', 'Blockchain', 'Trading Systems', 'API Integration'
              ].map((skill) => (
                <span key={skill} className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-sm border border-blue-700/50">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Mail className="w-6 h-6 text-blue-400" />
          Get In Touch
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <a
              href="mailto:chamiduudara321@gmail.com"
              className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors group"
            >
              <Mail className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              <div>
                <div className="text-white font-medium group-hover:text-blue-300">Email</div>
                <div className="text-gray-400 group-hover:text-gray-300">chamiduudara321@gmail.com</div>
              </div>
            </a>

            <a
              href="https://udara-chamidu-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors group"
            >
              <Globe className="w-6 h-6 text-green-400 group-hover:text-green-300" />
              <div className="flex-1">
                <div className="text-white font-medium group-hover:text-green-300">Portfolio Website</div>
                <div className="text-gray-400 group-hover:text-gray-300 text-sm truncate">udara-chamidu-portfolio.vercel.app</div>
              </div>
            </a>
          </div>

          <div className="space-y-4">
            <a
              href="https://github.com/UdaraChamidu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors group"
            >
              <Github className="w-6 h-6 text-purple-400 group-hover:text-purple-300" />
              <div className="flex-1">
                <div className="text-white font-medium group-hover:text-purple-300">GitHub</div>
                <div className="text-gray-400 group-hover:text-gray-300">github.com/UdaraChamidu</div>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/udara-herath-530006217"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors group"
            >
              <Linkedin className="w-6 h-6 text-blue-400 group-hover:text-blue-300" />
              <div className="flex-1">
                <div className="text-white font-medium group-hover:text-blue-300">LinkedIn</div>
                <div className="text-gray-400 group-hover:text-gray-300 text-sm truncate">linkedin.com/in/udara-herath-530006217</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Code className="w-6 h-6 text-green-400" />
          About This Project
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">🚀 Features</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>Complete trading journal with 4H analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>Real-time portfolio tracking with live prices</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>Advanced news filtering and curation</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>Social trading community platform</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>AI-powered trading coach</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                <span>Comprehensive analytics and reporting</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold text-white mb-4">🛠️ Technology Stack</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                'React 18', 'TypeScript', 'Tailwind CSS', 'Supabase',
                'PostgreSQL', 'CoinGecko API', 'Vite', 'Lucide Icons'
              ].map((tech) => (
                <div key={tech} className="bg-slate-700/50 px-3 py-2 rounded-lg text-center text-gray-300 text-sm">
                  {tech}
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h5 className="text-lg font-bold text-white mb-3">📊 Project Stats</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">15+</div>
                  <div className="text-sm text-gray-400">Components</div>
                </div>
                <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">10+</div>
                  <div className="text-sm text-gray-400">Database Tables</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 border border-blue-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Award className="w-6 h-6 text-yellow-400" />
          Mission & Vision
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-800/50 p-6 rounded-lg">
            <h4 className="text-xl font-bold text-blue-200 mb-3">🎯 Mission</h4>
            <p className="text-blue-100 leading-relaxed">
              To empower cryptocurrency traders with comprehensive tools for successful trading.
              Providing real-time data, advanced analytics, and community support to help traders
              make informed decisions and improve their performance.
            </p>
          </div>

          <div className="bg-purple-800/50 p-6 rounded-lg">
            <h4 className="text-xl font-bold text-purple-200 mb-3">🚀 Vision</h4>
            <p className="text-purple-100 leading-relaxed">
              To become the leading platform for crypto traders worldwide, combining cutting-edge
              technology with community-driven insights. Creating a ecosystem where traders can
              learn, grow, and succeed together in the dynamic crypto market.
            </p>
          </div>
        </div>
      </div>

      {/* Support & Feedback */}
      <div className="bg-gradient-to-r from-green-900 to-blue-900 border border-green-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Heart className="w-6 h-6 text-red-400" />
          Support & Feedback
        </h3>

        <div className="text-center">
          <p className="text-gray-300 text-lg mb-6">
            Your feedback helps improve this platform. If you have suggestions, bug reports,
            or just want to say hello, feel free to reach out!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:chamiduudara321@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              Send Email
            </a>

            <a
              href="https://github.com/UdaraChamidu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold rounded-lg transition-all duration-200"
            >
              <Github className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Footer Credits */}
      <div className="text-center py-8 border-t border-slate-700">
        <p className="text-gray-400 flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-red-400" /> by Udara Chamidu
          <span className="mx-2">•</span>
          <Coffee className="w-4 h-4 text-yellow-400" /> Fueled by coffee
        </p>
        <p className="text-gray-500 text-sm mt-2">
          © 2024 Crypto Trading Hub. Built with modern web technologies.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;