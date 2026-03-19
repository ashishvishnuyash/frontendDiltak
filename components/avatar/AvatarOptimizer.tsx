'use client';

import { useEffect, useState } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

interface ModelCache {
  [key: string]: any;
}

class AvatarOptimizer {
  private static instance: AvatarOptimizer;
  private modelCache: ModelCache = {};
  private gltfLoader: GLTFLoader;
  private fbxLoader: FBXLoader;
  private dracoLoader: DRACOLoader;

  constructor() {
    // Initialize loaders with optimization
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.dracoLoader = new DRACOLoader();
    
    // Enable DRACO compression for better performance
    this.dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  static getInstance(): AvatarOptimizer {
    if (!AvatarOptimizer.instance) {
      AvatarOptimizer.instance = new AvatarOptimizer();
    }
    return AvatarOptimizer.instance;
  }

  async preloadModel(url: string, type: 'gltf' | 'fbx' = 'gltf'): Promise<any> {
    if (this.modelCache[url]) {
      return this.modelCache[url];
    }

    return new Promise((resolve, reject) => {
      const loader = type === 'gltf' ? this.gltfLoader : this.fbxLoader;
      
      loader.load(
        url,
        (model) => {
          this.modelCache[url] = model;
          resolve(model);
        },
        (progress) => {
          console.log(`Preloading ${url}: ${Math.round((progress.loaded / progress.total) * 100)}%`);
        },
        reject
      );
    });
  }

  async preloadCriticalAssets(): Promise<void> {
    const criticalAssets = [
      { url: '/model/68dce07322326403ec9e4358.glb', type: 'gltf' as const },
      { url: '/animation/Talking On Phone.fbx', type: 'fbx' as const },
      { url: '/animation/Excited.fbx', type: 'fbx' as const }
    ];

    const preloadPromises = criticalAssets.map(asset => 
      this.preloadModel(asset.url, asset.type).catch(error => {
        console.warn(`Failed to preload ${asset.url}:`, error);
      })
    );

    await Promise.allSettled(preloadPromises);
  }

  getCachedModel(url: string): any {
    return this.modelCache[url];
  }

  clearCache(): void {
    this.modelCache = {};
  }
}

export const useAvatarOptimizer = () => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [preloadProgress, setPreloadProgress] = useState(0);

  useEffect(() => {
    const optimizer = AvatarOptimizer.getInstance();
    
    const preload = async () => {
      try {
        await optimizer.preloadCriticalAssets();
        setPreloadProgress(100);
      } catch (error) {
        console.error('Preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    preload();
  }, []);

  return {
    isPreloading,
    preloadProgress,
    optimizer: AvatarOptimizer.getInstance()
  };
};

export default AvatarOptimizer;