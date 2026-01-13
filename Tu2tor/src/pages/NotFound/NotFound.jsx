
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import SplitText from '../../components/reactbits/SplitText/SplitText';
import ShuffleText from '../../components/reactbits/ShuffleText/ShuffleText';
import RotatingText from '../../components/reactbits/RotatingText/RotatingText';
import Squares from '../../components/reactbits/Squares/Squares';

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  // Auto redirect countdown
  useEffect(() => {
    if (!autoRedirect) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRedirect, navigate]);

  const handleCancelRedirect = () => {
    setAutoRedirect(false);
    setCountdown(null);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 bg-[#060010] overflow-hidden">
      {/* Squares Background - Same as Login */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Squares 
          direction="diagonal"
          speed={0.5}
          squareSize={40}
          borderColor="#333" 
          hoverFillColor="#222"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        {/* 404 Number with Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="mb-8"
        >
          <div className="text-[180px] md:text-[240px] font-black leading-none text-white tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            404
          </div>
        </motion.div>

        {/* Error Message with SplitText Animation */}
        <div className="mb-6">
          <SplitText
            text="Oops! Page Not Found"
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            delay={0.3}
            stagger={0.03}
          />
        </div>

        {/* Rotating Error Messages */}
        <div className="mb-8 text-lg text-gray-300 h-8">
          <RotatingText
            texts={[
              "This page went on a study break...",
              "404: Lost in the learning matrix",
              "Even AI can't find this page",
              "This URL needs a tutor",
              "Page.exe has stopped working"
            ]}
            rotationInterval={3000}
            splitBy="words"
            staggerDuration={0.03}
          />
        </div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-300 text-base mb-12 max-w-2xl mx-auto"
        >
          The page you're looking for doesn't exist or has been moved. 
          Don't worry, even the best students get lost sometimes!
        </motion.p>

        {/* Auto Redirect Notice */}
        {autoRedirect && countdown !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="text-gray-300 text-base font-mono flex items-center justify-center gap-1">
              <span>Redirecting to home in</span>
              <motion.span
                key={countdown}
                initial={{ scale: 1.3, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="font-bold text-lg text-white inline-block min-w-[1.5rem] text-center"
              >
                {countdown}
              </motion.span>
              <span>s...</span>
            </div>
            <button
              onClick={handleCancelRedirect}
              className="mt-3 text-sm text-gray-400 hover:text-white underline transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl font-semibold text-white border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </motion.button>

        {/* Fun Error Code */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 font-mono">
            <AlertTriangle className="w-4 h-4" />
            <ShuffleText
              text="ERROR_CODE: PAGE_NOT_FOUND_404"
              speed={30}
              className="tracking-wider"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
