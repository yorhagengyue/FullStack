import React, { useState, useEffect, useRef } from 'react';
import { Shield, Target, Award, Search, Calendar, Trophy, Users, ArrowRight, Sparkles } from 'lucide-react';
import ScrollStack, { ScrollStackItem } from '../../../components/reactbits/ScrollStack/ScrollStack';
import Squares from '../../../components/reactbits/Squares/Squares';

const MergedSection = () => {
  const scrollStackRef = useRef(null);
  
  // Auto-play logic (preserved)
  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-stack-inner')?.parentElement;
    if (!scrollContainer) return;

    let scrollSpeed = 0.5;
    let animationId;
    let isHovering = false;

    const autoScroll = () => {
      if (!isHovering) {
        if (scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 10) {
           scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
        } else {
           scrollContainer.scrollTop += scrollSpeed;
        }
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    const handleMouseEnter = () => { isHovering = true; };
    const handleMouseLeave = () => { isHovering = false; };

    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    animationId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
      scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const items = [
    {
      tag: "Platform",
      title: "Verified Students",
      desc: "All tutors are A-grade students verified by the platform. We check transcripts so you don't have to.",
      icon: Shield,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50 text-blue-600"
    },
    {
      tag: "Technology",
      title: "Smart Matching",
      desc: "Our AI algorithm analyzes your learning style and matches you with the perfect tutor instantly.",
      icon: Target,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50 text-purple-600"
    },
    {
      tag: "Step 01",
      title: "Find Module",
      desc: "Search by course code (e.g., 'CS101'). Filter by rating, price, and availability.",
      icon: Search,
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-50 text-orange-600"
    },
    {
      tag: "Step 02",
      title: "Book Session",
      desc: "Secure a time slot that fits your timetable. Real-time availability updates.",
      icon: Calendar,
      color: "from-pink-500 to-rose-500",
      bg: "bg-pink-50 text-pink-600"
    },
    {
      tag: "Step 03",
      title: "Level Up",
      desc: "Master concepts and boost your GPA. Track your progress with detailed analytics.",
      icon: Trophy,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50 text-green-600"
    },
    {
        tag: "Community",
        title: "Join 500+ Peers",
        desc: "Be part of a thriving network of student developers helping each other succeed.",
        icon: Users,
        color: "from-indigo-500 to-violet-500",
        bg: "bg-indigo-50 text-indigo-600",
        action: true
    }
  ];

  return (
    <section id="features" className="relative bg-white h-[900px] overflow-hidden border-t border-gray-100">
       
       {/* Background */}
       <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
         <Squares 
            speed={0.1} 
            squareSize={60} 
            direction='diagonal' 
            borderColor='#f0f0f0' 
            hoverFillColor='#f8f9fa' 
        />
      </div>

      {/* Static Header - Placed visually above the stack area */}
      <div className="absolute top-0 left-0 right-0 z-20 pt-16 pb-8 px-6 bg-gradient-to-b from-white via-white to-transparent h-[200px]">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-4">
                <Sparkles className="w-3 h-3" />
                <span>Workflow & Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              The complete toolkit.
            </h2>
            <p className="text-gray-500 text-lg">
              Everything you need to go from stuck to certified.
            </p>
          </div>
       </div>

      {/* Scroll Stack Container */}
      <div className="relative z-10 h-full">
        <ScrollStack 
            itemDistance={50} // More space between items
            itemScale={0.06}  // Stronger scaling effect
            itemStackDistance={25}
            stackPosition="280px" // Push stack down to clear the static header space
            scaleEndPosition="10%"
            scaleDuration={0.5}
            blurAmount={0} // Crisp look, no blur
            className="h-full"
        >
            {items.map((item, i) => (
                <ScrollStackItem key={i} itemClassName="bg-white rounded-3xl shadow-xl border border-gray-100 max-w-3xl mx-auto overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
                    <div className="flex flex-col md:flex-row h-full">
                        
                        {/* Left Side: Visual/Icon */}
                        <div className={`md:w-1/3 p-8 flex flex-col justify-between bg-gradient-to-br ${item.color} text-white relative overflow-hidden`}>
                            <div className="relative z-10">
                                <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-4 border border-white/10">
                                    {item.tag}
                                </span>
                                <item.icon className="w-12 h-12 text-white drop-shadow-md" />
                            </div>
                            
                            {/* Decorative Circle */}
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                            <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-xl" />
                        </div>

                        {/* Right Side: Content */}
                        <div className="md:w-2/3 p-8 md:p-10 flex flex-col justify-center bg-white relative">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-lg leading-relaxed mb-6">
                                {item.desc}
                            </p>
                            
                            {item.action ? (
                                <button className="self-start flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    Get Started
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 group-hover:text-gray-900 transition-colors">
                                    Learn more <ArrowRight className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollStackItem>
            ))}
        </ScrollStack>
      </div>
      
      {/* Bottom Fade for clean exit */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent z-20 pointer-events-none" />
    </section>
  );
};

export default MergedSection;
