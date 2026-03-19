# 🔑 Environment Setup Guide

## Required Environment Variables

To run this application, you need to set up environment variables for API access.

### 1. Create Environment File

Copy the example file and add your actual API keys:

```bash
cp .env.example .env.local
```

### 2. Required Variables

Add these variables to your `.env.local` file:

```env
# OpenAI API Key (required for transcription and AI features)
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret (required for authentication)
JWT_SECRET=your_jwt_secret_here

# App URL (required for proper routing)
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Optional Variables

```env
# Gemini API Key (alternative AI provider)
GEMINI_API_KEY=your_gemini_api_key

# Perplexity API Key (for deep search)
PERPLEXITY_API_KEY=your_perplexity_api_key

# ElevenLabs API Key (for voice call feature with male teen voice)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# ElevenLabs Voice ID (optional - defaults to male teen voice "pNInz6obpgDQGcFmaJgB")
ELEVENLABS_VOICE_ID=your_custom_voice_id_here
```

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### Other Keys
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Perplexity**: [Perplexity Settings](https://www.perplexity.ai/settings/api)
- **ElevenLabs**: [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)
  1. Sign up or log in to ElevenLabs
  2. Navigate to Settings > API Keys
  3. Create a new API key
  4. Copy the key to your `.env.local` file
  5. The default voice is set to a male teen voice (Adam - "pNInz6obpgDQGcFmaJgB")
  6. You can customize the voice by setting `ELEVENLABS_VOICE_ID` with a different voice ID from your ElevenLabs account

## Security Notes

- ✅ `.env.local` is automatically ignored by Git
- ✅ Never commit API keys to version control
- ✅ Use different keys for development and production
- ✅ Rotate keys regularly for security

## Features Enabled

With proper environment setup, these features will work:
- 🎤 Voice transcription (OpenAI Whisper)
- 🤖 AI chat responses
- 🎭 3D Avatar with lip sync
- 🔐 User authentication
- 🗣️ Voice calls with ElevenLabs (male teen voice) - requires ELEVENLABS_API_KEY

## Troubleshooting

If you see "OPENAI_API_KEY environment variable is required":
1. Check that `.env.local` exists
2. Verify the API key is correctly set
3. Restart the development server
4. Ensure no extra spaces or quotes around the key