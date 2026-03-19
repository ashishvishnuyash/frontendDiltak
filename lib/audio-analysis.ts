/**
 * Audio Analysis Library for Lip Sync and Audio Processing
 * Provides real-time audio analysis capabilities for avatar lip sync
 */

export interface AudioAnalysisData {
  volume: number;
  frequency: number;
  viseme: string;
  timestamp: number;
}

export interface VisemeData {
  viseme: string;
  weight: number;
  timestamp: number;
}

/**
 * Maps frequency ranges to viseme types for lip sync
 */
const VISEME_MAPPING = {
  'sil': { min: 0, max: 100 },      // Silence
  'PP': { min: 100, max: 300 },     // P, B, M sounds
  'FF': { min: 300, max: 500 },     // F, V sounds
  'TH': { min: 500, max: 800 },     // TH sounds
  'DD': { min: 800, max: 1200 },    // T, D, N, L sounds
  'kk': { min: 1200, max: 1800 },   // K, G sounds
  'CH': { min: 1800, max: 2500 },   // CH, SH, J sounds
  'SS': { min: 2500, max: 3500 },   // S, Z sounds
  'nn': { min: 3500, max: 4500 },   // N sounds
  'RR': { min: 4500, max: 6000 },   // R sounds
  'aa': { min: 6000, max: 8000 },   // A sounds
  'E': { min: 8000, max: 10000 },   // E sounds
  'I': { min: 10000, max: 12000 },  // I sounds
  'O': { min: 12000, max: 14000 },  // O sounds
  'U': { min: 14000, max: 16000 },  // U sounds
};

/**
 * AudioAnalyzer class for real-time audio analysis
 */
export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private isAnalyzing = false;
  private animationFrame: number | null = null;
  private callbacks: ((data: AudioAnalysisData) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeAudioContext();
    }
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      console.log('✓ AudioAnalyzer initialized');
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * Connect audio element for analysis
   */
  connectAudioElement(audioElement: HTMLAudioElement): boolean {
    if (!this.audioContext || !this.analyser) {
      console.error('AudioContext not initialized');
      return false;
    }

    try {
      // Disconnect previous source
      if (this.source) {
        this.source.disconnect();
      }

      // Create new source
      this.source = this.audioContext.createMediaElementSource(audioElement);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);

      console.log('✓ Audio element connected to analyzer');
      return true;
    } catch (error) {
      console.error('Failed to connect audio element:', error);
      return false;
    }
  }

  /**
   * Start audio analysis
   */
  startAnalysis(): void {
    if (!this.analyser || !this.dataArray) {
      console.error('Analyzer not properly initialized');
      return;
    }

    if (this.isAnalyzing) {
      return;
    }

    this.isAnalyzing = true;
    this.analyze();
    console.log('✓ Audio analysis started');
  }

  /**
   * Stop audio analysis
   */
  stopAnalysis(): void {
    this.isAnalyzing = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    console.log('✓ Audio analysis stopped');
  }

  /**
   * Add callback for analysis data
   */
  onAnalysis(callback: (data: AudioAnalysisData) => void): void {
    this.callbacks.push(callback);
  }

  /**
   * Remove callback
   */
  removeCallback(callback: (data: AudioAnalysisData) => void): void {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * Main analysis loop
   */
  private analyze = (): void => {
    if (!this.isAnalyzing || !this.analyser || !this.dataArray) {
      return;
    }

    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);

    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    // Find dominant frequency
    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    // Convert bin index to frequency
    const frequency = (maxIndex * (this.audioContext!.sampleRate / 2)) / this.dataArray.length;

    // Map frequency to viseme
    const viseme = this.getVisemeFromFrequency(frequency, volume);

    // Create analysis data
    const analysisData: AudioAnalysisData = {
      volume,
      frequency,
      viseme,
      timestamp: Date.now(),
    };

    // Call all callbacks
    this.callbacks.forEach(callback => {
      try {
        callback(analysisData);
      } catch (error) {
        console.error('Error in analysis callback:', error);
      }
    });

    // Schedule next analysis
    this.animationFrame = requestAnimationFrame(this.analyze);
  };

  /**
   * Map frequency and volume to viseme
   */
  private getVisemeFromFrequency(frequency: number, volume: number): string {
    // If volume is too low, return silence
    if (volume < 0.01) {
      return 'sil';
    }

    // Find matching viseme based on frequency
    for (const [viseme, range] of Object.entries(VISEME_MAPPING)) {
      if (frequency >= range.min && frequency < range.max) {
        return viseme;
      }
    }

    // Default to silence if no match
    return 'sil';
  }

  /**
   * Get current audio data without callbacks
   */
  getCurrentData(): AudioAnalysisData | null {
    if (!this.analyser || !this.dataArray) {
      return null;
    }

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    const volume = Math.sqrt(sum / this.dataArray.length) / 255;

    let maxValue = 0;
    let maxIndex = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxValue) {
        maxValue = this.dataArray[i];
        maxIndex = i;
      }
    }

    const frequency = (maxIndex * (this.audioContext!.sampleRate / 2)) / this.dataArray.length;
    const viseme = this.getVisemeFromFrequency(frequency, volume);

    return {
      volume,
      frequency,
      viseme,
      timestamp: Date.now(),
    };
  }

  /**
   * Resume audio context if suspended
   */
  async resumeContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
        console.log('✓ AudioContext resumed');
      } catch (error) {
        console.error('Failed to resume AudioContext:', error);
      }
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopAnalysis();
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.dataArray = null;
    this.callbacks = [];

    console.log('✓ AudioAnalyzer disposed');
  }

  /**
   * Check if analyzer is ready
   */
  isReady(): boolean {
    return !!(this.audioContext && this.analyser && this.dataArray);
  }

  /**
   * Get audio context state
   */
  getContextState(): string {
    return this.audioContext?.state || 'closed';
  }
}

/**
 * Utility function to create viseme data from audio analysis
 */
export function createVisemeData(analysisData: AudioAnalysisData): VisemeData {
  return {
    viseme: analysisData.viseme,
    weight: Math.min(1, analysisData.volume * 2), // Scale volume to weight
    timestamp: analysisData.timestamp,
  };
}

/**
 * Utility function to smooth viseme transitions
 */
export function smoothVisemes(visemes: VisemeData[], smoothingFactor: number = 0.3): VisemeData[] {
  if (visemes.length < 2) return visemes;

  const smoothed: VisemeData[] = [visemes[0]];

  for (let i = 1; i < visemes.length; i++) {
    const current = visemes[i];
    const previous = smoothed[i - 1];

    // Smooth the weight
    const smoothedWeight = previous.weight * smoothingFactor + current.weight * (1 - smoothingFactor);

    smoothed.push({
      ...current,
      weight: smoothedWeight,
    });
  }

  return smoothed;
}

/**
 * Default export for convenience
 */
export default AudioAnalyzer;