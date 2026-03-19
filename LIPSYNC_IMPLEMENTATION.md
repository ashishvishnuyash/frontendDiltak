# Real-Time Lip Sync Implementation for Ready Player Me Avatars

This implementation provides real-time lip sync animation for Ready Player Me avatars using React Three Fiber, supporting multiple audio sources including microphone input, text-to-speech, and audio file playback.

## 🎯 Features

- **Real-time microphone lip sync** - Avatar mouth moves with your voice
- **Text-to-Speech integration** - Synchronized mouth animation with TTS
- **Audio file playback sync** - Lip sync with pre-recorded audio
- **Viseme-based animation** - Maps speech sounds to facial blendshapes
- **Smooth transitions** - Natural mouth movement with proper timing
- **Ready Player Me compatible** - Works with standard RPM avatar models

## 🚀 Quick Start

### 1. Basic Integration

```tsx
import { AvatarController } from "@/components/avatar";

function MyChat() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  return (
    <div className="h-96">
      <AvatarController
        emotion="IDLE"
        speaking={isSpeaking}
        lipSyncSource="text" // or 'microphone' or 'playback'
        speechText={currentMessage}
      />
    </div>
  );
}
```

### 2. Microphone Lip Sync

```tsx
import { AvatarController } from "@/components/avatar";

function MicrophoneLipSync() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <AvatarController
      emotion="IDLE"
      speaking={isRecording}
      lipSyncSource="microphone"
    />
  );
}
```

### 3. Text-to-Speech with Lip Sync

```tsx
import { AvatarController, useTTSLipSync } from "@/components/avatar";

function TTSLipSync() {
  const { speak, isPlaying } = useTTSLipSync();
  const [text, setText] = useState("Hello, how are you today?");

  const handleSpeak = () => {
    speak(text);
  };

  return (
    <div>
      <AvatarController
        emotion="IDLE"
        speaking={isPlaying}
        lipSyncSource="text"
        speechText={text}
      />
      <button onClick={handleSpeak}>Speak</button>
    </div>
  );
}
```

## 📋 Component API

### AvatarController Props

| Prop            | Type                                   | Default        | Description                          |
| --------------- | -------------------------------------- | -------------- | ------------------------------------ |
| `emotion`       | `string`                               | `'IDLE'`       | Avatar emotion/animation             |
| `speaking`      | `boolean`                              | `false`        | Whether avatar is currently speaking |
| `scale`         | `number`                               | `1.5`          | Avatar scale factor                  |
| `lipSyncSource` | `'microphone' \| 'playback' \| 'text'` | `'microphone'` | Audio source for lip sync            |
| `audioElement`  | `HTMLAudioElement`                     | `undefined`    | Audio element for playback mode      |
| `speechText`    | `string`                               | `undefined`    | Text for text-based lip sync         |

### useLipSync Hook

```tsx
const lipSyncState = useLipSync({
  avatarRef: React.RefObject<THREE.Group>,
  audioSource: 'microphone' | 'playback' | 'text',
  audioElement?: HTMLAudioElement,
  text?: string,
  speaking: boolean,
  onLipSyncUpdate?: (state: LipSyncState) => void
});
```

### useTTSLipSync Hook

```tsx
const { speak, stop, isPlaying, currentViseme } = useTTSLipSync();

// Usage
await speak("Hello world", {
  voice: selectedVoice,
  rate: 0.9,
  pitch: 1.0,
  volume: 1.0,
});
```

## 🎨 Supported Visemes

The system maps audio analysis to these visemes, which correspond to Ready Player Me blendshapes:

| Viseme | Sounds     | Description                 |
| ------ | ---------- | --------------------------- |
| `sil`  | Silence    | Mouth closed                |
| `PP`   | P, B, M    | Lips pressed together       |
| `FF`   | F, V       | Lower lip to upper teeth    |
| `TH`   | TH         | Tongue between teeth        |
| `DD`   | T, D, N, L | Tongue to roof of mouth     |
| `kk`   | K, G       | Back of tongue raised       |
| `CH`   | CH, J, SH  | Tongue raised, lips forward |
| `SS`   | S, Z       | Tongue near roof, air flow  |
| `nn`   | N          | Nasal sounds                |
| `RR`   | R          | Tongue curled               |
| `aa`   | A (cat)    | Open mouth, low tongue      |
| `E`    | E (bed)    | Mid-open mouth              |
| `I`    | I (bit)    | Slightly open, tongue high  |
| `O`    | O (hot)    | Rounded lips, open          |
| `U`    | U (book)   | Rounded lips, closed        |

## 🔧 Advanced Usage

### Custom Viseme Handling

```tsx
import { LipSyncAnalyzer, VisemeData } from "@/components/avatar";

function CustomLipSync() {
  const handleVisemeUpdate = (viseme: VisemeData) => {
    console.log(
      `Current viseme: ${viseme.viseme}, intensity: ${viseme.intensity}`
    );
    // Custom logic here
  };

  return (
    <AvatarController
      speaking={true}
      lipSyncSource="microphone"
      onLipSyncUpdate={(state) => {
        // Handle lip sync state changes
        console.log("Lip sync state:", state);
      }}
    />
  );
}
```

