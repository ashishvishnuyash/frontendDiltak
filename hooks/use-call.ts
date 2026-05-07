'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from './use-user';
import { toast } from 'sonner';

export interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'caller' | 'receiver';
  isOnline: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
}

export interface CallState {
  callId: string | null;
  participants: CallParticipant[];
  callType: 'voice' | 'video';
  status: 'idle' | 'initiating' | 'ringing' | 'active' | 'ended' | 'rejected';
  isIncoming: boolean;
  callDuration: number;
  startTime: Date | null;
  endTime: Date | null;
}

export interface CallControls {
  isMuted: boolean;
  isVideoOn: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
}

export function useCall() {
  const { user } = useUser();
  const [callState, setCallState] = useState<CallState>({
    callId: null,
    participants: [],
    callType: 'voice',
    status: 'idle',
    isIncoming: false,
    callDuration: 0,
    startTime: null,
    endTime: null,
  });

  const [callControls, setCallControls] = useState<CallControls>({
    isMuted: false,
    isVideoOn: false,
    isSpeakerOn: false,
    isScreenSharing: false,
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout>();

  const initializeWebRTC = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.callType === 'video',
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };
      setPeerConnection(pc);
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast.error('Failed to access camera/microphone');
    }
  }, [callState.callType]);

  const initiateCall = useCallback(async (receiverId: string, receiverName: string, callType: 'voice' | 'video' = 'voice') => {
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'initiate',
          callData: {
            callerId: user?.id,
            receiverId,
            callType,
            metadata: {
              callerName: `${user?.first_name} ${user?.last_name}`,
              receiverName,
            },
          },
        }),
      });
      const result = await response.json();
      if (result.success) {
        setCallState(prev => ({
          ...prev,
          callId: result.callId,
          participants: [
            { id: user?.id || '', name: `${user?.first_name} ${user?.last_name}`, avatar: user?.avatar_url, role: 'caller', isOnline: true, isMuted: false, isVideoOn: callType === 'video' },
            { id: receiverId, name: receiverName, role: 'receiver', isOnline: true, isMuted: false, isVideoOn: false },
          ],
          callType,
          status: 'initiating',
          isIncoming: false,
        }));
        await initializeWebRTC();
        toast.success('Call initiated');
      } else {
        toast.error('Failed to initiate call');
      }
    } catch (error) {
      console.error('Error initiating call:', error);
      toast.error('Failed to initiate call');
    }
  }, [user, initializeWebRTC]);

  const acceptCall = useCallback(async () => {
    if (!callState.callId) return;
    try {
      const response = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept', callData: { callId: callState.callId, receiverId: user?.id } }),
      });
      const result = await response.json();
      if (result.success) {
        setCallState(prev => ({ ...prev, status: 'active', startTime: new Date() }));
        await initializeWebRTC();
        toast.success('Call accepted');
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      toast.error('Failed to accept call');
    }
  }, [callState.callId, user?.id, initializeWebRTC]);

  const rejectCall = useCallback(async () => {
    if (!callState.callId) return;
    try {
      await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', callData: { callId: callState.callId, receiverId: user?.id, reason: 'rejected' } }),
      });
      setCallState(prev => ({ ...prev, status: 'rejected', endTime: new Date() }));
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }, [callState.callId, user?.id]);

  const endCall = useCallback(async () => {
    if (!callState.callId) return;
    try {
      await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end', callData: { callId: callState.callId, userId: user?.id, reason: 'ended' } }),
      });
      setCallState(prev => ({ ...prev, status: 'ended', endTime: new Date() }));
      localStream?.getTracks().forEach(t => t.stop());
      peerConnection?.close();
      setLocalStream(null);
      setRemoteStream(null);
      setPeerConnection(null);
      toast.success('Call ended');
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [callState.callId, user?.id, localStream, peerConnection]);

  const toggleMute = useCallback(() => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setCallControls(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setCallControls(prev => ({ ...prev, isVideoOn: videoTrack.enabled }));
    }
  }, [localStream]);

  const toggleSpeaker = useCallback(() => {
    setCallControls(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  }, []);

  // Call timer
  useEffect(() => {
    if (callState.status === 'active') {
      callTimerRef.current = setInterval(() => {
        setCallState(prev => ({ ...prev, callDuration: prev.callDuration + 1 }));
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState.status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      localStream?.getTracks().forEach(t => t.stop());
      peerConnection?.close();
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [localStream, peerConnection]);

  return {
    callState, callControls,
    localVideoRef, remoteVideoRef,
    initiateCall, acceptCall, rejectCall, endCall,
    toggleMute, toggleVideo, toggleSpeaker,
  };
}
