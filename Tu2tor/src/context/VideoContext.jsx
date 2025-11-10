import { createContext, useContext, useState } from 'react';

const VideoContext = createContext();

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
};

export const VideoProvider = ({ children }) => {
  const [floatingVideo, setFloatingVideo] = useState(null);

  const startFloatingVideo = (videoData) => {
    setFloatingVideo(videoData);
  };

  const stopFloatingVideo = () => {
    setFloatingVideo(null);
  };

  return (
    <VideoContext.Provider
      value={{
        floatingVideo,
        startFloatingVideo,
        stopFloatingVideo,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};
