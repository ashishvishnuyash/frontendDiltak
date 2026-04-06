'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 

  Heart, 
  Brain, 
  Zap, 
  Briefcase, 
  Scale, 
  AlertTriangle, 
  Target, 
  Moon,
  Save, 
  ArrowLeft
} from 'lucide-react'; // Assuming these are used for icons
import { useUser } from '@/hooks/use-user'; // Correct import for useUser
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase'; // Import db
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/loader';

interface ReportData {
  stress_level: number;
  mood_rating: number;
  energy_level: number;
  work_satisfaction: number;
  work_life_balance: number;
  anxiety_level: number;
  confidence_level: number;
  sleep_quality: number;
  comments: string;
  timestamp: Date; // Add timestamp to the type
  employee_id: string; // Add employee_id to the type
}

export default function NewReportPage() {
  const router = useRouter();
  // Removed Supabase client initialization
  const { user } = useUser(); // Get the user object from the hook

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [reportData, setReportData] = useState<ReportData>({
    stress_level: 5,
    mood_rating: 5,
    energy_level: 5,
    work_satisfaction: 5,
    work_life_balance: 5,
    anxiety_level: 5,
    confidence_level: 5,
    sleep_quality: 5,
    timestamp: new Date(), // Initialize timestamp
    comments: '', 
    employee_id: user?.id || '', // Initialize employee_id with user ID
  });

  const totalSteps = 4;

  const updateMetric = (key: keyof ReportData, value: number | string) => {
    setReportData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const reportToSave: ReportData = {
      ...reportData,
      timestamp: new Date(), // Use serverTimestamp() if running on server/functions - keeping New Date for now
      employee_id: user?.id || '', // Ensure employee_id is set before saving
    };

    try {
      // Assuming 'db' is imported from '@/lib/firebase'
      await addDoc(collection(db, 'mental_health_reports'), reportToSave);

      // No specific error check needed for addDoc success, caught by the catch block

      // toast.success('Wellness report saved successfully!'); // Re-add toast if needed
      router.push('/employee/dashboard');
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Emotional Wellbeing';
      case 2: return 'Work & Life Balance';
      case 3: return 'Physical & Mental State';
      case 4: return 'Additional Notes';
      default: return '';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Heart className="h-6 w-6 text-red-500" />
                <Label className="text-lg font-medium">How is your mood today?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.mood_rating]}
                  onValueChange={(value) => updateMetric('mood_rating', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Low (1)</span>
                  <span className="font-medium text-lg">{reportData.mood_rating}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
                <Label className="text-lg font-medium">What's your stress level?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.stress_level]}
                  onValueChange={(value) => updateMetric('stress_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>No Stress (1)</span>
                  <span className="font-medium text-lg">{reportData.stress_level}/10</span>
                  <span>Very High (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Brain className="h-6 w-6 text-purple-500" />
                <Label className="text-lg font-medium">How anxious do you feel?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.anxiety_level]}
                  onValueChange={(value) => updateMetric('anxiety_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Calm (1)</span>
                  <span className="font-medium text-lg">{reportData.anxiety_level}/10</span>
                  <span>Very Anxious (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Briefcase className="h-6 w-6 text-blue-500" />
                <Label className="text-lg font-medium">How satisfied are you with your work?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.work_satisfaction]}
                  onValueChange={(value) => updateMetric('work_satisfaction', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Unsatisfied (1)</span>
                  <span className="font-medium text-lg">{reportData.work_satisfaction}/10</span>
                  <span>Very Satisfied (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Scale className="h-6 w-6 text-green-500" />
                <Label className="text-lg font-medium">How's your work-life balance?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.work_life_balance]}
                  onValueChange={(value) => updateMetric('work_life_balance', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Poor (1)</span>
                  <span className="font-medium text-lg">{reportData.work_life_balance}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Zap className="h-6 w-6 text-yellow-500" />
                <Label className="text-lg font-medium">What's your energy level?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.energy_level]}
                  onValueChange={(value) => updateMetric('energy_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Exhausted (1)</span>
                  <span className="font-medium text-lg">{reportData.energy_level}/10</span>
                  <span>Very Energetic (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-indigo-500" />
                <Label className="text-lg font-medium">How confident do you feel?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.confidence_level]}
                  onValueChange={(value) => updateMetric('confidence_level', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Low (1)</span>
                  <span className="font-medium text-lg">{reportData.confidence_level}/10</span>
                  <span>Very Confident (10)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Moon className="h-6 w-6 text-gray-500" />
                <Label className="text-lg font-medium">How was your sleep quality?</Label>
              </div>
              <div className="px-4">
                <Slider
                  value={[reportData.sleep_quality]}
                  onValueChange={(value) => updateMetric('sleep_quality', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Very Poor (1)</span>
                  <span className="font-medium text-lg">{reportData.sleep_quality}/10</span>
                  <span>Excellent (10)</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">
                Additional thoughts or comments (optional)
              </Label>
              <Textarea
                placeholder="Share any additional thoughts about your mental health, recent events, or anything else you'd like to note..."
                value={reportData.comments}
                onChange={(e) => updateMetric('comments', e.target.value)}
                rows={6}
                className="w-full"
              />
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">Report Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>Mood: {reportData.mood_rating}/10</div>
                <div>Stress: {reportData.stress_level}/10</div>
                <div>Energy: {reportData.energy_level}/10</div>
                <div>Work Satisfaction: {reportData.work_satisfaction}/10</div>
                <div>Work-Life Balance: {reportData.work_life_balance}/10</div>
                <div>Anxiety: {reportData.anxiety_level}/10</div>
                <div>Confidence: {reportData.confidence_level}/10</div>
                <div>Sleep Quality: {reportData.sleep_quality}/10</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to create a wellness report.</p>
          <Button asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/employee/dashboard" className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-widest mb-4 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">New Wellness Report</h1>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 opacity-80 uppercase tracking-wider">
            Reflect on your emotional and physical state
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3 px-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <span className="text-xs font-black text-emerald-600">{currentStep}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Current Step</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{getStepTitle(currentStep)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Completion</p>
              <p className="text-sm font-black text-emerald-600">{Math.round((currentStep / totalSteps) * 100)}%</p>
            </div>
          </div>
          <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="p-6 sm:p-8 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 bg-emerald-500 rounded-full" />
              <CardTitle className="text-base font-bold tracking-tight text-gray-800 dark:text-gray-100 uppercase">{getStepTitle(currentStep)}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-6 sm:p-8">
            {error && (
              <Alert variant="destructive" className="mb-8 rounded-md border-red-500/50 bg-red-500/5">
                <AlertDescription className="text-xs font-bold uppercase">{error}</AlertDescription>
              </Alert>
            )}

            <div className="min-h-[300px]">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-widest text-gray-400 disabled:opacity-20 hover:text-gray-600"
              >
                Previous Step
              </Button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {currentStep < totalSteps ? (
                  <Button
                    onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                    className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-md shadow-sm active:scale-95 transition-all"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <Spinner size="sm" color="border-white" className="mr-2" />
                        Saving Report...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Finalize & Submit
                      </div>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Notice Strip */}
        <div className="mt-8 flex items-start gap-4 p-6 bg-indigo-50/30 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-lg">
          <Scale className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Privacy & Data Governance</h4>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-loose opacity-80 leading-relaxed">
              Your wellness data is strictly encrypted. Only you can view individual reports. 
              Employers only access anonymized aggregate trends to support team wellbeing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
