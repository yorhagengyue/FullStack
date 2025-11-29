import React from 'react';
import { motion } from 'framer-motion';
import TiltedCard from '../../../components/reactbits/TiltedCard/TiltedCard';

const HowItWorks = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <section id="how" className="py-24 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl font-semibold text-gray-900 mb-3">
            Three simple steps
          </h2>
          <p className="text-lg text-gray-600">
            From search to session in minutes
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="grid md:grid-cols-3 gap-12"
        >
          {/* Step 1 */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="mb-8 w-full flex justify-center">
              <div className="relative w-64 h-64">
                <TiltedCard
                  imageSrc="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  altText="Search for tutors"
                  captionText="Smart Search"
                  containerHeight="250px"
                  containerWidth="250px"
                  imageHeight="250px"
                  imageWidth="250px"
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="absolute inset-0 bg-black/20 rounded-[15px] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">01</span>
                    </div>
                  }
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Find your tutor</h3>
            <p className="text-gray-600">Search by course code or subject. Filter by rating, availability, and price.</p>
          </motion.div>

          {/* Step 2 */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="mb-8 w-full flex justify-center">
              <div className="relative w-64 h-64">
                <TiltedCard
                  imageSrc="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  altText="Book a session"
                  captionText="Instant Booking"
                  containerHeight="250px"
                  containerWidth="250px"
                  imageHeight="250px"
                  imageWidth="250px"
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="absolute inset-0 bg-black/20 rounded-[15px] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">02</span>
                    </div>
                  }
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Book a session</h3>
            <p className="text-gray-600">Choose a time that works for both of you. Meet on campus or online.</p>
          </motion.div>

          {/* Step 3 */}
          <motion.div variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="mb-8 w-full flex justify-center">
              <div className="relative w-64 h-64">
                <TiltedCard
                  imageSrc="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  altText="Learn and grow"
                  captionText="Achieve Goals"
                  containerHeight="250px"
                  containerWidth="250px"
                  imageHeight="250px"
                  imageWidth="250px"
                  rotateAmplitude={10}
                  scaleOnHover={1.05}
                  showMobileWarning={false}
                  showTooltip={true}
                  displayOverlayContent={true}
                  overlayContent={
                    <div className="absolute inset-0 bg-black/20 rounded-[15px] flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">03</span>
                    </div>
                  }
                />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Learn and grow</h3>
            <p className="text-gray-600">Get personalized help from someone who's recently mastered the material.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;

