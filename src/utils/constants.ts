export const FACE_API_WEIGHTS_PATH = '/models';

export const MODEL_URLS = {
  TINY_FACE_DETECTOR: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json',
  FACE_LANDMARKS: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json'
} as const;

export const MODELS = {
  TINY_FACE_DETECTOR: 'tiny_face_detector_model',
  FACE_LANDMARKS: 'face_landmark_68_model',
} as const;