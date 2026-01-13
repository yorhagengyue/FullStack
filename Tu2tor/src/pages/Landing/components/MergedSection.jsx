import React, { useState, useEffect, useRef } from 'react';
import { Shield, Target, Award, Search, Calendar, Trophy, Users, ArrowRight, Sparkles, UserPlus, Video, MessageSquare, Star, BookOpen, Brain } from 'lucide-react';
import ScrollStack, { ScrollStackItem } from '../../../components/reactbits/ScrollStack/ScrollStack';
import Squares from '../../../components/reactbits/Squares/Squares';
import CardSwap, { Card } from '../../../components/reactbits/CardSwap/CardSwap';

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
    }
  ];

  return (
    <section id="features" className="relative bg-white py-24 border-t border-gray-100">
       
       {/* Background */}
       <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Main Gradient */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-orange-50/50" />
         
         {/* Colored Blurs */}
         <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/40 blur-[120px]" />
         <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-orange-100/40 blur-[100px]" />
         <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-100/30 blur-[100px]" />
         
         {/* Dot Pattern Overlay */}
         <div className="absolute inset-0 opacity-[0.4]" 
              style={{
                backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                backgroundSize: '32px 32px'
              }} 
        />
      </div>

      {/* Top Section: Journey (CardSwap) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text Content */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-6">
                <Sparkles className="w-3 h-3" />
                  <span>Complete User Journey</span>
            </div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Your complete<br/>study toolkit.
            </h2>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed">
                From stuck on assignments to acing your exams. Follow these steps to master any TP IIT module.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">1</div>
                    <div>
                        <h4 className="font-bold text-gray-900">Create & Connect</h4>
                        <p className="text-gray-500 text-sm">Sign up with your TP email and find A-grade peers instantly.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">2</div>
                    <div>
                        <h4 className="font-bold text-gray-900">Learn Live</h4>
                        <p className="text-gray-500 text-sm">Book 1-on-1 sessions, video chat, and code together in real-time.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">3</div>
                    <div>
                        <h4 className="font-bold text-gray-900">Track & Grow</h4>
                        <p className="text-gray-500 text-sm">Earn peer credits, save AI notes, and level up your skills.</p>
                    </div>
                </div>
          </div>
       </div>

            {/* CardSwap Demo */}
            <div className="h-[600px] w-full relative flex items-start justify-center lg:justify-end pt-30">
              <CardSwap
                width={380}
                height={480}
                cardDistance={45}
                verticalDistance={45}
                delay={3000}
                pauseOnHover={true}
                skewAmount={2}
                easing="elastic"
              >
                {/* Card 1 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">01</div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">STEP 1</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Sign Up</h2>
                  </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Create your account using your TP email. Set up your profile with your best modules.
                  </p>
                  <div className="h-1.5 w-16 bg-blue-500 rounded-full mt-4"></div>
                </Card>

                {/* Card 2 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">02</div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-purple-600 uppercase tracking-widest mb-3">STEP 2</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Search</h2>
                  </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Find peers by module code, rating, or expertise using smart filters.
                  </p>
                  <div className="h-1.5 w-16 bg-purple-500 rounded-full mt-4"></div>
                </Card>

                {/* Card 3 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">03</div>
                            <div className="relative z-10">
                    <h3 className="text-sm font-bold text-pink-600 uppercase tracking-widest mb-3">STEP 3</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Book</h2>
                            </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Schedule a live study session at a time that works for both of you.
                  </p>
                  <div className="h-1.5 w-16 bg-pink-500 rounded-full mt-4"></div>
                </Card>

                {/* Card 4 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">04</div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-green-600 uppercase tracking-widest mb-3">STEP 4</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Learn</h2>
                        </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Work together in real-time with video, chat, and shared code editors.
                  </p>
                  <div className="h-1.5 w-16 bg-green-500 rounded-full mt-4"></div>
                </Card>

                {/* Card 5 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">05</div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-3">STEP 5</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Review</h2>
                  </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Rate your peer session. Earn credits by helping others in your strong modules.
                  </p>
                  <div className="h-1.5 w-16 bg-orange-500 rounded-full mt-4"></div>
                </Card>

                {/* Card 6 */}
                <Card className="bg-white border border-gray-200 p-8 flex flex-col justify-between shadow-2xl">
                  <div className="text-7xl font-black text-gray-200/50 absolute top-4 right-4">06</div>
                  <div className="relative z-10">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest mb-3">STEP 6</h3>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3">Notes</h2>
                                </div>
                  <p className="text-gray-500 text-lg leading-relaxed relative z-10 font-medium">
                    Get AI-generated smart notes from your sessions to review later.
                  </p>
                  <div className="h-1.5 w-16 bg-indigo-500 rounded-full mt-4"></div>
                </Card>
              </CardSwap>
                        </div>
                    </div>
      </div>
    </section>
  );
};

export default MergedSection;
