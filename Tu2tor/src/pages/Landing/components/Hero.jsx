import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowRight, Search, Star, Calendar, User } from 'lucide-react';
import Aurora from '../../../components/reactbits/Aurora/Aurora';
import SplitText from '../../../components/reactbits/SplitText/SplitText';
import Folder from '../../../components/reactbits/Folder/Folder';
import TextType from '../../../components/reactbits/TextType/TextType';

const TypewriterPlaceholder = ({ texts, speed = 100, pause = 2000 }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const timeout2 = setTimeout(() => {
      setBlink(!blink);
    }, 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  // Typing effect
  useEffect(() => {
    if (index >= texts.length) {
      setIndex(0);
      return;
    }

    if (subIndex === texts[index].length + 1 && !reverse) {
      setReverse(true);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 50 : subIndex === texts[index].length ? pause : speed, parseInt(Math.random() * 50)));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, texts, speed, pause]);

  return `Try searching '${texts[index].substring(0, subIndex)}${blink ? '|' : ' '}'`;
};

const Hero = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const floatAnimationDelay1 = {
    y: [0, -10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: 1
    }
  };

  const searchPlaceholders = [
    "Python Programming",
    "Calculus II",
    "Data Structures",
    "Organic Chemistry",
    "Machine Learning"
  ];

  const placeholderText = TypewriterPlaceholder({ texts: searchPlaceholders });

  const folderItems = [
    { title: "Verified Student Tutors" },
    { title: "Smart Match Algorithm" },
    { title: "Real-time Code Collab" },
    { title: "Instant 1-on-1 Chat" },
    { title: "Progress Tracking" },
    { title: "Secure Payments" }
  ];

  const textTypeContent = ["print(boost_grades())"];

  return (
    <section className="relative pt-32 pb-24 px-6 min-h-[90vh] flex items-center overflow-hidden">
      {/* Background with Aurora and Grid */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Aurora
          colorStops={['#3B82F6', '#60A5FA', '#93C5FD']}
          blend={0.8}
          amplitude={1.2}
          speed={0.4}
        />
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Overlay gradient to fade bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/20 to-white pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="relative z-10">
          {/* Animated Heading with SplitText - Adjusted for 2 lines and smaller size */}
          <div className="mb-6">
             <div className="flex flex-col gap-2">
               <SplitText
                 text="Master your courses"
                 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight text-left"
                 delay={0.1}
                 stagger={0.08}
                 tag="h1"
               />
               <SplitText
                 text="with help from peers."
                 className="text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight text-left"
                 delay={0.3} // Delay the second line slightly
                 stagger={0.08}
                 tag="h1"
               />
             </div>
          </div>

          {/* Python Code Reveal Description */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-lg mb-10 max-w-xl font-mono bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-800 overflow-hidden relative group"
          >
            {/* Mac-style window controls */}
            <div className="flex gap-2 mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            
            {/* Code Content */}
            <div className="text-gray-300 space-y-2">
              <div className="flex">
                <span className="text-purple-400 mr-2">def</span>
                <span className="text-blue-400">boost_grades</span>
                <span className="text-gray-400">():</span>
              </div>
              
              <div className="pl-4 border-l-2 border-gray-800">
                 <span className="text-gray-500"># Connect with verified student tutors</span>
                 <br />
                 <span className="text-purple-400">return</span>
                 <span className="text-green-400"> "Book sessions, chat instantly, and boost your grades."</span>
              </div>

              <div className="mt-4 text-blue-300">
                <span className="text-gray-500">{`>>> `}</span>
                <TextType
                  text={textTypeContent}
                  typingSpeed={80}
                  startOnVisible={true}
                  loop={false}
                  showCursor={true}
                  cursorCharacter="|"
                  className="font-bold"
                />
              </div>
              
              <div className="mt-2 pl-4 text-green-400 opacity-0 animate-[fadeIn_0.5s_ease-in-out_2.5s_forwards]">
                "Book sessions, chat instantly, and boost your grades."
              </div>
            </div>
          </motion.div>

          {/* Interactive Search Bar Demo */}
          <motion.div 
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mb-10 max-w-md relative group"
          >
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-100 bg-white/80 backdrop-blur-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-xl shadow-blue-100/20 transition-all hover:shadow-2xl hover:border-primary-100"
              placeholder={placeholderText}
              readOnly
            />
            <div className="absolute inset-y-2 right-2">
              <Link
                to="/app/search"
                className="h-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white px-6 rounded-lg font-medium flex items-center transition-all shadow-md hover:shadow-lg"
              >
                Search
              </Link>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all hover:scale-105 inline-flex items-center shadow-lg hover:shadow-xl"
            >
              Get Started
              <ChevronRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/login"
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg font-medium transition-colors inline-flex items-center border border-gray-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            >
              Log In
            </Link>
          </motion.div>
          
          {/* Trust Indicators */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mt-12 flex items-center gap-6 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(https://i.pravatar.cc/100?img=${i + 10})` }} />
              ))}
            </div>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Joined by <strong className="text-gray-900">500+ students</strong> this sem
            </p>
          </motion.div>
        </div>

        {/* Visual Content (Right Side) */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative hidden lg:block h-[600px] flex items-center justify-center"
        >
          {/* Floating UI Cards Simulation */}
          <div className="relative w-full h-full max-w-lg mx-auto perspective-[1000px] flex items-center justify-center">
            
            {/* Folder Animation - Enriched Product Highlights */}
            <motion.div
              animate={floatAnimationDelay1}
              className="relative z-10"
              style={{ rotate: "12deg", scale: 1.2 }}
            >
              <Folder 
                size={3} 
                color="#3B82F6" 
                autoTrigger={true}
                triggerInterval={3000}
                items={folderItems}
              />
            </motion.div>

            {/* Decor elements */}
            <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
