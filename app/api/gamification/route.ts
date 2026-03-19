import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface GamificationRequest {
  action: 'check_in' | 'get_user_stats' | 'get_available_challenges' | 'join_challenge' | 'conversation_complete';
  employee_id: string;
  company_id: string;
  data?: any;
}

interface UserGamificationStats {
  id: string;
  employee_id: string;
  company_id: string;
  current_streak: number;
  longest_streak: number;
  total_points: number;
  level: number;
  badges: string[];
  challenges_completed: number;
  last_check_in: Timestamp | null;
  weekly_goal: number;
  monthly_goal: number;
  created_at: any;
  updated_at: any;
}

// Initialize or get user gamification stats
async function getOrCreateUserStats(employeeId: string, companyId: string): Promise<UserGamificationStats> {
  const statsRef = collection(db, 'user_gamification');
  const q = query(statsRef, where('employee_id', '==', employeeId), where('company_id', '==', companyId));
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserGamificationStats;
  }
  
  // Create new user stats
  const newStats = {
    employee_id: employeeId,
    company_id: companyId,
    current_streak: 0,
    longest_streak: 0,
    total_points: 0,
    level: 1,
    badges: [],
    challenges_completed: 0,
    last_check_in: null,
    weekly_goal: 5,
    monthly_goal: 20,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp()
  };
  
  const docRef = await addDoc(statsRef, newStats);
  return { id: docRef.id, ...newStats } as UserGamificationStats;
}

// Check badge eligibility
function checkBadgeEligibility(userStats: any): string[] {
  const newBadges: string[] = [];
  
  // First check-in badge
  if (!userStats.badges.includes('first_check_in') && userStats.total_points > 0) {
    newBadges.push('first_check_in');
  }
  
  // Week warrior (7-day streak)
  if (userStats.current_streak >= 7 && !userStats.badges.includes('week_warrior')) {
    newBadges.push('week_warrior');
  }
  
  // Month master (30-day streak)
  if (userStats.current_streak >= 30 && !userStats.badges.includes('month_master')) {
    newBadges.push('month_master');
  }
  
  // Century streak (100-day streak)
  if (userStats.current_streak >= 100 && !userStats.badges.includes('century_streak')) {
    newBadges.push('century_streak');
  }
  
  // Point collector (1000 points)
  if (userStats.total_points >= 1000 && !userStats.badges.includes('point_collector')) {
    newBadges.push('point_collector');
  }
  
  // Point master (5000 points)
  if (userStats.total_points >= 5000 && !userStats.badges.includes('point_master')) {
    newBadges.push('point_master');
  }
  
  // Level five
  if (userStats.level >= 5 && !userStats.badges.includes('level_five')) {
    newBadges.push('level_five');
  }
  
  // Level ten
  if (userStats.level >= 10 && !userStats.badges.includes('level_ten')) {
    newBadges.push('level_ten');
  }
  
  return newBadges;
}

// Calculate points based on activity
function calculatePoints(activityType: string, data?: any): number {
  switch (activityType) {
    case 'check_in':
      return 10;
    case 'conversation_complete':
      return 15;
    case 'challenge_complete':
      return 50;
    default:
      return 5;
  }
}

// Calculate level based on total points
function calculateLevel(totalPoints: number): number {
  // Level 1: 0-100 points
  // Level 2: 101-300 points
  // Level 3: 301-600 points
  // Level 4: 601-1000 points
  // Level 5: 1001-1500 points
  // Continue with incremental increases
  if (totalPoints < 100) return 1;
  if (totalPoints < 300) return 2;
  if (totalPoints < 600) return 3;
  if (totalPoints < 1000) return 4;
  if (totalPoints < 1500) return 5;
  if (totalPoints < 2100) return 6;
  if (totalPoints < 2800) return 7;
  if (totalPoints < 3600) return 8;
  if (totalPoints < 4500) return 9;
  if (totalPoints < 5500) return 10;
  
  // Beyond level 10, increase by 1500 points per level
  return 10 + Math.floor((totalPoints - 5500) / 1500);
}

