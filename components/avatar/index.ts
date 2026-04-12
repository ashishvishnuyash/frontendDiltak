export { default as AvatarModel } from './AvatarModel';
export { default as AvatarController } from './AvatarController';
export { default as LipSyncController, useLipSync } from './LipSyncController';
export { default as TTSLipSync, useTTSLipSync } from './TTSLipSync';
export { default as LipSyncDemo } from './LipSyncDemo';
export { default as InteractiveAvatarDemo } from './InteractiveAvatarDemo';
export { default as AvatarSettings, useAvatarSettings } from './AvatarSettings';
export { LipSyncAnalyzer, VISEME_BLENDSHAPE_MAP } from './LipSyncAnalyzer';
export type { VisemeData, AudioAnalysisResult } from './LipSyncAnalyzer';
export type { LipSyncState } from './LipSyncController';
export type { AvatarSettingsConfig } from './AvatarSettings';

// Azure TTS Avatar
export { default as AzureAvatar, AVATAR_CHARACTERS } from './AzureAvatar';
export type { AzureAvatarHandle, AvatarCharacter } from './AzureAvatar';
export { default as AzureAvatarSelector } from './AzureAvatarSelector';