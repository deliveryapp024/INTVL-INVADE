/**
 * Sound Service - Generates sounds programmatically
 * Uses Expo Audio to generate beeps and tones
 */

import { Audio } from 'expo-av';

let soundsEnabled = true;

export const SoundService = {
  setEnabled(enabled: boolean) {
    soundsEnabled = enabled;
  },

  getEnabled(): boolean {
    return soundsEnabled;
  },

  async playBeep(duration: number = 100, frequency: number = 800): Promise<void> {
    if (!soundsEnabled) return;
    
    try {
      // Create a simple beep using Audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: generateBeepUri(frequency, duration) },
        { shouldPlay: true, volume: 0.3 }
      );
      
      // Auto cleanup
      setTimeout(() => {
        sound.unloadAsync().catch(() => {});
      }, duration + 100);
    } catch (error) {
      console.log('Beep error:', error);
    }
  },

  async playCountdown(number: 3 | 2 | 1): Promise<void> {
    // Different pitches for countdown
    const frequencies = { 3: 600, 2: 800, 1: 1000 };
    await this.playBeep(150, frequencies[number]);
  },

  async playStart(): Promise<void> {
    if (!soundsEnabled) return;
    // Success sound - ascending tones
    await this.playBeep(100, 800);
    setTimeout(() => this.playBeep(100, 1000), 100);
    setTimeout(() => this.playBeep(200, 1200), 200);
  },

  async playCelebration(): Promise<void> {
    if (!soundsEnabled) return;
    // Victory melody
    const melody = [523, 659, 784, 1047]; // C, E, G, C
    for (let i = 0; i < melody.length; i++) {
      setTimeout(() => this.playBeep(150, melody[i]), i * 150);
    }
  },

  async playAchievement(): Promise<void> {
    if (!soundsEnabled) return;
    // Achievement sound
    await this.playBeep(100, 880);
    setTimeout(() => this.playBeep(200, 1109), 100);
  },

  async playZoneCapture(): Promise<void> {
    if (!soundsEnabled) return;
    // Zone captured sound
    await this.playBeep(100, 698);
    setTimeout(() => this.playBeep(200, 880), 100);
  },

  async playClick(): Promise<void> {
    if (!soundsEnabled) return;
    // Subtle click
    await this.playBeep(50, 1200);
  },
};

/**
 * Generate a data URI for a simple beep sound
 * This creates a WAV file programmatically
 */
function generateBeepUri(frequency: number, duration: number): string {
  const sampleRate = 44100;
  const numSamples = Math.floor((duration / 1000) * sampleRate);
  
  // Create WAV header
  const headerSize = 44;
  const dataSize = numSamples * 2; // 16-bit samples
  const buffer = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(buffer);
  
  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  
  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size
  view.setUint16(20, 1, true); // AudioFormat (PCM)
  view.setUint16(22, 1, true); // NumChannels (mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate
  view.setUint16(32, 2, true); // BlockAlign
  view.setUint16(34, 16, true); // BitsPerSample
  
  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Write audio data (sine wave)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    // Apply simple envelope to avoid clicking
    let envelope = 1;
    if (i < 1000) envelope = i / 1000;
    if (i > numSamples - 1000) envelope = (numSamples - i) / 1000;
    
    const value = Math.floor(sample * 32767 * envelope);
    view.setInt16(44 + i * 2, value, true);
  }
  
  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  
  return `data:audio/wav;base64,${base64}`;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export default SoundService;
