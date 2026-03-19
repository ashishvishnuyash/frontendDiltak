import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return new OpenAI({ apiKey });
}

interface RecommendationRequest {
  employee_id: string;
  company_id: string;
  current_mood: number;
  current_stress: number;
  current_energy: number;
  time_available: number;
}

interface AIRecommendation {
  id: string;
  recommendation_type: 'meditation' | 'journaling' | 'breathing' | 'exercise' | 'sleep' | 'nutrition' | 'social' | 'work_life_balance';
  title: string;
  description: string;
  instructions: string[];
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  mood_targets: string[];
  wellness_metrics_affected: string[];
  ai_generated: boolean;
  personalized_for_user: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  created_at?: any; // Firestore timestamp
  messages?: Array<{
    content: string;
    role?: string;
    timestamp?: any;
  }>;
  user_id?: string;
  company_id?: string;
}

// Get user's recent chat history for context
async function getUserChatHistory(userId: string, companyId: string, days: number = 7): Promise<ChatSession[]> {
  try {
    const chatRef = collection(db, 'chat_sessions');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
    
    // Query without date filter to avoid composite index requirement
    // We'll filter by date in JavaScript instead
    const q = query(
      chatRef,
      where('user_id', '==', userId),
      where('company_id', '==', companyId),
      orderBy('created_at', 'desc'),
      limit(50) // Get more documents to filter by date
    );
    
    const querySnapshot = await getDocs(q);
    const sessions: ChatSession[] = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatSession))
      .filter(session => {
        // Filter by date in JavaScript
        const sessionDate = session.created_at 
          ? (session.created_at instanceof Date 
              ? session.created_at 
              : new Date(session.created_at))
          : null;
        return sessionDate && sessionDate >= sevenDaysAgo;
      })
      .slice(0, 20); // Limit to 20 most recent after filtering
    
    return sessions;
  } catch (error: any) {
    // If the query still fails (e.g., missing index for user_id + company_id + orderBy),
    // try a simpler query without orderBy
    if (error?.code === 'failed-precondition') {
      try {
        const chatRef = collection(db, 'chat_sessions');
        const q = query(
          chatRef,
          where('user_id', '==', userId),
          where('company_id', '==', companyId),
          limit(50)
        );
        
        const querySnapshot = await getDocs(q);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - days);
        
        const sessions: ChatSession[] = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ChatSession))
          .filter(session => {
            const sessionDate = session.created_at 
              ? (session.created_at instanceof Date 
                  ? session.created_at 
                  : new Date(session.created_at))
              : null;
            return sessionDate && sessionDate >= sevenDaysAgo;
          })
          .sort((a, b) => {
            const dateA = a.created_at instanceof Date ? a.created_at : new Date(a.created_at || 0);
            const dateB = b.created_at instanceof Date ? b.created_at : new Date(b.created_at || 0);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 20);
        
        return sessions;
      } catch (fallbackError) {
        console.error('Error fetching chat history (fallback):', fallbackError);
        return [];
      }
    }
    console.error('Error fetching chat history:', error);
    return [];
  }
}

