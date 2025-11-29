import React from 'react';
import CountUp from '../../../components/reactbits/CountUp/CountUp';

const Stats = () => {
  return (
    <div className="bg-white border-t border-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={500}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
              <span>+</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Active Tutors</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={1200}
                separator=","
                direction="up"
                duration={1.2}
                className="count-up-text"
              />
              <span>+</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Sessions Completed</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={98}
                direction="up"
                duration={1.5}
                className="count-up-text"
              />
              <span>%</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Satisfaction Rate</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={4.9}
                direction="up"
                duration={1}
                className="count-up-text"
              />
              <span>/5</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;

