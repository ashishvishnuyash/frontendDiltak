/**
 * AvatarSettings - Interactive settings panel for 3D avatar customization
 * Allows users to control avatar behavior, quality, and interactive features
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Zap, 
  Eye, 
  Sparkles, 
  Monitor,
  Smartphone,
  Cpu,
  Volume2,
  MousePointer,
  Palette
} from 'lucide-react';

export interface AvatarSettingsConfig {
  interactive: boolean;
  showEnvironment: boolean;
  enableFloating: boolean;
  quality: 'low' | 'medium' | 'high';
  scale: number;
  enableBlinking: boolean;
  enableBreathing: boolean;
  enableGestures: boolean;
  emotionIntensity: number;
}

interface AvatarSettingsProps {
  config: AvatarSettingsConfig;
  onConfigChange: (config: AvatarSettingsConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const defaultConfig: AvatarSettingsConfig = {
  interactive: true,
  showEnvironment: true,
  enableFloating: true,
  quality: 'high',
  scale: 1.0,
  enableBlinking: true,
  enableBreathing: true,
  enableGestures: true,
  emotionIntensity: 1.0
};

export default function AvatarSettings({
  config,
  onConfigChange,
  isOpen,
  onToggle
}: AvatarSettingsProps) {
  const updateConfig = (updates: Partial<AvatarSettingsConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const resetToDefaults = () => {
    onConfigChange(defaultConfig);
  };

  const getQualityInfo = (quality: string) => {
    switch (quality) {
      case 'low':
        return { icon: Smartphone, color: 'text-yellow-600', desc: 'Better performance, lower quality' };
      case 'medium':
        return { icon: Monitor, color: 'text-blue-600', desc: 'Balanced performance and quality' };
      case 'high':
        return { icon: Cpu, color: 'text-green-600', desc: 'Best quality, higher GPU usage' };
      default:
        return { icon: Monitor, color: 'text-gray-600', desc: 'Standard quality' };
    }
  };

  const qualityInfo = getQualityInfo(config.quality);
  const QualityIcon = qualityInfo.icon;

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200 dark:border-gray-700"
        title="Avatar Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-sm text-gray-900 dark:text-gray-100">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Avatar Settings</span>
            </div>
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-sm text-gray-900 dark:text-gray-100">
          {/* Quality Settings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium flex items-center space-x-2">
                <QualityIcon className={`h-4 w-4 ${qualityInfo.color}`} />
                <span>Quality</span>
              </label>
              <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                {config.quality.toUpperCase()}
              </Badge>
            </div>
            <Select 
              value={config.quality} 
              onValueChange={(value: any) => updateConfig({ quality: value })}
            >
              <SelectTrigger className="h-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="low" className="text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-3 w-3" />
                    <span>Low (Performance)</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium" className="text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-3 w-3" />
                    <span>Medium (Balanced)</span>
                  </div>
                </SelectItem>
                <SelectItem value="high" className="text-gray-900 dark:text-gray-100">
                  <div className="flex items-center space-x-2">
                    <Cpu className="h-3 w-3" />
                    <span>High (Quality)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 dark:text-gray-400">{qualityInfo.desc}</p>
          </div>

          {/* Scale Setting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium">Avatar Size</label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{config.scale.toFixed(1)}x</span>
            </div>
            <Slider
              value={[config.scale]}
              onValueChange={([value]) => updateConfig({ scale: value })}
              min={0.5}
              max={2.5}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Interactive Features */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <MousePointer className="h-4 w-4" />
              <span>Interactive Features</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Mouse Interaction</label>
                <Switch
                  checked={config.interactive}
                  onCheckedChange={(checked) => updateConfig({ interactive: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Floating Animation</label>
                <Switch
                  checked={config.enableFloating}
                  onCheckedChange={(checked) => updateConfig({ enableFloating: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Environment</label>
                <Switch
                  checked={config.showEnvironment}
                  onCheckedChange={(checked) => updateConfig({ showEnvironment: checked })}
                />
              </div>
            </div>
          </div>

          {/* Animation Features */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Animations</span>
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto Blinking</label>
                <Switch
                  checked={config.enableBlinking}
                  onCheckedChange={(checked) => updateConfig({ enableBlinking: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Breathing</label>
                <Switch
                  checked={config.enableBreathing}
                  onCheckedChange={(checked) => updateConfig({ enableBreathing: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Hand Gestures</label>
                <Switch
                  checked={config.enableGestures}
                  onCheckedChange={(checked) => updateConfig({ enableGestures: checked })}
                />
              </div>
            </div>
          </div>

          {/* Emotion Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-medium flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Emotion Intensity</span>
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">{Math.round(config.emotionIntensity * 100)}%</span>
            </div>
            <Slider
              value={[config.emotionIntensity]}
              onValueChange={([value]) => updateConfig({ emotionIntensity: value })}
              min={0.1}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button
              onClick={resetToDefaults}
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Reset
            </Button>
            <Button
              onClick={onToggle}
              size="sm"
              className="flex-1 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              Done
            </Button>
          </div>

          {/* Performance Tip */}
          {config.quality === 'high' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-2 text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Lower quality if you experience lag
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing avatar settings
export function useAvatarSettings() {
  const [config, setConfig] = useState<AvatarSettingsConfig>(defaultConfig);
  const [isOpen, setIsOpen] = useState(false);

  const updateConfig = (newConfig: AvatarSettingsConfig) => {
    setConfig(newConfig);
    // Save to localStorage
    localStorage.setItem('avatarSettings', JSON.stringify(newConfig));
  };

  // Load settings from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('avatarSettings');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setConfig({ ...defaultConfig, ...parsedConfig });
      } catch (error) {
        console.error('Failed to load avatar settings:', error);
      }
    }
  }, []);

  return {
    config,
    updateConfig,
    isOpen,
    setIsOpen,
    toggleSettings: () => setIsOpen(!isOpen)
  };
}