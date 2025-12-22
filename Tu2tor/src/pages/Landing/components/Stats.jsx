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
                to={300}
                separator=","
                direction="up"
                duration={1}
                className="count-up-text"
              />
              <span>+</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Active Peer Tutors</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={800}
                separator=","
                direction="up"
                duration={1.2}
                className="count-up-text"
              />
              <span>+</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Study Sessions</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={95}
                direction="up"
                duration={1.5}
                className="count-up-text"
              />
              <span>%</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Success Rate</div>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-bold text-primary-600 flex justify-center items-baseline">
              <CountUp
                from={0}
                to={4.8}
                direction="up"
                duration={1}
                className="count-up-text"
              />
              <span>/5</span>
            </div>
            <div className="text-sm text-gray-500 font-medium uppercase tracking-wider">Peer Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;

