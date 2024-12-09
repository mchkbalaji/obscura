import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Download } from 'lucide-react';
import { detectFaces } from '../utils/faceDetection';
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

  const redrawScene = useCallback(async () => {
    if (!canvasRef.current || !originalImage) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // First, clear the canvas and draw the original image
    await redrawCanvas(originalImage);

    // Then apply all existing blur effects
    detections.forEach((face, index) => {
      const { box } = face.detection;
      if (blurredFaces.has(index)) {
        applyBlur(ctx, box.x, box.y, box.width, box.height);
      } else {
        drawFaceOutline(ctx, box.x, box.y, box.width, box.height);
      }
    });
  }, [originalImage, detections, blurredFaces, redrawCanvas]);

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
          drawFaceOutline(ctx, face.detection.box.x, face.detection.box.y, 
            face.detection.box.width, face.detection.box.height);
        }
      });
    };

    initializeCanvas();
  }, [image, setupCanvas]);

  useEffect(() => {
    redrawScene();
  }, [blurredFaces, redrawScene]);

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !detections.length || !originalImage) return;

    const { x, y } = getScaledCoordinates(e);

    detections.forEach((face, index) => {
      const { box } = face.detection;
      if (
        x >= box.x &&
        x <= box.x + box.width &&
        y >= box.y &&
        y <= box.y + box.height
      ) {
        const newBlurredFaces = new Set(blurredFaces);
        if (blurredFaces.has(index)) {
          // Remove blur if already blurred
          newBlurredFaces.delete(index);
        } else {
          // Add blur if not blurred
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