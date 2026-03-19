/**
 * LipSyncDemo - Comprehensive demo component showing all lip sync features
 * Use this as a reference for implementing lip sync in your chat interface
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Play, Pause, Square, Volume2 } from 'lucide-react';
import AvatarController from './AvatarController';
import { useTTSLipSync } from './TTSLipSync';
import { VisemeData } from './LipSyncAnalyzer';

export default function LipSyncDemo() {
  // Demo state
  const [demoMode, setDemoMode] = useState<'microphone' | 'tts' | 'audio'>('tts');
  const [isRecording, setIsRecording] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('IDLE');
  const [currentViseme, setCurrentViseme] = useState<VisemeData | null>(null);
  
  // TTS state
  const [ttsText, setTtsText] = useState('Hello! I am your AI assistant. How can I help you today?');
  const [ttsVoiceId, setTtsVoiceId] = useState<string>('pNInz6obpgDQGcFmaJgB'); // Default: Adam voice
  const [ttsRate, setTtsRate] = useState([0.9]);
  const [ttsPitch, setTtsPitch] = useState([1]);
  const [ttsVolume, setTtsVolume] = useState([1]);
  
  // Audio playback state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // Available ElevenLabs voices (common free tier voices)
  const voices = [
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
    { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh' },
    { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli' },
  ];
  
  // TTS hook
  const { speak, stop, isPlaying: isTTSPlaying } = useTTSLipSync();

  // Handle viseme updates
  const handleVisemeUpdate = useCallback((viseme: VisemeData) => {
    setCurrentViseme(viseme);
  }, []);

  // Microphone recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        alert('Microphone access is required for this demo');
      }
    }
  }, [isRecording]);

  // TTS controls
  const handleTTSSpeak = useCallback(() => {
    if (isTTSPlaying) {
      stop();
    } else {
      speak(ttsText, {
        voiceId: ttsVoiceId,
        rate: ttsRate[0],
        pitch: ttsPitch[0],
        volume: ttsVolume[0]
      });
    }
  }, [ttsText, ttsVoiceId, ttsRate, ttsPitch, ttsVolume, isTTSPlaying, speak, stop]);

  // Audio file handling
  const handleAudioFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      
      // Create audio URL and set to audio element
      const audioUrl = URL.createObjectURL(file);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
      }
    }
  }, []);

  const toggleAudioPlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.play();
      setIsAudioPlaying(true);
    }
  }, [isAudioPlaying]);

  // Determine if avatar is speaking
  const isSpeaking = demoMode === 'microphone' ? isRecording : 
                   demoMode === 'tts' ? isTTSPlaying : 
                   isAudioPlaying;

  // Determine lip sync source
  const lipSyncSource = demoMode === 'microphone' ? 'microphone' :
                       demoMode === 'tts' ? 'text' :
                       'playback';

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Volume2 className="h-6 w-6" />
            <span>Lip Sync Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avatar Display */}
            <div className="space-y-4">
              <div className="h-96 bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg overflow-hidden relative" style={{ maxWidth: '100%', maxHeight: '24rem' }}>
                <AvatarController
                  emotion={currentEmotion}
                  speaking={isSpeaking}
                  scale={1.2} // Fixed reasonable scale for demo
                />
              </div>
              
              {/* Viseme Display */}
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant={isSpeaking ? "default" : "secondary"}>
                    {isSpeaking ? "Speaking" : "Silent"}
                  </Badge>
                  {currentViseme && (
                    <Badge variant="outline">
                      {currentViseme.viseme} ({(currentViseme.intensity * 100).toFixed(0)}%)
                    </Badge>
                  )}
                </div>
                <Select value={currentEmotion} onValueChange={setCurrentEmotion}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDLE">Idle</SelectItem>
                    <SelectItem value="HAPPY">Happy</SelectItem>
                    <SelectItem value="ANGRY">Angry</SelectItem>
                    <SelectItem value="LAUGHING">Laughing</SelectItem>
                    <SelectItem value="VICTORY">Victory</SelectItem>
                    <SelectItem value="CLAPPING">Clapping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Demo Mode</label>
                <Select value={demoMode} onValueChange={(value: any) => setDemoMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tts">Text-to-Speech</SelectItem>
                    <SelectItem value="microphone">Microphone Input</SelectItem>
                    <SelectItem value="audio">Audio File Playback</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TTS Controls */}
              {demoMode === 'tts' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Text to Speak</label>
                    <textarea
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      className="w-full p-2 border rounded resize-none"
                      rows={3}
                      placeholder="Enter text to speak..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice</label>
                    <Select 
                      value={ttsVoiceId} 
                      onValueChange={(voiceId) => {
                        setTtsVoiceId(voiceId);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            {voice.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rate: {ttsRate[0]}</label>
                      <Slider
                        value={ttsRate}
                        onValueChange={setTtsRate}
                        min={0.5}
                        max={2}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pitch: {ttsPitch[0]}</label>
                      <Slider
                        value={ttsPitch}
                        onValueChange={setTtsPitch}
                        min={0.5}
                        max={2}
                        step={0.1}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Volume: {ttsVolume[0]}</label>
                      <Slider
                        value={ttsVolume}
                        onValueChange={setTtsVolume}
                        min={0}
                        max={1}
                        step={0.1}
                      />
                    </div>
                  </div>

                  <Button onClick={handleTTSSpeak} className="w-full">
                    {isTTSPlaying ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop Speaking
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Microphone Controls */}
              {demoMode === 'microphone' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Click the button below to start/stop microphone recording.
                      The avatar will lip sync to your voice in real-time.
                    </p>
                    <Button 
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-5 w-5 mr-2" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-5 w-5 mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Audio File Controls */}
              {demoMode === 'audio' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioFileChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>

                  {audioFile && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        Selected: {audioFile.name}
                      </p>
                      <Button 
                        onClick={toggleAudioPlayback}
                        disabled={!audioFile}
                        className="w-full"
                      >
                        {isAudioPlaying ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Audio
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play Audio
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <audio
                    ref={audioRef}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                    onEnded={() => setIsAudioPlaying(false)}
                    style={{ display: 'none' }}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h3>Quick Integration Steps:</h3>
          <ol>
            <li><strong>Import components:</strong> Import the lip sync components into your chat interface</li>
            <li><strong>Choose audio source:</strong> Select microphone, TTS, or audio playback</li>
            <li><strong>Update AvatarController:</strong> Pass the lip sync props to enable mouth animation</li>
            <li><strong>Handle viseme updates:</strong> Optionally handle viseme data for additional features</li>
          </ol>

          <h3>Available Lip Sync Sources:</h3>
          <ul>
            <li><strong>Microphone:</strong> Real-time analysis of user speech</li>
            <li><strong>Text-to-Speech:</strong> Synchronized with TTS audio output</li>
            <li><strong>Audio Playback:</strong> Analysis of pre-recorded audio files</li>
          </ul>

          <h3>Supported Visemes:</h3>
          <p>The system supports standard visemes that map to Ready Player Me blendshapes: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, I, O, U</p>
        </CardContent>
      </Card>
    </div>
  );
}