// utils/audio.ts

/**
 * Converts a Float32Array of audio samples into a WAV Blob.
 *
 * @param float32Array - The audio samples in Float32Array format.
 * @param sampleRate - The sample rate of the audio. Defaults to 16000 Hz.
 * @returns A Blob representing the WAV audio file.
 */
const float32ToWavBlob = (
  float32Array: Float32Array,
  sampleRate: number = 16000
): Blob => {
  const numChannels = 1; // Mono audio
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = float32Array.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // Helper to write ASCII string
  const writeString = (offset: number, str: string) => {
    str.split('').forEach((char, i) => {
      view.setUint8(offset + i, char.charCodeAt(0));
    });
  };

  // WAV header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM format
  view.setUint16(20, 1, true);  // Linear quantization
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // Write PCM samples using forEach
  let offset = 44;
  float32Array.forEach(sample => {
    const clamped = Math.max(-1, Math.min(1, sample));
    const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF;
    view.setInt16(offset, intSample, true);
    offset += 2;
  });

  return new Blob([view], { type: 'audio/wav' });
};

export default float32ToWavBlob;