import * as faceapi from 'face-api.js';
import { MODEL_URLS } from './constants';

export const loadModels = async () => {
  try {
    // Load models directly from URLs
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URLS.TINY_FACE_DETECTOR),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URLS.FACE_LANDMARKS)
    ]);
    return true;
  } catch (error) {
    console.error('Error loading face detection models:', error);
    return false;
  }
};

export const detectFaces = async (image: HTMLImageElement) => {
  try {
    // Configure TinyFaceDetector for better detection
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 608,      // Larger input size for better detection
      scoreThreshold: 0.3  // Lower threshold to detect more faces
    });

    // Detect faces with landmarks
    const detections = await faceapi
      .detectAllFaces(image, options)
      .withFaceLandmarks();

    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

// Helper to get extended forehead points with more coverage
export const getExtendedForeheadPoints = (
  landmarks: faceapi.FaceLandmarks68
) => {
  const leftEyebrow = landmarks.getLeftEyeBrow();
  const rightEyebrow = landmarks.getRightEyeBrow();
  const jawline = landmarks.getJawOutline();
  
  // Get the topmost points of eyebrows
  const eyebrowY = Math.min(
    ...leftEyebrow.map(p => p.y),
    ...rightEyebrow.map(p => p.y)
  );
  
  // Get face width from jawline
  const leftX = jawline[0].x;
  const rightX = jawline[jawline.length - 1].x;
  
  // Calculate face height (from eyebrows to chin)
  const chinY = Math.max(...jawline.map(p => p.y));
  const faceHeight = chinY - eyebrowY;
  
  // Set forehead height to half of the face height
  const foreheadHeight = faceHeight * 0.3;
  const topY = eyebrowY - foreheadHeight;
  
  // Create forehead curve points
  const foreheadPoints = [];
  const steps = 12; // Steps for smooth curve
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = leftX + (rightX - leftX) * t;
    
    // Create a subtle natural curve
    const curveAmount = Math.sin(t * Math.PI) * (foreheadHeight * 0.05);
    const y = topY + curveAmount;
    
    foreheadPoints.push({ x, y });
  }
  
  return foreheadPoints;
};