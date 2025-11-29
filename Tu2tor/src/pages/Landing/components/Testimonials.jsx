import React from 'react';
import ScrollVelocity from '../../../components/reactbits/ScrollVelocity/ScrollVelocity';

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 overflow-hidden bg-gray-50 border-t border-gray-100">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Trusted by students</h2>
      </div>
      
      <div className="space-y-12">
        <ScrollVelocity
          texts={['"Tu2tor saved my GPA!"', '"Best platform for finding study buddies."', '"Super easy to use and effective."']} 
          velocity={50} 
          className="text-2xl font-medium text-gray-400 mx-8"
        />
        
        <ScrollVelocity 
          texts={['"I learned more in 1 hour than 3 lectures."', '"Verified tutors make a huge difference."', '"Highly recommended for poly students."']} 
          velocity={30} 
          className="text-2xl font-medium text-blue-300 mx-8"
        />
      </div>
    </section>
  );
};

export default Testimonials;
