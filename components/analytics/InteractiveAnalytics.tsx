'use client';

import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { 
  Brain, 
  Smile, 
  AlertTriangle, 
  Battery, 
  Heart,
  Moon,
  Shield,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AnalyticsData {
  mood_rating: number;
  stress_level: number;
  energy_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  anxiety_level: number;
  confidence_level: number;
  sleep_quality: number;
  overall_wellness: number;
}

interface InteractiveAnalyticsProps {
  data: AnalyticsData;
  showComparison?: boolean;
  previousData?: AnalyticsData;
}

const CircularProgress = ({ 
  value, 
  maxValue = 10, 
  size = 120, 
  strokeWidth = 8, 
  color = '#3B82F6',
  icon: Icon,
  label,
  showAnimation = true
}: {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  icon?: any;
  label?: string;
  showAnimation?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / maxValue) * 100;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={showAnimation ? circumference : strokeDashoffset}
            animate={showAnimation ? { strokeDashoffset } : {}}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {Icon && <Icon className="h-6 w-6 mb-1" style={{ color }} />}
          <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            /{maxValue}
          </span>
        </div>
      </div>
      
      {label && (
        <span className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
          {label}
        </span>
      )}
    </div>
  );
};

const WellnessPieChart = ({ data }: { data: AnalyticsData }) => {
  const pieData = [
    { name: 'Excellent (8-10)', value: 0, color: '#10B981' },
    { name: 'Good (6-7)', value: 0, color: '#3B82F6' },
    { name: 'Fair (4-5)', value: 0, color: '#F59E0B' },
    { name: 'Poor (1-3)', value: 0, color: '#EF4444' },
  ];

  // Calculate distribution based on all metrics
  const metrics = [
    data.mood_rating,
    data.energy_level,
    data.work_satisfaction,
    data.work_life_balance,
    data.confidence_level,
    data.sleep_quality,
    10 - data.stress_level, // Invert stress for positive representation
    10 - data.anxiety_level, // Invert anxiety for positive representation
  ];

  metrics.forEach(metric => {
    if (metric >= 8) pieData[0].value++;
    else if (metric >= 6) pieData[1].value++;
    else if (metric >= 4) pieData[2].value++;
    else pieData[3].value++;
  });

  // Filter out zero values
  const filteredData = pieData.filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-gray-100">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} metric{data.value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2 text-purple-600" />
          Wellness Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InteractiveAnalytics({ 
  data, 
  showComparison = false, 
  previousData 
}: InteractiveAnalyticsProps) {
  const metrics = [
    {
      key: 'mood_rating',
      label: 'Mood',
      icon: Smile,
      color: '#3B82F6',
      value: data.mood_rating
    },
    {
      key: 'energy_level',
      label: 'Energy',
      icon: Battery,
      color: '#10B981',
      value: data.energy_level
    },
    {
      key: 'work_satisfaction',
      label: 'Work Satisfaction',
      icon: Heart,
      color: '#8B5CF6',
      value: data.work_satisfaction
    },
    {
      key: 'work_life_balance',
      label: 'Work-Life Balance',
      icon: Target,
      color: '#F59E0B',
      value: data.work_life_balance
    },
    {
      key: 'confidence_level',
      label: 'Confidence',
      icon: Shield,
      color: '#06B6D4',
      value: data.confidence_level
    },
    {
      key: 'sleep_quality',
      label: 'Sleep Quality',
      icon: Moon,
      color: '#6366F1',
      value: data.sleep_quality
    }
  ];

  const stressMetrics = [
    {
      key: 'stress_level',
      label: 'Stress Level',
      icon: AlertTriangle,
      color: '#EF4444',
      value: data.stress_level,
      inverted: true
    },
    {
      key: 'anxiety_level',
      label: 'Anxiety Level',
      icon: AlertTriangle,
      color: '#F97316',
      value: data.anxiety_level,
      inverted: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Overall Wellness Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Overall Wellness Score
            </h2>
            <div className="flex justify-center">
              <CircularProgress
                value={data.overall_wellness}
                maxValue={10}
                size={160}
                strokeWidth={12}
                color="#8B5CF6"
                icon={Brain}
                label="Overall Wellness"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wellness Distribution Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <WellnessPieChart data={data} />
      </motion.div>

      {/* Positive Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Wellness Metrics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="flex justify-center"
                >
                  <CircularProgress
                    value={metric.value}
                    maxValue={10}
                    size={100}
                    strokeWidth={6}
                    color={metric.color}
                    icon={metric.icon}
                    label={metric.label}
                  />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stress & Anxiety Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Stress Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stressMetrics.map((metric, index) => (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="flex justify-center"
                >
                  <div className="text-center">
                    <CircularProgress
                      value={metric.value}
                      maxValue={10}
                      size={120}
                      strokeWidth={8}
                      color={metric.color}
                      icon={metric.icon}
                      label={metric.label}
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Lower is better
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}