// Generate AI recommendations based on user context
async function generateAIRecommendations(
  userId: string,
  companyId: string,
  currentMood: number,
  currentStress: number,
  currentEnergy: number,
  timeAvailable: number
): Promise<AIRecommendation[]> {
  try {
    // Get user's recent chat history
    const chatHistory = await getUserChatHistory(userId, companyId, 7);
    
    // Format chat history for AI context
    const chatContext = chatHistory.length > 0 
      ? chatHistory.map(session => {
          const sessionDate = session.created_at?.toDate?.()?.toLocaleDateString() || 'Unknown';
          const messages = session.messages?.map((msg: any) => msg.content).join(' ') || 'No messages';
          return `Session ${sessionDate}: ${messages}`;
        }).join('\n')
      : 'No recent chat history available.';

    const openai = getOpenAIClient();
    
    const prompt = `You are an AI wellness coach analyzing an employee's recent chat conversations and current state to generate personalized wellness recommendations.

EMPLOYEE CONTEXT:
- Current Mood: ${currentMood}/10 (1=very low, 10=excellent)
- Current Stress: ${currentStress}/10 (1=very low, 10=very high)
- Current Energy: ${currentEnergy}/10 (1=very low, 10=very high)
- Time Available: ${timeAvailable} minutes

RECENT CHAT HISTORY (Last 7 days):
${chatContext}

Based on this information, generate 6 personalized wellness recommendations. Each recommendation should be:
1. Relevant to their current state and chat patterns
2. Actionable within their available time
3. Appropriate for their stress/mood/energy levels
4. Evidence-based wellness practices

Return ONLY a valid JSON array with this exact structure:
[
  {
    "id": "unique_id_1",
    "recommendation_type": "meditation|journaling|breathing|exercise|sleep|nutrition|social|work_life_balance",
    "title": "Specific, engaging title",
    "description": "Brief description of what this activity involves",
    "instructions": ["Step 1", "Step 2", "Step 3", "Step 4"],
    "duration_minutes": ${timeAvailable},
    "difficulty_level": "beginner|intermediate|advanced",
    "mood_targets": ["stress_relief", "energy_boost", "focus", "calm", "motivation"],
    "wellness_metrics_affected": ["stress_anxiety", "emotional_tone", "motivation_engagement", "work_life_balance"],
    "ai_generated": true,
    "personalized_for_user": true,
    "created_at": "${new Date().toISOString()}"
  }
]

Guidelines:
- Prioritize activities that address their current stress/mood/energy levels
- If chat history shows work stress, include work-life balance activities
- If low energy, include energizing activities
- If high stress, include calming/meditation activities
- Make instructions specific and actionable
- Ensure duration matches their available time
- Include variety in recommendation types`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional wellness coach AI that generates personalized, actionable wellness recommendations based on user context and chat history.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const recommendations = JSON.parse(response);
    
    // Validate the response structure
    if (!Array.isArray(recommendations)) {
      throw new Error('Invalid response format from AI');
    }

    return recommendations;
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    
    // Fallback recommendations if AI fails
    return generateFallbackRecommendations(currentMood, currentStress, currentEnergy, timeAvailable);
  }
}

