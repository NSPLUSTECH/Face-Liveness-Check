import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

const FaceDetectionComponent = () => {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model-weights_manifest.json'); // Adjust model path
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model-weights_manifest.json');
      setModelsLoaded(true);
    };

    loadModels();
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      const interval = setInterval(async () => {
        const webcamElement = webcamRef.current.video;
        if (webcamElement.readyState === 4) {
          const detection = await faceapi.detectSingleFace(
            webcamElement,
            new faceapi.TinyFaceDetectorOptions()
          );
          setFaceDetected(!!detection);
        }
      }, 1000);

      return () => clearInterval(interval); // Clean up interval on unmount
    }
  }, [modelsLoaded]);

  return (
    <div>
      <Webcam ref={webcamRef} />
      <p>{faceDetected ? "Face Detected" : "No Face Detected"}</p>
    </div>
  );
};

export default FaceDetectionComponent;