import { useCallback } from 'react';

export const useCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const setupCanvas = useCallback(async (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);
    return ctx;
  }, [canvasRef]);

  const redrawCanvas = useCallback(async (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw the original image
    ctx.drawImage(img, 0, 0);
    return ctx;
  }, [canvasRef]);

  const getScaledCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, [canvasRef]);

  return {
    setupCanvas,
    redrawCanvas,
    getScaledCoordinates
  };
};