/**
 * InteractiveAvatarDemo - Comprehensive demo showcasing all interactive 3D avatar features
 * Includes lip sync, animations, settings, and real-time interactions
 */

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Sparkles,
  Eye,
  Heart,
  Zap,
  MousePointer,
  Palette
} from 'lucide-react';
import AvatarController from './AvatarController';
import AvatarSettings, { useAvatarSettings, AvatarSettingsConfig } from './AvatarSettings';
import { useTTSLipSync } from './TTSLipSync';
import { VisemeData } from './LipSyncAnalyzer';

const DEMO_TEXTS = [
  "Hello! I'm your interactive AI assistant. How can I help you today?",
  "I can express different emotions and respond to your voice with realistic lip sync.",
  "Try adjusting my settings to see how I change. I can be more or less interactive!",
  "Watch my mouth move as I speak these words. The lip sync is synchronized in real-time.",
  "I can show happiness, anger, excitement, and many other emotions naturally."
];

const EMOTIONS = [
  { value: 'IDLE', label: 'Idle', description: 'Calm and neutral' },
  { value: 'HAPPY', label: 'Happy', description: 'Joyful and excited' },
  { value: 'ANGRY', label: 'Angry', description: 'Frustrated or upset' },
  { value: 'LAUGHING', label: 'Laughing', description: 'Amused and cheerful' },
  { value: 'VICTORY', label: 'Victory', description: 'Triumphant celebration' },
  { value: 'CLAPPING', label: 'Clapping', description: 'Applauding success' },
  { value: 'DANCING', label: 'Dancing', description: 'Rhythmic movement' },
  { value: 'SHAKE_FIST', label: 'Shake Fist', description: 'Determined gesture' },
  { value: 'SITTING_ANGRY', label: 'Sitting Angry', description: 'Seated frustration' }
];

