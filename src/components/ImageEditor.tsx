import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { detectFaces, getExtendedForeheadPoints } from '../utils/faceDetection';
import { applyBlur, drawFaceOutline } from '../utils/canvas';
import * as faceapi from 'face-api.js';
import { useCanvas } from '../hooks/useCanvas';

interface ImageEditorProps {
  image: string;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ image }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [blurredFaces, setBlurredFaces] = useState<Set<number>>(new Set());
  const [detections, setDetections] = useState<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }>[]>([]);
  const { setupCanvas, getScaledCoordinates, redrawCanvas } = useCanvas(canvasRef);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  const getFaceLandmarksPoints = useCallback((landmarks: faceapi.FaceLandmarks68) => {
    // Get jaw line points
    const jawPoints = landmarks.getJawOutline();
    
    // Get points above the eyebrows including extended forehead
    const foreheadPoints = getExtendedForeheadPoints(landmarks);
    
    // Combine all points to create a complete face outline
    return [
      ...jawPoints,
      ...foreheadPoints.reverse()
    ].map(pt => ({ x: pt.x, y: pt.y }));
  }, []);

  const redrawScene = useCallback(async () => {
    if (!canvasRef.current || !originalImage) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // First, clear the canvas and draw the original image
    await redrawCanvas(originalImage);

    // Then apply all existing blur effects and outlines
    detections.forEach((face, index) => {
      const landmarks = getFaceLandmarksPoints(face.landmarks);
      if (blurredFaces.has(index)) {
        applyBlur(ctx, landmarks);
      } else {
        drawFaceOutline(ctx, landmarks);
      }
    });
  }, [originalImage, detections, blurredFaces, redrawCanvas, getFaceLandmarksPoints]);

  useEffect(() => {
    const initializeCanvas = async () => {
      if (!canvasRef.current) return;

      const img = new Image();
      img.src = image;
      await img.decode();
      setOriginalImage(img);

      const ctx = await setupCanvas(img);
      if (!ctx) return;

      const faces = await detectFaces(img);
      setDetections(faces);

      // Initial draw of face outlines
      faces.forEach((face, index) => {
        if (!blurredFaces.has(index)) {
          const landmarks = getFaceLandmarksPoints(face.landmarks);
          drawFaceOutline(ctx, landmarks);
        }
      });
    };

    initializeCanvas();
  }, [image, setupCanvas, getFaceLandmarksPoints]);

  useEffect(() => {
    redrawScene();
  }, [blurredFaces, redrawScene]);

  const isPointInPath = (ctx: CanvasRenderingContext2D, x: number, y: number, landmarks: { x: number; y: number }[]) => {
    ctx.beginPath();
    ctx.moveTo(landmarks[0].x, landmarks[0].y);
    for (let i = 1; i < landmarks.length; i++) {
      ctx.lineTo(landmarks[i].x, landmarks[i].y);
    }
    ctx.closePath();
    return ctx.isPointInPath(x, y);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !detections.length || !originalImage) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const { x, y } = getScaledCoordinates(e);

    detections.forEach((face, index) => {
      const landmarks = getFaceLandmarksPoints(face.landmarks);
      if (isPointInPath(ctx, x, y, landmarks)) {
        const newBlurredFaces = new Set(blurredFaces);
        if (blurredFaces.has(index)) {
          newBlurredFaces.delete(index);
        } else {
          newBlurredFaces.add(index);
        }
        setBlurredFaces(newBlurredFaces);
      }
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'obscured-image.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="max-w-full cursor-pointer border rounded-lg shadow-lg"
        />
        {detections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-lg">
            No faces detected in this image
          </div>
        )}
      </div>
      <p className="text-sm text-gray-600">
        Click on a face to toggle blur effect
      </p>
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        disabled={detections.length === 0}
      >
        <Download className="w-5 h-5" />
        Download Image
      </button>
    </div>
  );
};

export default ImageEditor;