import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';

// Additional setup in the previous component
const detectLandmarks = async (webcamRef) => {
    const video = webcamRef.current.video;
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
  
    return detection ? detection.landmarks : null;
  };

const calculateEyeAspectRatio = (eye) => {
    const a = faceapi.euclideanDistance(eye[1], eye[5]); // Vertical distance
    const b = faceapi.euclideanDistance(eye[2], eye[4]); // Vertical distance
    const c = faceapi.euclideanDistance(eye[0], eye[3]); // Horizontal distance
    //console.log("a:", a, "b:", b, "c:", c); // Should be non-zero
    return (a + b) / (2 * c); // Calculate EAR
  };

const checkEyeBlink = (landmarks) => {
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    //console.log("Left Eye Landmarks:", leftEye);
    //console.log("Right Eye Landmarks:", rightEye);
    const leftEAR = calculateEyeAspectRatio(leftEye);
    const rightEAR = calculateEyeAspectRatio(rightEye);
  
    const avgEAR = (leftEAR + rightEAR) / 2; // Average EAR for both eyes 
    //console.log("avgEAR: ", avgEAR); 
    return avgEAR < 0.2; // Threshold for eye blink detection (0.2 is common)
  };

const LivenessCheckComponent = () => {
    const [modelsLoaded, setModelsLoaded] = useState(false); // Define modelsLoaded with useState
    const webcamRef = useRef(null); // Define webcamRef with useRef
    //const [faceDetected, setFaceDetected] = useState(false);
    const [eyeBlinkDetected, setEyeBlinkDetected] = useState(false);
  
    // Load models asynchronously on component mount
    useEffect(() => {
        const loadModels = async () => {
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector_model-weights_manifest.json'); // Adjust model path
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68_model-weights_manifest.json');
          setModelsLoaded(true);
        };
    
        loadModels();
      }, []);

  // Monitor for eye blinks when models are loaded
  useEffect(() => {
    if (modelsLoaded) {
      const interval = setInterval(async () => {
        const landmarks = await detectLandmarks(webcamRef);
        if (landmarks) {
          const isBlinking = checkEyeBlink(landmarks); // Check if an eye blink occurred
          setEyeBlinkDetected(isBlinking);
        }
      }, 1000);

      return () => clearInterval(interval); // Clean up interval on component unmount
    }
  }, [modelsLoaded]); // Dependency: run when modelsLoaded changes

  return (
    <div>
      <Webcam ref={webcamRef} />
      <p>{eyeBlinkDetected ? "Eye Blink Detected" : "No Eye Blink Detected"}</p>
    </div>
  );
};

export default LivenessCheckComponent;