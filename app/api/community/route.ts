import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, addDoc, updateDoc, doc, increment, serverTimestamp, Timestamp } from 'firebase/firestore';

interface CommunityRequest {
  action: 'get_posts' | 'create_post' | 'get_replies' | 'create_reply' | 'like_post' | 'get_anonymous_profile';
  employee_id?: string;
  company_id: string;
  data?: any;
}

interface CommunityPost {
  id: string;
  company_id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'general' | 'stress_relief' | 'work_life_balance' | 'mental_health' | 'success_stories' | 'seeking_support';
  tags: string[];
  is_anonymous: boolean;
  likes: number;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: any;
  updated_at: any;
}

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  likes: number;
  is_approved: boolean;
  created_at: any;
  updated_at: any;
}

// Generate or get anonymous profile
async function getOrCreateAnonymousProfile(employeeId: string, companyId: string) {
  const profilesRef = collection(db, 'anonymous_profiles');
  const q = query(
    profilesRef,
    where('employee_id', '==', employeeId),
    where('company_id', '==', companyId)
  );
  const querySnapshot = await getDocs(q);
  
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }
  
  // Generate anonymous ID (8 characters)
  const anonymousId = Math.random().toString(36).substring(2, 10).toUpperCase();
  
  // Generate color for avatar (from predefined list)
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA15E', '#BC6C25', '#FFB5A7'];
  const avatarColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Generate display name
  const displayName = `User ${anonymousId}`;
  
  const newProfile = {
    employee_id: employeeId,
    company_id: companyId,
    anonymous_id: anonymousId,
    display_name: displayName,
    avatar_color: avatarColor,
    created_at: serverTimestamp(),
    last_active: serverTimestamp()
  };
  
  const docRef = await addDoc(profilesRef, newProfile);
  return { id: docRef.id, ...newProfile };
}

// Fetch posts
async function fetchPosts(companyId: string, category?: string, limitCount: number = 20) {
  try {
    const postsRef = collection(db, 'community_posts');
    
    // Get all posts for the company without ordering to avoid composite index requirement
    const q = query(
      postsRef,
      where('company_id', '==', companyId),
      where('is_approved', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    let posts: CommunityPost[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at || new Date().toISOString()
    })) as CommunityPost[];
    
    // Filter by category if needed
    if (category && category !== 'all') {
      posts = posts.filter(post => (post as any).category === category);
    }
    
    // Sort by pinned status first, then by created_at
    posts.sort((a: any, b: any) => {
      // Pinned posts first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      
      // Then by date (newest first)
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    // Limit results
    posts = posts.slice(0, limitCount);
    
    return {
      success: true,
      posts
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      success: false,
      posts: []
    };
  }
}

// Create a new post
async function createNewPost(employeeId: string, companyId: string, anonymousProfile: any, postData: any) {
  try {
    const postsRef = collection(db, 'community_posts');
    
    const post = {
      company_id: companyId,
      author_id: anonymousProfile.anonymous_id,
      title: postData.title,
      content: postData.content,
      category: postData.category || 'general',
      tags: postData.tags || [],
      is_anonymous: true,
      likes: 0,
      replies: 0,
      views: 0,
      is_pinned: false,
      is_approved: true, // Auto-approve for now
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(postsRef, post);
    
    return {
      success: true,
      post_id: docRef.id,
      post: { id: docRef.id, ...post }
    };
  } catch (error) {
    console.error('Error creating post:', error);
    return {
      success: false,
      message: 'Failed to create post'
    };
  }
}

// Fetch replies for a post
async function fetchReplies(postId: string) {
  try {
    const repliesRef = collection(db, 'community_replies');
    const q = query(
      repliesRef,
      where('post_id', '==', postId),
      where('is_approved', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    let replies = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() || doc.data().created_at || new Date().toISOString()
    }));
    
    // Sort by created_at in memory
    replies.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB; // Ascending (oldest first)
    });
    
    return {
      success: true,
      replies
    };
  } catch (error) {
    console.error('Error fetching replies:', error);
    return {
      success: false,
      replies: []
    };
  }
}

// Create a new reply
async function createNewReply(employeeId: string, companyId: string, anonymousProfile: any, replyData: any) {
  try {
    const repliesRef = collection(db, 'community_replies');
    
    const reply = {
      post_id: replyData.post_id,
      author_id: anonymousProfile.anonymous_id,
      content: replyData.content,
      is_anonymous: true,
      likes: 0,
      is_approved: true,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    const docRef = await addDoc(repliesRef, reply);
    
    // Increment reply count on post
    const postRef = doc(db, 'community_posts', replyData.post_id);
    await updateDoc(postRef, {
      replies: increment(1),
      updated_at: serverTimestamp()
    });
    
    return {
      success: true,
      reply_id: docRef.id,
      reply: { id: docRef.id, ...reply }
    };
  } catch (error) {
    console.error('Error creating reply:', error);
    return {
      success: false,
      message: 'Failed to create reply'
    };
  }
}

// Like a post
async function likePost(postId: string) {
  try {
    const postRef = doc(db, 'community_posts', postId);
    await updateDoc(postRef, {
      likes: increment(1),
      updated_at: serverTimestamp()
    });
    
    return {
      success: true,
      message: 'Post liked successfully'
    };
  } catch (error) {
    console.error('Error liking post:', error);
    return {
      success: false,
      message: 'Failed to like post'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CommunityRequest = await request.json();
    const { action, employee_id, company_id, data } = body;
    
    if (!company_id) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'get_posts': {
        const result = await fetchPosts(
          company_id,
          data?.category,
          data?.limit_count || 20
        );
        return NextResponse.json(result);
      }
      
      case 'get_anonymous_profile': {
        if (!employee_id) {
          return NextResponse.json(
            { success: false, error: 'Employee ID is required' },
            { status: 400 }
          );
        }
        const profile = await getOrCreateAnonymousProfile(employee_id, company_id);
        return NextResponse.json({
          success: true,
          profile
        });
      }
      
      case 'create_post': {
        if (!employee_id) {
          return NextResponse.json(
            { success: false, error: 'Employee ID is required' },
            { status: 400 }
          );
        }
        const anonymousProfile = await getOrCreateAnonymousProfile(employee_id, company_id);
        const result = await createNewPost(employee_id, company_id, anonymousProfile, data);
        return NextResponse.json(result);
      }
      
      case 'get_replies': {
        const result = await fetchReplies(data.post_id);
        return NextResponse.json(result);
      }
      
      case 'create_reply': {
        if (!employee_id) {
          return NextResponse.json(
            { success: false, error: 'Employee ID is required' },
            { status: 400 }
          );
        }
        const anonymousProfile = await getOrCreateAnonymousProfile(employee_id, company_id);
        const result = await createNewReply(employee_id, company_id, anonymousProfile, data);
        return NextResponse.json(result);
      }
      
      case 'like_post': {
        const result = await likePost(data.post_id);
        return NextResponse.json(result);
      }
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in community API:', error);
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
