import React from 'react';
import Webcam from 'react-webcam';

const WebcamComponent = () => {
  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  return (
    <Webcam
      videoConstraints={videoConstraints}
      audio={false}
      screenshotFormat="image/jpeg"
    />
  );
};

export default WebcamComponent;