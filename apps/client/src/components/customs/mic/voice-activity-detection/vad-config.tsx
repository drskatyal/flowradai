'use client';

import { useEffect } from 'react';

/**
 * This component configures the VAD (Voice Activity Detection) library
 * with the correct paths to the worklet and model files.
 * 
 * It should be imported once at the app root level.
 */
export function VADConfig() {
  useEffect(() => {
    // Only run on the client-side
    if (typeof window === 'undefined') return;
    
    // Set up the paths for VAD to find its required files
    window.VAD_WORKLET_PATH = '/vad/vad.worklet.bundle.min.js';
    window.SILERO_MODEL_PATH = '/vad/silero_vad_v5.onnx';
    window.ONNX_WASM_PATH = '/vad/ort-wasm.wasm';
    window.ONNX_SIMD_WASM_PATH = '/vad/ort-wasm-simd.wasm';
  }, []);

  return null;
}

// Extend the Window interface to include the VAD configuration properties
declare global {
  interface Window {
    VAD_WORKLET_PATH: string;
    SILERO_MODEL_PATH: string;
    ONNX_WASM_PATH: string;
    ONNX_SIMD_WASM_PATH: string;
  }
} 