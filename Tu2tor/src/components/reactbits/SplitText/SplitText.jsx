import React from 'react';
import { motion } from 'framer-motion';

const SplitText = ({
  text,
  className = '',
  delay = 0.1,
  duration = 0.5,
  stagger = 0.05,
  tag = 'div'
}) => {
  const words = text.split(' ');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: duration
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  const Tag = tag; // Dynamically select tag

  return (
    <Tag className={className}>
      <motion.div
        style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {words.map((word, index) => (
          <motion.span
            variants={child}
            style={{ marginRight: "0.25em", display: "inline-block" }}
            key={index}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>
    </Tag>
  );
};

export default SplitText;

