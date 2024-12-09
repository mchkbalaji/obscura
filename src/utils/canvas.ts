export const applyBlur = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  try {
    // Create a temporary canvas to apply the blur effect
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Set the temporary canvas size to the region we want to blur
    tempCanvas.width = width;
    tempCanvas.height = height;

    // Copy the region to the temporary canvas
    tempCtx.drawImage(
      ctx.canvas,
      x, y, width, height,  // source coordinates
      0, 0, width, height   // destination coordinates
    );

    // Apply a strong blur effect using multiple passes
    tempCtx.filter = 'blur(15px)';
    tempCtx.drawImage(tempCanvas, 0, 0);
    tempCtx.drawImage(tempCanvas, 0, 0);

    // Draw the blurred region back to the main canvas
    ctx.drawImage(tempCanvas, x, y);
    
    // Reset the filter
    ctx.filter = 'none';
  } catch (error) {
    console.error('Error applying blur effect:', error);
  }
};

export const drawFaceOutline = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(x, y, width, height);
  ctx.setLineDash([]); // Reset dash pattern
};