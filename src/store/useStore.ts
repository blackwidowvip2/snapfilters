import { create } from 'zustand';
import type { LandmarkList } from '../types';

interface Store {
  activeFilter: string;
  landmarks: LandmarkList | null;
  facingMode: 'user' | 'environment';
  isLoaded: boolean;
  capturedImage: string | null;
  frame: number;

  setFilter: (id: string) => void;
  setLandmarks: (lm: LandmarkList | null) => void;
  setFacingMode: (mode: 'user' | 'environment') => void;
  setLoaded: (v: boolean) => void;
  setCapturedImage: (url: string | null) => void;
  incrementFrame: () => void;
}

export const useStore = create<Store>((set) => ({
  activeFilter: 'none',
  landmarks: null,
  facingMode: 'user',
  isLoaded: false,
  capturedImage: null,
  frame: 0,

  setFilter: (id) => set({ activeFilter: id }),
  setLandmarks: (lm) => set({ landmarks: lm }),
  setFacingMode: (mode) => set({ facingMode: mode }),
  setLoaded: (v) => set({ isLoaded: v }),
  setCapturedImage: (url) => set({ capturedImage: url }),
  incrementFrame: () => set((s) => ({ frame: s.frame + 1 })),
}));