// Fallback recommendations if AI generation fails
function generateFallbackRecommendations(
  currentMood: number,
  currentStress: number,
  currentEnergy: number,
  timeAvailable: number
): AIRecommendation[] {
  const now = new Date().toISOString();
  
  const recommendations: AIRecommendation[] = [];
  
  // Stress-focused recommendations
  if (currentStress >= 7) {
    recommendations.push({
      id: `stress_relief_${Date.now()}`,
      recommendation_type: 'breathing',
      title: '4-7-8 Breathing Exercise',
      description: 'A simple breathing technique to quickly reduce stress and anxiety.',
      instructions: [
        'Sit comfortably with your back straight',
        'Place the tip of your tongue against the ridge behind your upper teeth',
        'Exhale completely through your mouth',
        'Close your mouth and inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat this cycle 4 times'
      ],
      duration_minutes: Math.min(timeAvailable, 5),
      difficulty_level: 'beginner',
      mood_targets: ['stress_relief', 'calm'],
      wellness_metrics_affected: ['stress_anxiety', 'emotional_regulation'],
      ai_generated: true,
      personalized_for_user: true,
      created_at: now
    });
  }
  
  // Energy-focused recommendations
  if (currentEnergy <= 4) {
    recommendations.push({
      id: `energy_boost_${Date.now()}`,
      recommendation_type: 'exercise',
      title: 'Quick Energy Boost Movement',
      description: 'Gentle movements to increase energy and alertness.',
      instructions: [
        'Stand up and stretch your arms overhead',
        'Do 10 gentle arm circles forward and backward',
        'March in place for 30 seconds',
        'Do 5-10 gentle squats',
        'Stretch your neck and shoulders',
        'Take 3 deep breaths'
      ],
      duration_minutes: Math.min(timeAvailable, 3),
      difficulty_level: 'beginner',
      mood_targets: ['energy_boost', 'motivation'],
      wellness_metrics_affected: ['motivation_engagement', 'cognitive_functioning'],
      ai_generated: true,
      personalized_for_user: true,
      created_at: now
    });
  }
  
  // Mood-focused recommendations
  if (currentMood <= 4) {
    recommendations.push({
      id: `mood_lift_${Date.now()}`,
      recommendation_type: 'journaling',
      title: 'Gratitude Journaling',
      description: 'Write down positive thoughts to improve your mood and perspective.',
      instructions: [
        'Find a quiet space to write',
        'List 3 things you\'re grateful for today',
        'Write about one positive interaction you had',
        'Note one thing you accomplished today',
        'End with a positive affirmation about yourself'
      ],
      duration_minutes: Math.min(timeAvailable, 10),
      difficulty_level: 'beginner',
      mood_targets: ['motivation', 'calm'],
      wellness_metrics_affected: ['emotional_tone', 'self_esteem'],
      ai_generated: true,
      personalized_for_user: true,
      created_at: now
    });
  }
  
  // Work-life balance recommendation
  recommendations.push({
    id: `work_life_balance_${Date.now()}`,
    recommendation_type: 'work_life_balance',
    title: 'Mindful Break',
    description: 'Take a mindful break to reset and refocus.',
    instructions: [
      'Step away from your workspace',
      'Take 3 deep breaths',
      'Notice your surroundings - what do you see, hear, feel?',
      'Set an intention for the rest of your day',
      'Return to work with renewed focus'
    ],
    duration_minutes: Math.min(timeAvailable, 5),
    difficulty_level: 'beginner',
    mood_targets: ['focus', 'calm'],
    wellness_metrics_affected: ['work_life_balance_metric', 'cognitive_functioning'],
    ai_generated: true,
    personalized_for_user: true,
    created_at: now
  });
  
  // Meditation recommendation
  recommendations.push({
    id: `meditation_${Date.now()}`,
    recommendation_type: 'meditation',
    title: 'Mindfulness Meditation',
    description: 'A brief mindfulness practice to center yourself.',
    instructions: [
      'Sit comfortably with your eyes closed',
      'Focus on your breath - don\'t try to change it',
      'When your mind wanders, gently return to your breath',
      'Notice any sounds around you without judgment',
      'Slowly open your eyes and return to the present moment'
    ],
    duration_minutes: Math.min(timeAvailable, 8),
    difficulty_level: 'beginner',
    mood_targets: ['calm', 'focus'],
    wellness_metrics_affected: ['emotional_regulation', 'stress_anxiety'],
    ai_generated: true,
    personalized_for_user: true,
    created_at: now
  });
  
  // Social connection recommendation
  recommendations.push({
    id: `social_connection_${Date.now()}`,
    recommendation_type: 'social',
    title: 'Reach Out to Someone',
    description: 'Connect with a colleague or friend to boost your mood.',
    instructions: [
      'Think of someone you haven\'t connected with recently',
      'Send them a brief, positive message',
      'Ask how they\'re doing',
      'Share something positive about your day',
      'Express appreciation for their friendship'
    ],
    duration_minutes: Math.min(timeAvailable, 5),
    difficulty_level: 'beginner',
    mood_targets: ['motivation', 'calm'],
    wellness_metrics_affected: ['social_connectedness', 'emotional_tone'],
    ai_generated: true,
    personalized_for_user: true,
    created_at: now
  });
  
  return recommendations.slice(0, 6); // Return up to 6 recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    
    const { employee_id, company_id, current_mood, current_stress, current_energy, time_available } = body;
    
    // Validate required fields
    if (!employee_id || !company_id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    // Validate mood/stress/energy values
    if (current_mood < 1 || current_mood > 10 || 
        current_stress < 1 || current_stress > 10 || 
        current_energy < 1 || current_energy > 10) {
      return NextResponse.json(
        { success: false, error: 'Mood, stress, and energy values must be between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Generate AI recommendations
    const recommendations = await generateAIRecommendations(
      employee_id,
      company_id,
      current_mood,
      current_stress,
      current_energy,
      time_available
    );
    
    // Store recommendations in database for tracking
    try {
      const recommendationsRef = collection(db, 'ai_recommendations');
      await addDoc(recommendationsRef, {
        employee_id,
        company_id,
        recommendations,
        context: {
          current_mood,
          current_stress,
          current_energy,
          time_available
        },
        created_at: serverTimestamp(),
        generated_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Error storing recommendations:', dbError);
      // Continue even if database storage fails
    }
    
    return NextResponse.json({
      success: true,
      recommendations,
      generated_at: new Date().toISOString(),
      context: {
        current_mood,
        current_stress,
        current_energy,
        time_available
      }
    });
    
  } catch (error) {
    console.error('Error in recommendations API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
