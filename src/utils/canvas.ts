export const applyBlur = (
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[]
) => {
  try {
    // Create a path for the face shape
    ctx.beginPath();
    ctx.moveTo(landmarks[0].x, landmarks[0].y);
    for (let i = 1; i < landmarks.length; i++) {
      ctx.lineTo(landmarks[i].x, landmarks[i].y);
    }
    ctx.closePath();

    // Save the current canvas state
    ctx.save();

    // Create a clipping region for the face
    ctx.clip();

    // Apply blur effect to the clipped region
    const region = getRegionBounds(landmarks);
    const { x, y, width, height } = region;

    // Create a temporary canvas for blur effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Set temporary canvas size
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Copy the region to temp canvas
    tempCtx.drawImage(
      ctx.canvas,
      x, y, width, height,
      0, 0, width, height
    );

    // Apply blur
    tempCtx.filter = 'blur(20px)';
    tempCtx.drawImage(tempCanvas, 0, 0);
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Draw the blurred region back
    ctx.drawImage(tempCanvas, x, y);

    // Restore canvas state
    ctx.restore();
  } catch (error) {
    console.error('Error applying blur effect:', error);
  }
};

export const drawFaceOutline = (
  ctx: CanvasRenderingContext2D,
  landmarks: { x: number; y: number }[]
) => {
  ctx.beginPath();
  ctx.moveTo(landmarks[0].x, landmarks[0].y);
  
  for (let i = 1; i < landmarks.length; i++) {
    ctx.lineTo(landmarks[i].x, landmarks[i].y);
  }
  
  ctx.closePath();
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
};

// Helper function to get bounds of a region defined by points
const getRegionBounds = (points: { x: number; y: number }[]) => {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  const width = Math.max(...xs) - x;
  const height = Math.max(...ys) - y;
  
  return { x, y, width, height };
};