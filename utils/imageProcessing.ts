import { ImageSlice } from '../types';

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

export const splitImage = async (imageSrc: string): Promise<ImageSlice[]> => {
  const img = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const pieceWidth = Math.floor(img.width / 3);
  const pieceHeight = Math.floor(img.height / 3);
  const slices: ImageSlice[] = [];

  // Loop 3x3 grid
  let idCounter = 0;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      // Resize canvas for the slice
      canvas.width = pieceWidth;
      canvas.height = pieceHeight;

      // Draw the specific portion of the image
      // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      ctx.clearRect(0, 0, pieceWidth, pieceHeight);
      ctx.drawImage(
        img,
        col * pieceWidth, // source x
        row * pieceHeight, // source y
        pieceWidth, // source width
        pieceHeight, // source height
        0, // dest x
        0, // dest y
        pieceWidth, // dest width
        pieceHeight // dest height
      );

      const dataUrl = canvas.toDataURL('image/png');

      slices.push({
        id: idCounter++,
        dataUrl,
        width: pieceWidth,
        height: pieceHeight,
        x: col,
        y: row,
        isAnalyzing: false,
      });
    }
  }

  return slices;
};