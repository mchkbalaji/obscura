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
    return await faceapi
      .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};