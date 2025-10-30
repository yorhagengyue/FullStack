import { Link } from 'react-router-dom';
import { Search, Users, Calendar, GraduationCap, Shield, Clock, Award, Lock, Sparkles, Zap, Target } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with gradient */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">Tu2tor</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Find a Tutor
              </a>
              <a href="#why-tu2tor" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                Become a Tutor
              </a>
              <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">
                About
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section with animated background */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="animate-fadeInUp">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Find the perfect peer tutor
            </span>
            <br />
            <span className="text-gray-900">for your needs.</span>
          </h1>
        </div>

        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          Excel in your studies with help from <span className="text-primary-600 font-semibold">talented students</span> who have already aced your courses.
        </p>

        {/* Enhanced Search Bar */}
        <div className="max-w-2xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
          <div className="bg-white rounded-full shadow-2xl border-2 border-primary-100 flex items-center p-2 hover-glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-purple-50 opacity-50"></div>
            <Search className="w-5 h-5 text-primary-500 ml-4 z-10" />
            <input
              type="text"
              placeholder="Search for courses like IT1001 or CDF2001"
              className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent z-10"
            />
            <Link
              to="/register"
              className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 z-10 flex items-center space-x-2"
            >
              <span>Search</span>
              <Zap className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How it Works
            </h2>
            <p className="text-xl text-gray-600">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all group">
              <div className="absolute -top-4 left-8 w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="mt-6 mb-6">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-orange-100 transition-colors">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Search for a Tutor
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Browse through verified tutors by subject, availability, and ratings. Filter to find the perfect match for your learning needs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all group" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -top-4 left-8 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="mt-6 mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-green-100 transition-colors">
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Book a Session
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Choose a convenient time slot and location. Coordinate directly with your tutor to schedule a session that fits both schedules.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all group" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -top-4 left-8 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="mt-6 mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-colors">
                  <GraduationCap className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                Start Learning
              </h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Meet your tutor and dive into personalized learning. Get help, ask questions, and improve your understanding of the subject.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Tu2tor Section */}
      <section id="why-tu2tor" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Tu2tor?
            </h2>
            <p className="text-xl text-gray-600">
              A peer-to-peer learning platform built for students, by students.
            </p>
          </div>

          <div className="space-y-6">
            {/* Feature 1 */}
            <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
              <div className="flex-shrink-0 mt-1">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Verified Campus Tutors
                </h3>
                <p className="text-gray-600">
                  All tutors are verified TP students who have excelled in the courses they teach.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
              <div className="flex-shrink-0 mt-1">
                <Clock className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Flexible Scheduling
                </h3>
                <p className="text-gray-600">
                  Book sessions at your convenience. Study at library, student hub, or online via Zoom/Teams.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
              <div className="flex-shrink-0 mt-1">
                <Award className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Earn Rewards & Badges
                </h3>
                <p className="text-gray-600">
                  Build your profile with achievement badges as you learn and teach. Showcase your expertise.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
              <div className="flex-shrink-0 mt-1">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Smart Matching
                </h3>
                <p className="text-gray-600">
                  Find tutors that match your schedule, subject needs, and learning preferences.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="flex items-start space-x-4 py-4 border-b border-gray-200">
              <div className="flex-shrink-0 mt-1">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Review System
                </h3>
                <p className="text-gray-600">
                  Read honest reviews from students and make informed decisions about your tutors.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="flex items-start space-x-4 py-4">
              <div className="flex-shrink-0 mt-1">
                <Target className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Credit System
                </h3>
                <p className="text-gray-600">
                  Earn credits by tutoring others, then use them to book sessions when you need help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with animated gradient */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 animate-gradient"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fadeInUp">
            <Target className="w-16 h-16 text-white mx-auto mb-6 animate-float" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to excel in your studies?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join <span className="font-bold text-white">thousands of students</span> already learning and teaching on Tu2tor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started for Free</span>
              <Sparkles className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-white transition-all backdrop-blur-sm transform hover:scale-105"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Tu2tor</span>
              </div>
              <p className="text-sm">
                Connecting students for better learning outcomes.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Find a Tutor</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Become a Tutor</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2025 Tu2tor. All rights reserved. Made with ❤️ for students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
