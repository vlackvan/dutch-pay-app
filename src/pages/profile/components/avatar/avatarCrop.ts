// src/pages/profile/components/avatar/avatarCrop.ts
import type { AvatarConfig } from './avatar.types';
import { getBodyImagePath, getEyesImagePath, getMouthImagePath } from './AvatarAssets';

const BASE = 512;

// Figma reference coordinates for positioning (matching AvatarCanvas.tsx)
const EYES = { x: 238, y: 58, w: 137, h: 137 };
const MOUTH = { x: 256, y: 116, w: 108, h: 108 };

// Crop coordinates based on 500x500 reference, scaled to 512x512
const SCALE_FACTOR = BASE / 500; // 1.024
const CROP_X = 115 * SCALE_FACTOR;
const CROP_Y = 10 * SCALE_FACTOR;
const CROP_WIDTH = 270 * SCALE_FACTOR;
const CROP_HEIGHT = 290 * SCALE_FACTOR;

/**
 * Loads an image from a URL and returns a Promise that resolves with the HTMLImageElement
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Flattens the avatar layers onto a canvas and crops the specified region
 * @param config - The avatar configuration
 * @returns A Promise that resolves with a Blob containing the cropped PNG
 */
export async function cropAvatarToBlob(config: AvatarConfig): Promise<Blob> {
  const canvas = await generateFullAvatarCanvas(config);

  const cropCanvas = document.createElement('canvas');
  cropCanvas.width = CROP_WIDTH;
  cropCanvas.height = CROP_HEIGHT;
  const cropCtx = cropCanvas.getContext('2d');

  if (!cropCtx) {
    throw new Error('Failed to get 2D context for crop canvas');
  }

  cropCtx.drawImage(
    canvas,
    CROP_X,
    CROP_Y,
    CROP_WIDTH,
    CROP_HEIGHT,
    0,
    0,
    CROP_WIDTH,
    CROP_HEIGHT
  );

  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

export async function cropAvatarToDataURL(config: AvatarConfig): Promise<string> {
  const blob = await cropAvatarToBlob(config);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateFullAvatarBlob(config: AvatarConfig): Promise<Blob> {
  const canvas = await generateFullAvatarCanvas(config);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create full avatar blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

async function generateFullAvatarCanvas(config: AvatarConfig): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = BASE;
  canvas.height = BASE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  const [bodyImg, eyesImg, mouthImg] = await Promise.all([
    loadImage(getBodyImagePath(config.body)),
    loadImage(getEyesImagePath(config.eyes)),
    loadImage(getMouthImagePath(config.mouth)),
  ]);

  ctx.drawImage(bodyImg, 0, 0, BASE, BASE);
  ctx.drawImage(eyesImg, EYES.x, EYES.y, EYES.w, EYES.h);
  ctx.drawImage(mouthImg, MOUTH.x, MOUTH.y, MOUTH.w, MOUTH.h);

  return canvas;
}
