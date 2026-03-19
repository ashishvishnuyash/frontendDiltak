import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import OpenAI from 'openai';

// Initialize OpenAI client for emotion processing
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  return new OpenAI({ apiKey });
}

/**
 * Adds emotion markers to text using ChatGPT
 * Returns text with emotion markers like [excited], [calm], [empathetic], etc.
 */
async function addEmotionToText(text: string): Promise<string> {
  try {
    const openai = getOpenAIClient();
    
    const prompt = `Analyze the following text and add appropriate emotion markers in the format [emotion] before the text or relevant parts. 

Available emotions: excited, happy, calm, empathetic, concerned, supportive, enthusiastic, gentle, warm, professional, friendly, encouraging, reassuring, understanding, compassionate, cheerful, serious, thoughtful, optimistic, neutral

Format: [emotion] text here

If the text is neutral or doesn't need strong emotion, you can omit the marker or use [neutral].

Text to process:
"${text}"

Return ONLY the text with emotion markers added. Do not add any explanation or additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Faster model for low latency
      messages: [
        { 
          role: 'system', 
          content: 'You are an expert at adding appropriate emotion markers to text for voice synthesis. Add emotion markers like [excited], [calm], [empathetic] etc. before text segments that need emotional expression. Keep the original text intact, only add emotion markers where appropriate.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5, // Lower temperature for faster, more consistent responses
      max_tokens: Math.min(text.length + 100, 500), // Reduced tokens for faster processing
    });

    const emotionEnhancedText = completion.choices[0]?.message?.content?.trim() || text;
    
    // If ChatGPT didn't add markers or returned something unexpected, return original text
    if (!emotionEnhancedText.includes('[') || emotionEnhancedText.length < text.length * 0.5) {
      console.log('Emotion processing returned unexpected result, using original text');
      return text;
    }
    
    return emotionEnhancedText;
  } catch (error) {
    console.error('Error adding emotion to text:', error);
    // Return original text if emotion processing fails
    return text;
  }
}

/**
 * Removes emotion markers from text and returns clean text with detected emotions
 * Returns: { cleanText: string, emotions: string[] }
 */
function removeEmotionMarkers(text: string): { cleanText: string; emotions: string[] } {
  const emotionPattern = /\[(excited|happy|calm|empathetic|concerned|supportive|enthusiastic|gentle|warm|professional|friendly|encouraging|reassuring|understanding|compassionate|cheerful|serious|thoughtful|optimistic|neutral)\]/gi;
  
  const emotions: string[] = [];
  
  // Extract emotions and remove markers from text
  const cleanText = text.replace(emotionPattern, (match, emotion) => {
    emotions.push(emotion.toLowerCase());
    return ''; // Remove the marker
  })
  // Clean up multiple spaces that might result from removing markers
  .replace(/\s+/g, ' ')
  // Remove leading/trailing spaces
  .trim();
  
  return { cleanText, emotions };
}

/**
 * Gets voice settings based on detected emotions
 * Adjusts stability, style, and similarityBoost to convey emotion
 */
function getVoiceSettingsForEmotion(emotions: string[]): {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
} {
  // Default settings
  let stability = 0.5;
  let similarityBoost = 0.75;
  let style = 0.0;
  const useSpeakerBoost = true;

  // If no emotions detected, use defaults
  if (emotions.length === 0) {
    return { stability, similarityBoost, style, useSpeakerBoost };
  }

  // Get the most prominent emotion (first one or most common)
  const primaryEmotion = emotions[0] || 'neutral';

  // Adjust settings based on emotion
  switch (primaryEmotion) {
    case 'excited':
    case 'enthusiastic':
    case 'cheerful':
    case 'happy':
      stability = 0.4; // Lower stability for more variation
      style = 0.3; // Higher style for more expressiveness
      similarityBoost = 0.7;
      break;
    
    case 'calm':
    case 'gentle':
    case 'reassuring':
    case 'understanding':
      stability = 0.7; // Higher stability for consistent, calm voice
      style = 0.1; // Lower style for subtle expression
      similarityBoost = 0.8;
      break;
    
    case 'empathetic':
    case 'compassionate':
    case 'warm':
    case 'supportive':
      stability = 0.6;
      style = 0.2;
      similarityBoost = 0.75;
      break;
    
    case 'concerned':
    case 'serious':
    case 'thoughtful':
      stability = 0.65;
      style = 0.15;
      similarityBoost = 0.8;
      break;
    
    case 'professional':
    case 'friendly':
    case 'encouraging':
    case 'optimistic':
      stability = 0.55;
      style = 0.2;
      similarityBoost = 0.75;
      break;
    
    case 'neutral':
    default:
      // Use defaults
      break;
  }

  return { stability, similarityBoost, style, useSpeakerBoost };
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice, addEmotion = true } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    // ElevenLabs Turbo v2.5 supports up to 40,000 characters, Flash v2.5 also supports 40,000
    if (text.length > 40000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum length is 40,000 characters.' },
        { status: 400 }
      );
    }

    // Check if ElevenLabs API key is available
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured. Please add ELEVENLABS_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Default to a male teen voice - using a voice ID that sounds like a male teenager
    // Free tier voices available: Adam, Antoni, Arnold, Bella, Domi, Elli, Josh, Rachel, Sam, etc.
    // For a male teen voice on free tier, we'll use "pNInz6obpgDQGcFmaJgB" (Adam) - a young male voice
    // Alternative free tier male voices: "ErXwobaYiN019PkySvjV" (Antoni), "TxGEqnHWrfWFTfGW9XjX" (Josh)
    // Note: Premium voices like Ethan and Brayden require Creator tier or above
    const voiceId = voice || process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam - Free tier young male voice

    // Add emotion markers to text using ChatGPT (if enabled and OpenAI API key is available)
    let textWithEmotion = text;
    let detectedEmotions: string[] = [];
    
    if (addEmotion && process.env.OPENAI_API_KEY) {
      try {
        // Skip if text already has emotion markers or is too long
        const hasExistingEmotion = /\[(excited|happy|calm|empathetic|concerned|supportive|enthusiastic|gentle|warm|professional|friendly|encouraging|reassuring|understanding|compassionate|cheerful|serious|thoughtful|optimistic|neutral)\]/i.test(text);
        
        // Only process emotion for shorter texts to maintain low latency
        // Skip for very short texts (< 20 chars) or very long texts (> 500 chars)
        if (!hasExistingEmotion && text.length >= 20 && text.length <= 500) {
          textWithEmotion = await addEmotionToText(text);
          console.log('Emotion-enhanced text:', textWithEmotion.substring(0, 150) + '...');
        } else if (hasExistingEmotion) {
          console.log('Text already contains emotion markers, skipping processing');
        } else {
          console.log('Skipping emotion processing for optimal latency');
        }
      } catch (error) {
        console.warn('Failed to add emotion markers, using original text:', error);
        // Continue with original text if emotion processing fails
      }
    }

    // Remove emotion markers from text before sending to ElevenLabs
    // The markers are only used to adjust voice settings, not spoken
    const { cleanText, emotions } = removeEmotionMarkers(textWithEmotion);
    detectedEmotions = emotions;
    
    console.log('Detected emotions:', detectedEmotions);
    console.log('Clean text (without markers):', cleanText.substring(0, 150) + '...');

    // Get voice settings based on detected emotions
    const voiceSettings = getVoiceSettingsForEmotion(detectedEmotions);
    console.log('Voice settings for emotion:', voiceSettings);

    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: apiKey,
    });

    // Generate speech using the SDK with clean text (no emotion markers)
    // Voice settings are adjusted based on detected emotions
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: cleanText, // Use clean text without emotion markers
      modelId: 'eleven_flash_v2_5', // Eleven Flash v2.5 - Ultra-low latency (~75ms), 40k char limit, 50% lower price
      voiceSettings: voiceSettings // Use emotion-adjusted voice settings
    });

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    const reader = audioStream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    // Combine all chunks into a single Uint8Array
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const audioData = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioData.set(chunk, offset);
      offset += chunk.length;
    }

    // Return the audio data with appropriate headers
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioData.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error: any) {
    console.error('Text-to-speech error:', error);
    
    // Handle ElevenLabs SDK errors
    let errorMessage = 'Failed to generate speech';
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.detail?.message) {
      errorMessage = error.detail.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.status || 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}