// Handle check-in action
async function handleCheckIn(employeeId: string, companyId: string) {
  try {
    const userStats = await getOrCreateUserStats(employeeId, companyId);
    
    const now = new Date();
    const lastCheckIn = userStats.last_check_in?.toDate() ?? null;
    
    let newStreak = (userStats as any).current_streak || 0;
    let pointsToAdd = 10;
    
    // Check if it's been more than 24 hours since last check-in
    if (lastCheckIn) {
      const hoursSinceCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCheckIn > 48) {
        // Streak broken
        newStreak = 1;
      } else if (hoursSinceCheckIn <= 24) {
        // Already checked in today
        return {
          success: false,
          message: 'You have already checked in today. Come back tomorrow!'
        };
      } else {
        // Continuing streak
        newStreak = (userStats as any).current_streak + 1;
      }
    } else {
      // First check-in
      newStreak = 1;
      pointsToAdd = 20; // Bonus points for first check-in
    }
    
    // Update longest streak if needed
    const longestStreak = Math.max(newStreak, (userStats as any).longest_streak || 0);
    
    // Calculate new level
    const newPoints = (userStats as any).total_points + pointsToAdd;
    const newLevel = calculateLevel(newPoints);
    
    // Update user stats
    const statsRef = doc(db, 'user_gamification', userStats.id);
    await updateDoc(statsRef, {
      current_streak: newStreak,
      longest_streak: longestStreak,
      total_points: newPoints,
      level: newLevel,
      last_check_in: Timestamp.now(),
      updated_at: Timestamp.now()
    });
    
    const updatedStats = {
      ...userStats,
      current_streak: newStreak,
      longest_streak: longestStreak,
      total_points: newPoints,
      level: newLevel,
      last_check_in: Timestamp.now()
    } as any;
    
    // Check for new badges
    const newBadges = checkBadgeEligibility(updatedStats);
    
    if (newBadges.length > 0) {
      await updateDoc(statsRef, {
        badges: [...(userStats as any).badges, ...newBadges]
      });
      updatedStats.badges = [...(userStats as any).badges, ...newBadges];
    }
    
    return {
      success: true,
      user_stats: updatedStats,
      new_badges: newBadges,
      points_earned: pointsToAdd,
      message: `Check-in recorded! You earned ${pointsToAdd} points!`
    };
  } catch (error) {
    console.error('Error handling check-in:', error);
    return {
      success: false,
      message: 'Failed to record check-in'
    };
  }
}

// Handle conversation complete
async function handleConversationComplete(employeeId: string, companyId: string, data: any) {
  try {
    const userStats = await getOrCreateUserStats(employeeId, companyId);
    
    const pointsToAdd = calculatePoints('conversation_complete', data);
    const newPoints = (userStats as any).total_points + pointsToAdd;
    const newLevel = calculateLevel(newPoints);
    
    const statsRef = doc(db, 'user_gamification', userStats.id);
    await updateDoc(statsRef, {
      total_points: newPoints,
      level: newLevel,
      updated_at: Timestamp.now()
    });
    
    const updatedStats = {
      ...userStats,
      total_points: newPoints,
      level: newLevel
    } as any;
    
    // Check for new badges
    const newBadges = checkBadgeEligibility(updatedStats);
    
    if (newBadges.length > 0) {
      await updateDoc(statsRef, {
        badges: [...(userStats as any).badges, ...newBadges]
      });
      updatedStats.badges = [...(userStats as any).badges, ...newBadges];
    }
    
    return {
      success: true,
      user_stats: updatedStats,
      new_badges: newBadges,
      points_earned: pointsToAdd,
      message: `Conversation complete! You earned ${pointsToAdd} points!`
    };
  } catch (error) {
    console.error('Error handling conversation complete:', error);
    return {
      success: false,
      message: 'Failed to update stats'
    };
  }
}

// Get available challenges
async function getAvailableChallenges(companyId: string) {
  try {
    const challengesRef = collection(db, 'wellness_challenges');
    const q = query(
      challengesRef,
      where('company_id', '==', companyId),
      where('is_active', '==', true),
      orderBy('start_date', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const challenges = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return {
      success: true,
      challenges
    };
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return {
      success: false,
      challenges: []
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: GamificationRequest = await request.json();
    const { action, employee_id, company_id, data } = body;
    
    if (!employee_id || !company_id) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'check_in':
        const checkInResult = await handleCheckIn(employee_id, company_id);
        return NextResponse.json(checkInResult);
      
      case 'get_user_stats':
        const userStats = await getOrCreateUserStats(employee_id, company_id);
        return NextResponse.json({
          success: true,
          user_stats: userStats
        });
      
      case 'get_available_challenges':
        const challengesResult = await getAvailableChallenges(company_id);
        return NextResponse.json(challengesResult);
      
      case 'join_challenge':
        // TODO: Implement join challenge logic
        return NextResponse.json({
          success: true,
          message: 'Challenge joined successfully'
        });
      
      case 'conversation_complete':
        const convResult = await handleConversationComplete(employee_id, company_id, data);
        return NextResponse.json(convResult);
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in gamification API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
