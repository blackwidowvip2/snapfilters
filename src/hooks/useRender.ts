import { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { applyPixelFilter, applyOverlayFilter } from '../filters/renderer';

export function useRender(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const { activeFilter, landmarks, isLoaded } = useStore();
  const filterRef = useRef(activeFilter);
  const landmarksRef = useRef(landmarks);

  useEffect(() => { filterRef.current = activeFilter; }, [activeFilter]);
  useEffect(() => { landmarksRef.current = landmarks; }, [landmarks]);

  useEffect(() => {
    if (!isLoaded) return;
    let rafId: number;

    const frame = (ts: number) => {
      rafId = requestAnimationFrame(frame);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      // Keep canvas in sync with video resolution
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width  = video.videoWidth  || window.innerWidth;
        canvas.height = video.videoHeight || window.innerHeight;
      }

      const W = canvas.width, H = canvas.height;
      if (!W || !H || video.paused || video.ended) return;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      const t = ts / 1000;
      const f = filterRef.current;
      const lm = landmarksRef.current;

      // Draw mirrored video
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -W, 0, W, H);
      ctx.restore();

      // Pixel-space filter (runs on full ImageData)
      applyPixelFilter(ctx, f, W, H, t);

      // Canvas overlay (face-tracked decorations)
      applyOverlayFilter(ctx, f, lm, W, H, t);
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [isLoaded, videoRef, canvasRef]);
}
