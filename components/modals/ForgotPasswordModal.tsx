'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  X,
  Mail,
  CheckCircle,
  Loader2,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      toast.success('Password reset email sent!');
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Handle specific Firebase Auth errors
      switch (err.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const handleTryDifferentEmail = () => {
    setSuccess(false);
    setEmail('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              {success ? (
                // Success State
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Check Your Email
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                      {email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click the link in the email to reset your password. If you don't see it, check your spam folder.
                    </p>
                  </div>

                  <div className="space-y-3 pt-4">
                    <Button 
                      onClick={handleClose}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      Back to Sign In
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleTryDifferentEmail}
                      className="w-full"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Try Different Email
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // Form State
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <KeyRound className="h-6 w-6 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      Reset Your Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Enter your email address and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50">
                          <AlertDescription className="text-red-700 dark:text-red-300 text-sm">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (error) setError('');
                          }}
                          className="pl-10"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        disabled={!email.trim() || loading}
                      >
                        {loading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                          </div>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Help Text */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm">Need help?</h3>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Make sure you enter the email address associated with your account</p>
                      <p>• Check your spam or junk folder if you don't receive the email</p>
                      <p>• The reset link will expire after 1 hour for security</p>
                      <p>• Contact your administrator if you continue having issues</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}