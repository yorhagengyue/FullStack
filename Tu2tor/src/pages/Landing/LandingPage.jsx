import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Particles from '../../components/reactbits/Particles/Particles';
import GooeyNav from './components/GooeyNav';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import MergedSection from './components/MergedSection';

const LandingPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Features', href: '#features' },
    { label: 'Process', href: '#how' },
    { label: 'Stories', href: '#testimonials' }
  ];

  return (
    <div className="min-h-screen bg-white relative">
      {/* Minimal Navigation */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50 h-20 flex items-center"
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 shrink-0">
              <img src="/icon.png" alt="Tu2tor" className="w-8 h-8" />
              <span className="text-lg font-bold text-gray-900 tracking-tight">Tu2tor</span>
            </Link>

            <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
               <GooeyNav items={navItems} />
            </div>

            <div className="flex items-center space-x-4 shrink-0">
              <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">
                Log In
              </Link>
              <Link
                to="/register"
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <Hero />

      {/* Stats Counter */}
      <Stats />

      {/* Merged Features & How It Works Section */}
      <MergedSection />

      {/* Testimonials Scroll */}
      <Testimonials />

      {/* CTA with Particles */}
      <section className="py-32 relative overflow-hidden bg-gray-900 text-white">
         {/* Particles Background */}
        <div className="absolute inset-0 z-0">
          <Particles
            particleColors={['#ffffff', '#60A5FA', '#3B82F6']}
            particleCount={300}
            particleSpread={10}
            speed={0.2}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={false}
          />
        </div>
        
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.h2 variants={fadeInUp} className="text-5xl font-semibold mb-6">
              Start learning today
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10">
              Join thousands of students helping each other succeed
            </motion.p>

            <motion.div variants={fadeInUp}>
              <Link
                to="/register"
                className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 inline-flex items-center shadow-xl"
              >
                Get Started for Free
                <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">Tu2tor</span>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <a href="#" className="hover:text-white">About</a>
              <a href="#" className="hover:text-white">Contact</a>
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
            </div>

            <p className="text-sm">
              2025 Tu2tor
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
