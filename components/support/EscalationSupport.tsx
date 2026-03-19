'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Shield, 
  Users, 
  Eye, 
  EyeOff, 
  Send, 
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  Loader2,
  HelpCircle,
  MessageSquare,
  Heart,
  Briefcase,
  AlertCircle,
  Info,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface EscalationFormData {
  ticket_type: 'hr' | 'manager' | 'anonymous' | 'urgent';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  category: 'workplace_harassment' | 'mental_health_crisis' | 'workload_concerns' | 'discrimination' | 'other';
  is_anonymous: boolean;
  confidential: boolean;
}

export default function EscalationSupport() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EscalationFormData>({
    ticket_type: 'hr',
    priority: 'medium',
    subject: '',
    description: '',
    category: 'other',
    is_anonymous: false,
    confidential: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/escalation/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: user.id,
          company_id: user.company_id,
          ...formData
        })
      });

      const result = await response.json();

      if (result.success) {
        setTicketId(result.ticket_id);
        setSubmitted(true);
        toast.success('Support ticket created successfully!');
      } else {
        toast.error(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('An error occurred while creating the ticket');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof EscalationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-xl">
          <CardContent className="p-8 sm:p-12 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-green-800 dark:text-green-300 mb-3"
            >
              Ticket Submitted Successfully!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-green-700 dark:text-green-400 mb-6 text-lg"
            >
              Your support request has been received and will be reviewed by our team.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-green-300 dark:border-green-700 mb-6 shadow-md"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-medium">Ticket ID</p>
              <p className="font-mono text-2xl font-bold text-gray-800 dark:text-gray-200 tracking-wider">{ticketId}</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 text-sm text-green-700 dark:text-green-400 mb-8"
            >
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <p>You will receive updates via email</p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <p>Response time: <strong>{formData.priority === 'urgent' ? 'Within 2 hours' : 'Within 24 hours'}</strong></p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                <p>All information is kept confidential</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setTicketId(null);
                  setFormData({
                    ticket_type: 'hr',
                    priority: 'medium',
                    subject: '',
                    description: '',
                    category: 'other',
                    is_anonymous: false,
                    confidential: false
                  });
                }}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Submit Another Request
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const supportTypes = [
    {
      value: 'hr' as const,
      label: 'HR Support',
      icon: Users,
      description: 'General HR concerns and workplace issues',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-200 dark:border-blue-800',
      ringColor: 'ring-blue-500',
      textColor: 'text-blue-900 dark:text-blue-300',
      textColorSecondary: 'text-blue-700 dark:text-blue-400',
      badgeColor: 'bg-blue-600'
    },
    {
      value: 'manager' as const,
      label: 'Manager Support',
      icon: Shield,
      description: 'Direct manager assistance and guidance',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-200 dark:border-green-800',
      ringColor: 'ring-green-500',
      textColor: 'text-green-900 dark:text-green-300',
      textColorSecondary: 'text-green-700 dark:text-green-400',
      badgeColor: 'bg-green-600'
    },
    {
      value: 'anonymous' as const,
      label: 'Anonymous',
      icon: EyeOff,
      description: 'Submit concerns without revealing identity',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-200 dark:border-purple-800',
      ringColor: 'ring-purple-500',
      textColor: 'text-purple-900 dark:text-purple-300',
      textColorSecondary: 'text-purple-700 dark:text-purple-400',
      badgeColor: 'bg-purple-600'
    },
    {
      value: 'urgent' as const,
      label: 'Urgent',
      icon: AlertTriangle,
      description: 'Critical issues requiring immediate attention',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-200 dark:border-red-800',
      ringColor: 'ring-red-500',
      textColor: 'text-red-900 dark:text-red-300',
      textColorSecondary: 'text-red-700 dark:text-red-400',
      badgeColor: 'bg-red-600'
    }
  ];

  const categoryOptions = [
    { value: 'workplace_harassment', label: 'Workplace Harassment', icon: AlertCircle },
    { value: 'mental_health_crisis', label: 'Mental Health Crisis', icon: Heart },
    { value: 'workload_concerns', label: 'Workload Concerns', icon: Briefcase },
    { value: 'discrimination', label: 'Discrimination', icon: AlertTriangle },
    { value: 'other', label: 'Other', icon: HelpCircle }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Support & Escalation
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get help with workplace concerns, mental health support, or other issues. We're here to help.
        </p>
      </motion.div>

      {/* Support Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Select Support Type
            </CardTitle>
            <CardDescription>
              Choose the type of support that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.ticket_type === type.value;
                return (
                  <motion.div
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? `${type.bgColor} ${type.borderColor} border-2 shadow-md ring-2 ring-offset-2 ${type.ringColor}`
                          : 'hover:shadow-md border hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      onClick={() => updateFormData('ticket_type', type.value)}
                    >
                      <CardContent className="p-5 text-center">
                        <div className={`w-14 h-14 ${type.iconBg} rounded-full flex items-center justify-center mx-auto mb-3 transition-colors`}>
                          <Icon className={`h-7 w-7 ${type.iconColor}`} />
                        </div>
                        <h3 className={`font-semibold mb-1 ${isSelected ? type.textColor : 'text-gray-900 dark:text-gray-100'}`}>
                          {type.label}
                        </h3>
                        <p className={`text-xs ${isSelected ? type.textColorSecondary : 'text-gray-600 dark:text-gray-400'}`}>
                          {type.description}
                        </p>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-2"
                          >
                            <Badge className={`${type.badgeColor} text-white`}>Selected</Badge>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 border-b">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-blue-600 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span>Create Support Request</span>
            </CardTitle>
            <CardDescription className="text-base">
              Fill out the form below to submit your support request. All information is kept confidential.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Priority Level */}
              <div>
                <Label htmlFor="priority" className="text-base font-semibold mb-3 block">
                  Priority Level <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => updateFormData('priority', value)}
                >
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Select priority level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span>Low - Can wait a few days</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <span>Medium - Within 24 hours</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                        <span>High - Within 12 hours</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <span>Urgent - Immediate attention</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-base font-semibold mb-3 block">
                  Category <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryOptions.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = formData.category === cat.value;
                    return (
                      <motion.div
                        key={cat.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-md'
                              : 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                          }`}
                          onClick={() => updateFormData('category', cat.value)}
                        >
                          <CardContent className="p-4 flex items-center gap-3">
                            <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`} />
                            <span className={`font-medium ${isSelected ? 'text-blue-900 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                              {cat.label}
                            </span>
                            {isSelected && (
                              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 ml-auto" />
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Subject */}
              <div>
                <Label htmlFor="subject" className="text-base font-semibold mb-3 block">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => updateFormData('subject', e.target.value)}
                  placeholder="Brief description of your concern (e.g., 'Need help with workload management')"
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Provide a clear, concise summary of your concern
                </p>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-base font-semibold mb-3 block">
                  Detailed Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Please provide detailed information about your concern. Include relevant dates, people involved, and any other context that would help us assist you better..."
                  rows={8}
                  className="text-base resize-none"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  The more details you provide, the better we can assist you
                </p>
              </div>

              <Separator />

              {/* Privacy Options */}
              <div className="space-y-4">
                <Label className="text-base font-semibold block mb-4">Privacy & Confidentiality</Label>
                
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <EyeOff className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <Label htmlFor="is_anonymous" className="text-base font-medium cursor-pointer">
                        Submit anonymously
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your identity will not be revealed to anyone
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="is_anonymous"
                    checked={formData.is_anonymous}
                    onCheckedChange={(checked) => updateFormData('is_anonymous', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <Label htmlFor="confidential" className="text-base font-medium cursor-pointer">
                        Mark as confidential
                      </Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Restrict access to authorized personnel only
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="confidential"
                    checked={formData.confidential}
                    onCheckedChange={(checked) => updateFormData('confidential', checked)}
                  />
                </div>
              </div>

              {/* Priority Alert */}
              <AnimatePresence>
                {formData.priority === 'urgent' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/20">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <AlertDescription className="text-red-800 dark:text-red-300">
                        <strong className="text-base">Urgent Priority Selected:</strong>
                        <p className="mt-1">This request will be escalated immediately and you should receive a response within 2 hours.</p>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mental Health Crisis Alert */}
              <AnimatePresence>
                {formData.category === 'mental_health_crisis' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
                      <Heart className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      <AlertDescription className="text-orange-800 dark:text-orange-300">
                        <strong className="text-base">Mental Health Support Available:</strong>
                        <p className="mt-2">If you're experiencing a mental health crisis, please also consider reaching out to:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>National Suicide Prevention Lifeline: <strong>988</strong></li>
                          <li>Crisis Text Line: Text <strong>HOME</strong> to <strong>741741</strong></li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading || !formData.subject || !formData.description}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Ticket...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Submit Support Request
                    </>
                  )}
                </Button>
                {(!formData.subject || !formData.description) && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                    Please fill in all required fields to submit
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950/20 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Additional Support Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Phone className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Emergency</p>
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">911</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">For immediate emergencies</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">HR Email</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">hr@company.com</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Direct HR contact</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Business Hours</p>
                  <p className="text-sm text-green-600 dark:text-green-400">9 AM - 5 PM</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Monday - Friday</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