### Audio File Playback

```tsx
function AudioPlaybackLipSync() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div>
      <AvatarController
        speaking={isPlaying}
        lipSyncSource="playback"
        audioElement={audioRef.current || undefined}
      />
      <audio
        ref={audioRef}
        src="/path/to/audio.mp3"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      <button onClick={playAudio}>Play Audio</button>
    </div>
  );
}
```

## 🎛️ Configuration Options

### Audio Analysis Settings

```tsx
// In LipSyncAnalyzer.ts, you can adjust these parameters:

// FFT size for frequency analysis (higher = more detailed)
this.analyser.fftSize = 256; // 256, 512, 1024, 2048

// Smoothing for audio analysis (0-1, higher = smoother)
this.analyser.smoothingTimeConstant = 0.8;

// Transition speed for blendshape animations
transitionSpeed: 8.0; // Higher = faster transitions
```

### TTS Voice Selection

```tsx
import { TTSLipSync } from "@/components/avatar";

// Get available voices
const voices = TTSLipSync.getVoices();

// Get recommended voice for lip sync
const recommendedVoice = TTSLipSync.getRecommendedVoice();

// Use specific voice
const { speak } = useTTSLipSync();
speak("Hello world", {
  voice: recommendedVoice,
  rate: 0.9, // 0.1 to 10
  pitch: 1.0, // 0 to 2
  volume: 1.0, // 0 to 1
});
```

## 🐛 Troubleshooting

### Common Issues

1. **No lip sync animation**

   - Ensure your Ready Player Me model has the required blendshapes
   - Check that `speaking` prop is `true`
   - Verify audio permissions for microphone mode

2. **Choppy animation**

   - Reduce `transitionSpeed` in LipSyncController
   - Increase `smoothingTimeConstant` in audio analyzer
   - Check performance - lip sync is CPU intensive

3. **Microphone not working**

   - Ensure HTTPS (required for microphone access)
   - Check browser permissions
   - Test with different browsers

4. **TTS not synchronized**
   - Use recommended voices for better results
   - Adjust TTS rate (slower = better sync)
   - Some browsers have better TTS support than others

### Performance Optimization

```tsx
// Reduce analysis frequency for better performance
const analyzeRealTime = () => {
  // Add throttling
  setTimeout(() => {
    if (this.isAnalyzing) {
      this.analyzeRealTime(onVisemeUpdate);
    }
  }, 50); // 20 FPS instead of 60 FPS
};

// Reduce FFT size for faster analysis
this.analyser.fftSize = 128; // Smaller = faster but less accurate
```

## 🔗 Integration with Your Chat App

### Step 1: Update your existing AvatarController usage

```tsx
// Before
<AvatarController
  emotion="IDLE"
  speaking={isSpeaking}
/>

// After
<AvatarController
  emotion="IDLE"
  speaking={isSpeaking}
  lipSyncSource={isVoiceMode ? 'microphone' : 'text'}
  speechText={currentAIMessage}
/>
```

### Step 2: Handle TTS in your chat

```tsx
import { useTTSLipSync } from "@/components/avatar";

function ChatInterface() {
  const { speak, isPlaying } = useTTSLipSync();

  // When AI responds
  const handleAIResponse = (message: string) => {
    if (voiceModeEnabled) {
      speak(message);
    }
  };

  return (
    <AvatarController
      speaking={isPlaying}
      lipSyncSource="text"
      speechText={currentMessage}
    />
  );
}
```

### Step 3: Add microphone recording

```tsx
function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access denied");
    }
  };

  return <AvatarController speaking={isRecording} lipSyncSource="microphone" />;
}
```

## 📚 Demo Component

A complete demo is available in `components/avatar/LipSyncDemo.tsx` that shows all features:

```tsx
import { LipSyncDemo } from "@/components/avatar";

function DemoPage() {
  return <LipSyncDemo />;
}
```

## 🎯 Next Steps

1. **Test the basic integration** - Start with text-based lip sync
2. **Add microphone support** - Enable real-time voice lip sync
3. **Customize viseme mapping** - Adjust for your specific avatar model
4. **Optimize performance** - Tune settings for your use case
5. **Add error handling** - Handle edge cases and failures gracefully

## 📖 References

- [Ready Player Me Documentation](https://docs.readyplayer.me/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis)

## 🤝 Contributing

Feel free to submit issues and enhancement requests! The lip sync system is designed to be extensible and can be enhanced with:

- Better phoneme detection algorithms
- Support for more avatar formats
- Advanced audio analysis features
- Machine learning-based viseme prediction

---

**Happy coding! 🎉** Your avatar should now have realistic lip sync animation that responds to speech in real-time.
