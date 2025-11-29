import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Award, Target } from 'lucide-react';
import SpotlightCard from '../../../components/reactbits/SpotlightCard/SpotlightCard';

const Features = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const features = [
    { icon: Shield, title: "Verified Students", desc: "All tutors are verified students who have achieved 'A' grades in their respective modules." },
    { icon: Clock, title: "Flexible Booking", desc: "Book sessions that fit your timetable. Reschedule easily with our dynamic calendar system." },
    { icon: Award, title: "Gamified Learning", desc: "Earn badges and reputation points. Build your academic portfolio while helping others." },
    { icon: Target, title: "Smart Matching", desc: "Our AI algorithm matches you with the best tutor based on your learning style and needs." }
  ];

  return (
    <section id="features" className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInUp}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Everything you need to excel
          </h2>
          <p className="text-xl text-gray-600">
            Platform features designed specifically for the polytechnic student journey.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerChildren}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp} className="h-full">
              <SpotlightCard 
                className="h-full bg-white border-gray-200 hover:border-primary-200 hover:shadow-xl transition-all duration-300 group" 
                spotlightColor="rgba(59, 130, 246, 0.1)"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
