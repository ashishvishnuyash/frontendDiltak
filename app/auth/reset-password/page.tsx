'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, Lock, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { auth } from '@/lib/firebase';
import { confirmPasswordReset } from 'firebase/auth';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) throw new Error('Missing password reset code.');

      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <motion.header
        className="border-b border-border bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">D</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-lime-500 to-emerald-600">Diltak.ai</span>
            </Link>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </motion.header>

      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] px-4 py-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-card border border-border shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <motion.div
                className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {success ? <CheckCircle className="h-7 w-7 text-white" /> : <Lock className="h-7 w-7 text-white" />}
              </motion.div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">
                {success ? 'Password Updated!' : 'Set New Password'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {success ? 'Your password has been successfully updated' : 'Enter your new password below'}
              </p>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You can now sign in with your new password. Redirecting you shortly...
                  </p>
                  <Button asChild className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                    <Link href="/auth/login">Continue to Sign In</Link>
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-foreground">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>• At least 6 characters</p>
                    <p className={password === confirmPassword && password.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>• Passwords match</p>
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                      disabled={loading || !password || password !== confirmPassword}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Updating password...
                        </span>
                      ) : 'Update Password'}
                    </Button>
                  </motion.div>
                </form>
              )}
            </CardContent>
          </Card>

          {!success && (
            <div className="mt-4 bg-card border border-border rounded-xl p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Security Notice</h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Choose a strong, unique password</p>
                <p>• Don&apos;t reuse passwords from other accounts</p>
                <p>• This reset link will expire after use</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