export default function InteractiveAvatarDemo() {
  // Avatar state
  const [currentEmotion, setCurrentEmotion] = useState('IDLE');
  const [isRecording, setIsRecording] = useState(false);
  const [currentViseme, setCurrentViseme] = useState<VisemeData | null>(null);

  // Demo controls
  const [customText, setCustomText] = useState(DEMO_TEXTS[0]);
  const [selectedDemoText, setSelectedDemoText] = useState(0);
  const [demoMode, setDemoMode] = useState<'tts' | 'microphone' | 'interactive'>('tts');

  // Avatar settings
  const avatarSettings = useAvatarSettings();

  // TTS hook
  const { speak, stop, isPlaying: isTTSPlaying } = useTTSLipSync();

  // Performance monitoring
  const [fps, setFps] = useState(60);
  const fpsRef = useRef<number[]>([]);

  // Handle viseme updates
  const handleVisemeUpdate = useCallback((viseme: VisemeData) => {
    setCurrentViseme(viseme);
  }, []);

  // TTS controls
  const handleSpeak = useCallback(() => {
    if (isTTSPlaying) {
      stop();
    } else {
      speak(customText, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0
      });
    }
  }, [customText, isTTSPlaying, speak, stop]);

  // Microphone controls
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
      } catch (error) {
        console.error('Microphone access denied:', error);
        alert('Microphone access is required for this demo');
      }
    }
  }, [isRecording]);

  // Demo text selection
  const handleDemoTextSelect = (index: number) => {
    setSelectedDemoText(index);
    setCustomText(DEMO_TEXTS[index]);
  };

  // Quick emotion test
  const testEmotion = (emotion: string) => {
    setCurrentEmotion(emotion);
    const emotionTexts = {
      'HAPPY': "I'm feeling so happy and excited today!",
      'ANGRY': "This is quite frustrating, don't you think?",
      'LAUGHING': "Haha, that's absolutely hilarious!",
      'VICTORY': "Yes! We did it! What an achievement!",
      'CLAPPING': "Excellent work! That deserves applause!"
    };

    const text = emotionTexts[emotion as keyof typeof emotionTexts] || customText;
    speak(text);
  };

  // Performance monitoring
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      fpsRef.current.push(now);

      // Keep only last second of measurements
      fpsRef.current = fpsRef.current.filter(time => now - time < 1000);
      setFps(fpsRef.current.length);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  const isSpeaking = demoMode === 'tts' ? isTTSPlaying :
    demoMode === 'microphone' ? isRecording : false;

  const lipSyncSource = demoMode === 'microphone' ? 'microphone' : 'text';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Interactive 3D Avatar Demo</h1>
        <p className="text-gray-600">
          Experience realistic lip sync, emotions, and interactive features
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <Badge variant="outline">Real-time Lip Sync</Badge>
          <Badge variant="outline">Interactive Controls</Badge>
          <Badge variant="outline">Emotion System</Badge>
          <Badge variant="outline">Performance Optimized</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Display */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5" />
                  <span>3D Avatar</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${fps > 50 ? 'bg-green-500' : fps > 30 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span>{fps} FPS</span>
                  </div>
                  {currentViseme && (
                    <Badge variant="outline" className="text-xs">
                      {currentViseme.viseme} ({Math.round(currentViseme.intensity * 100)}%)
                    </Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg overflow-hidden relative" style={{ maxWidth: '100%', maxHeight: '24rem' }}>
                <AvatarController
                  emotion={currentEmotion}
                  speaking={isSpeaking}
                  message={customText}
                  interactive={avatarSettings.config.interactive}
                  showEnvironment={avatarSettings.config.showEnvironment}
                  enableFloating={avatarSettings.config.enableFloating}
                  quality={avatarSettings.config.quality}
                  scale={Math.max(0.8, Math.min(2.0, avatarSettings.config.scale))} // Constrain scale in demo
                />

                {/* Status Overlay */}
                {isSpeaking && (
                  <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2 z-10">
                    {demoMode === 'microphone' ? (
                      <>
                        <Mic className="h-4 w-4 text-red-400" />
                        <span>Listening</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-4 w-4 text-blue-400" />
                        <span>Speaking</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Emotion Tests */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Quick Emotion Tests</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {EMOTIONS.slice(1, 6).map((emotion) => (
                  <Button
                    key={emotion.value}
                    onClick={() => testEmotion(emotion.value)}
                    variant={currentEmotion === emotion.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    disabled={isTTSPlaying}
                  >
                    {emotion.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Controls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={demoMode} onValueChange={(value: any) => setDemoMode(value)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="tts" className="text-xs">TTS</TabsTrigger>
                  <TabsTrigger value="microphone" className="text-xs">Mic</TabsTrigger>
                  <TabsTrigger value="interactive" className="text-xs">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="tts" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Demo Texts</label>
                    <div className="grid grid-cols-1 gap-1">
                      {DEMO_TEXTS.map((text, index) => (
                        <Button
                          key={index}
                          onClick={() => handleDemoTextSelect(index)}
                          variant={selectedDemoText === index ? "secondary" : "ghost"}
                          size="sm"
                          className="text-xs text-left justify-start h-auto py-2 px-3"
                        >
                          {text.substring(0, 40)}...
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Custom Text</label>
                    <Textarea
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="Enter text to speak..."
                      className="text-sm"
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleSpeak}
                    disabled={!customText.trim()}
                    className="w-full"
                  >
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
                </TabsContent>

                <TabsContent value="microphone" className="space-y-4">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-gray-600">
                      Test real-time microphone lip sync
                    </p>

                    <Button
                      onClick={toggleRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="lg"
                      className="w-full"
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

                    {isRecording && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                        🎤 Speak now to see real-time lip sync
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="interactive" className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Emotion</label>
                      <Select value={currentEmotion} onValueChange={setCurrentEmotion}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EMOTIONS.map((emotion) => (
                            <SelectItem key={emotion.value} value={emotion.value}>
                              <div>
                                <div className="font-medium">{emotion.label}</div>
                                <div className="text-xs text-gray-500">{emotion.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={avatarSettings.toggleSettings}
                      variant="outline"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Advanced Settings
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Performance Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Frame Rate:</span>
                <Badge variant={fps > 50 ? "default" : fps > 30 ? "secondary" : "destructive"}>
                  {fps} FPS
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Quality:</span>
                <Badge variant="outline">{avatarSettings.config.quality.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Interactive:</span>
                <Badge variant={avatarSettings.config.interactive ? "default" : "secondary"}>
                  {avatarSettings.config.interactive ? "ON" : "OFF"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Floating:</span>
                <Badge variant={avatarSettings.config.enableFloating ? "default" : "secondary"}>
                  {avatarSettings.config.enableFloating ? "ON" : "OFF"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Settings */}
      <AvatarSettings
        config={avatarSettings.config}
        onConfigChange={avatarSettings.updateConfig}
        isOpen={avatarSettings.isOpen}
        onToggle={avatarSettings.toggleSettings}
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>How to Use</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🗣️ Text-to-Speech</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Select demo texts or write custom text</li>
                <li>• Click "Start Speaking" to hear TTS</li>
                <li>• Watch synchronized lip movements</li>
                <li>• Try different emotions while speaking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎤 Microphone</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Click "Start Recording" to begin</li>
                <li>• Speak into your microphone</li>
                <li>• See real-time lip sync animation</li>
                <li>• Works with any language</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Interactive</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Drag to rotate the avatar</li>
                <li>• Adjust quality for performance</li>
                <li>• Enable/disable floating animation</li>
                <li>• Customize avatar behavior</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}