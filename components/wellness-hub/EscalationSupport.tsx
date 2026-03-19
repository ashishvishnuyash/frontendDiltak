'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, MessageCircle, Calendar, Clock, User } from 'lucide-react';

interface EscalationSupportProps {
  userRole: 'employee' | 'manager' | 'employer';
  userId?: string;
}

interface EscalationCase {
    id: string;
    employeeName: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    type: 'mental-health' | 'harassment' | 'safety' | 'other';
    description: string;
    timestamp: Date;
    status: 'open' | 'in-progress' | 'resolved';
    assignedTo?: string;
}

export default function EscalationSupport({ userRole, userId }: EscalationSupportProps) {
    const [cases, setCases] = useState<EscalationCase[]>([
        {
            id: '1',
            employeeName: 'Anonymous Employee',
            severity: 'high',
            type: 'mental-health',
            description: 'Employee reported severe anxiety and panic attacks affecting work performance',
            timestamp: new Date('2024-01-15T10:30:00'),
            status: 'open'
        },
        {
            id: '2',
            employeeName: 'John Smith',
            severity: 'critical',
            type: 'harassment',
            description: 'Workplace harassment complaint requiring immediate attention',
            timestamp: new Date('2024-01-15T14:20:00'),
            status: 'in-progress',
            assignedTo: 'HR Manager'
        }
    ]);

    const [newCase, setNewCase] = useState({
        employeeName: '',
        severity: 'medium' as const,
        type: 'other' as const,
        description: ''
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleSubmitCase = () => {
        if (!newCase.employeeName || !newCase.description) return;

        const escalationCase: EscalationCase = {
            id: Date.now().toString(),
            ...newCase,
            timestamp: new Date(),
            status: 'open'
        };

        setCases([escalationCase, ...cases]);
        setNewCase({
            employeeName: '',
            severity: 'medium',
            type: 'other',
            description: ''
        });
    };

    return (
        <div className="space-y-8">
            {/* Enhanced Emergency Contacts */}
            <Card className="border-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/30 rounded-full translate-y-12 -translate-x-12" />
                
                <CardHeader className="relative z-10">
                    <CardTitle className="flex items-center gap-3 text-2xl text-red-800 dark:text-red-200">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 2, 
                                repeat: Infinity 
                            }}
                        >
                            <AlertTriangle className="h-7 w-7 drop-shadow-sm" />
                        </motion.div>
                        Emergency Support Contacts
                    </CardTitle>
                    <p className="text-red-700 dark:text-red-300 text-lg">
                        Immediate help is always available - you're never alone
                    </p>
                </CardHeader>
                
                <CardContent className="relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div 
                            className="group flex items-center gap-4 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-red-200 dark:border-red-700"
                            whileHover={{ scale: 1.02, y: -2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.div
                                className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg"
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <Phone className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                                    Crisis Hotline
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                    📞 988 (24/7)
                                </p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="group flex items-center gap-4 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-200 dark:border-blue-700"
                            whileHover={{ scale: 1.02, y: -2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <motion.div
                                className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <MessageCircle className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    HR Emergency
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                    📱 ext. 911
                                </p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="group flex items-center gap-4 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200 dark:border-green-700"
                            whileHover={{ scale: 1.02, y: -2 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <motion.div
                                className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg"
                                whileHover={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 0.5 }}
                            >
                                <User className="h-6 w-6 text-white" />
                            </motion.div>
                            <div>
                                <p className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                    EAP Counselor
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 font-semibold">
                                    🆘 1-800-EAP-HELP
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Create New Case */}
            <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            📝
                        </motion.div>
                        Report New Escalation Case
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Your voice matters - report concerns safely and confidentially
                    </p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                👤 Employee Name
                            </label>
                            <Input
                                value={newCase.employeeName}
                                onChange={(e) => setNewCase({ ...newCase, employeeName: e.target.value })}
                                placeholder="Enter employee name or 'Anonymous'"
                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                            />
                            <motion.div 
                                className="flex items-center gap-3 mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl"
                                whileHover={{ scale: 1.02 }}
                            >
                                <input
                                    type="checkbox"
                                    id="anonymous-report"
                                    checked={newCase.employeeName === 'Anonymous'}
                                    onChange={(e) => setNewCase({ 
                                        ...newCase, 
                                        employeeName: e.target.checked ? 'Anonymous' : '' 
                                    })}
                                    className="rounded w-4 h-4"
                                />
                                <label htmlFor="anonymous-report" className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                                    🎭 Submit anonymously for privacy
                                </label>
                            </motion.div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                                🚨 Severity Level
                            </label>
                            <select
                                value={newCase.severity}
                                onChange={(e) => setNewCase({ ...newCase, severity: e.target.value as any })}
                                className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-gray-700"
                            >
                                <option value="low">🌱 Low - General concern</option>
                                <option value="medium">⚡ Medium - Needs attention</option>
                                <option value="high">🔥 High - Urgent matter</option>
                                <option value="critical">🚨 Critical - Immediate action required</option>
                            </select>
                        </motion.div>
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                            📋 Case Type
                        </label>
                        <select
                            value={newCase.type}
                            onChange={(e) => setNewCase({ ...newCase, type: e.target.value as any })}
                            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors bg-white dark:bg-gray-700"
                        >
                            <option value="mental-health">🧠 Mental Health</option>
                            <option value="harassment">⚠️ Harassment</option>
                            <option value="safety">🛡️ Safety Concern</option>
                            <option value="other">📝 Other</option>
                        </select>
                    </motion.div>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-bold mb-3 text-gray-700 dark:text-gray-300">
                            💬 Description
                        </label>
                        <Textarea
                            value={newCase.description}
                            onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                            placeholder="Provide detailed description of the situation... Your information will be handled with complete confidentiality."
                            rows={6}
                            className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors resize-none"
                        />
                    </motion.div>
                    
                    <motion.div
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                            🔒 <strong>Confidentiality Guarantee:</strong> All reports are handled with strict confidentiality. 
                            Your safety and privacy are our top priorities.
                        </p>
                    </motion.div>
                    
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Button 
                            onClick={handleSubmitCase} 
                            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            🚀 Submit Escalation Case
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>

            {/* Enhanced Active Cases */}
            <Card className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-800/90 dark:to-gray-700/90 backdrop-blur-md border-0 shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            📊
                        </motion.div>
                        Active Escalation Cases
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Track and manage ongoing support cases
                    </p>
                </CardHeader>
                
                <CardContent>
                    <div className="space-y-6">
                        {cases.map((case_, index) => (
                            <motion.div
                                key={case_.id}
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.01, y: -2 }}
                                className="border-0 rounded-2xl p-6 space-y-4 bg-gradient-to-r from-white/80 to-gray-50/80 dark:from-gray-700/80 dark:to-gray-800/80 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <motion.div 
                                            className={`w-4 h-4 rounded-full shadow-lg ${getSeverityColor(case_.severity)}`}
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                        <div>
                                            <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100">
                                                {case_.employeeName}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-400 capitalize font-medium">
                                                📋 {case_.type.replace('-', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Badge className={`${getSeverityColor(case_.severity)} px-3 py-1 font-bold text-sm shadow-md`}>
                                                {case_.severity === 'critical' ? '🚨' : 
                                                 case_.severity === 'high' ? '🔥' : 
                                                 case_.severity === 'medium' ? '⚡' : '🌱'} 
                                                {case_.severity.toUpperCase()}
                                            </Badge>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <Badge variant="outline" className={`${getStatusColor(case_.status)} px-3 py-1 font-bold text-sm border-2`}>
                                                {case_.status === 'open' ? '🔓' : 
                                                 case_.status === 'in-progress' ? '⏳' : '✅'} 
                                                {case_.status.replace('-', ' ').toUpperCase()}
                                            </Badge>
                                        </motion.div>
                                    </div>
                                </div>

                                <motion.p 
                                    className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-700/50 p-4 rounded-xl text-base"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    {case_.description}
                                </motion.p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                        <motion.div 
                                            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <Clock className="h-4 w-4" />
                                            <span className="font-medium">
                                                {case_.timestamp.toLocaleDateString()} at {case_.timestamp.toLocaleTimeString()}
                                            </span>
                                        </motion.div>
                                        {case_.assignedTo && (
                                            <motion.div 
                                                className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-full"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                <span className="font-medium text-blue-700 dark:text-blue-300">
                                                    Assigned to: {case_.assignedTo}
                                                </span>
                                            </motion.div>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                className="bg-white/80 dark:bg-gray-700/80 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 px-4 py-2 rounded-xl font-medium"
                                            >
                                                <Calendar className="h-4 w-4 mr-2" />
                                                Schedule Follow-up
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button 
                                                size="sm"
                                                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg"
                                            >
                                                Update Status
                                            </Button>
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}