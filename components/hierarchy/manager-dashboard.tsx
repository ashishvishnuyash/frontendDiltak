'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  Eye,
  MessageSquare,
  BarChart3,
  Shield,
  ChevronRight,
  Loader2,
  RefreshCw,
  Brain,
  Heart,
  Battery,
  Sparkles,
  Star,
  ArrowRight,
  Crown
} from 'lucide-react';
import { getTeamStats, getDirectReports, getManagerPermissions } from '@/lib/hierarchy-service';
import { getDemoUser, getDemoTeamStats, demoUsers } from '@/lib/demo-data';
import type { User, TeamStats, ManagerPermissions } from '@/types/index';
import Link from 'next/link';

interface ManagerDashboardProps {
  manager: User;
  onViewTeamMember?: (employee: User) => void;
}

interface TeamMemberCardProps {
  employee: User;
  onView?: (employee: User) => void;
  canViewReports: boolean;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ employee, onView, canViewReports }) => {
  const getWellnessColor = (level: number) => {
    if (level >= 8) return 'text-green-600 bg-green-50';
    if (level >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getWellnessStatus = (score: number): { label: string; color: string; textColor: string } => {
    if (score >= 8) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 6) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 4) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    return { label: 'Needs Attention', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const wellnessScore = 7.2; // This would come from real data
  const wellnessStatus = getWellnessStatus(wellnessScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group">
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 w-full sm:w-auto">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-xs sm:text-sm lg:text-base">
                    {employee.first_name?.[0]}{employee.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                  {employee.first_name} {employee.last_name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{employee.position || 'Employee'}</p>
                {employee.department && (
                  <Badge variant="outline" className="text-xs mt-1 bg-blue-50 text-blue-700 border-blue-200 inline-block">
                    {employee.department}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:space-x-4 w-full sm:w-auto">
              {/* Wellness indicator */}
              <div className="text-center sm:text-right">
                <div className="flex items-center space-x-2">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{wellnessScore}/10</div>
                  <Badge className={`${wellnessStatus.textColor} bg-opacity-20 border-0 text-xs`}>
                    {wellnessStatus.label}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-1">Wellness Score</div>
                <Progress value={wellnessScore * 10} className="w-16 sm:w-20 h-1.5 sm:h-2 mt-2 bg-gray-100" />
              </div>
              
              {canViewReports && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView?.(employee)}
                  className="bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300 text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  View
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
  manager, 
  onViewTeamMember 
}) => {
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [directReports, setDirectReports] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<ManagerPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!manager) {
      setLoading(false);
      return;
    }

    const fetchManagerData = async () => {
      try {
        setLoading(true);
        
        // Get manager permissions
        const managerPermissions = getManagerPermissions(manager);
        setPermissions(managerPermissions);
        
        // Try to get real data, fallback to demo data
        try {
          const stats = await getTeamStats(manager.id);
          setTeamStats(stats);
          
          const reports = await getDirectReports(manager.id);
          setDirectReports(reports);
        } catch (error) {
          console.log('Using demo data for manager dashboard');
          // Use demo data
          setTeamStats(getDemoTeamStats());
          setDirectReports(demoUsers.filter(u => u.manager_id === 'demo-manager-1'));
        }
        
      } catch (error) {
        console.error('Error fetching manager data:', error);
        // Fallback to demo data
        setTeamStats(getDemoTeamStats());
        setDirectReports(demoUsers.filter(u => u.manager_id === 'demo-manager-1'));
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [manager]);

  // Handle case when manager is null
  if (!manager) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Manager Not Found</h3>
          <p className="text-gray-600">
            Unable to load manager dashboard. Please check your permissions.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading team dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Manager Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full sm:w-auto"
        >
          <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            >
              <Crown className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {manager.first_name}&apos;s Team Dashboard
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Manage and monitor your team&apos;s wellness and performance
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 shadow-md text-xs sm:text-sm px-2 py-1">
            {manager.role.toUpperCase()}
          </Badge>
          {manager.is_department_head && (
            <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md text-xs sm:text-sm px-2 py-1">
              <Shield className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
              Dept Head
            </Badge>
          )}
        </motion.div>
      </motion.div>

      {/* Team Stats Cards */}
      {teamStats && (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                      {teamStats.direct_reports}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">Direct Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Heart className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {teamStats.avg_team_wellness}/10
                    </div>
                    <p className="text-sm text-gray-600">Team Wellness</p>
                    <Progress value={teamStats.avg_team_wellness * 10} className="w-full h-2 mt-2 bg-gray-100" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {teamStats.high_risk_team_members}
                    </div>
                    <p className="text-sm text-gray-600">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Calendar className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {teamStats.recent_reports_count}
                    </div>
                    <p className="text-sm text-gray-600">Recent Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {permissions?.can_view_team_reports && (
                <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                  <Link href="/manager/team-reports">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300 group text-xs sm:text-sm h-8 sm:h-10">
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                      <span className="truncate">View Team Reports</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Button>
                  </Link>
                </motion.div>
              )}
              
              {permissions?.can_access_analytics && (
                <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                  <Link href="/manager/analytics">
                    <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 backdrop-blur-sm hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 transition-all duration-300 group text-xs sm:text-sm h-8 sm:h-10">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                      <span className="truncate">Team Analytics</span>
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0" />
                    </Button>
                  </Link>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}>
                <Link href="/manager/org-chart">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-white/60 backdrop-blur-sm hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-300 group text-xs sm:text-sm h-8 sm:h-10">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform" />
                    <span className="truncate">Organization Chart</span>
                    <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 ml-auto group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Direct Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-gray-900">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Direct Reports ({directReports.length})</span>
              </div>
              {permissions?.can_manage_team_members && (
                <Link href="/manager/manage-team">
                  <Button variant="outline" size="sm" className="bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300 group">
                    <ChevronRight className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                    Manage Team
                  </Button>
                </Link>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {directReports.length > 0 ? (
              <div className="space-y-4">
                {directReports.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TeamMemberCard
                      employee={employee}
                      onView={onViewTeamMember}
                      canViewReports={permissions?.can_view_team_reports || false}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Users className="h-10 w-10 text-gray-400" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Direct Reports</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  You don&apos;t have any direct reports assigned yet. Contact your administrator to set up your team structure.
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Departments */}
      {teamStats && teamStats.team_departments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Shield className="h-5 w-5 text-purple-500" />
                <span>Team Departments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {teamStats.team_departments.map((dept, index) => (
                  <motion.div
                    key={dept}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Badge variant="secondary" className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 hover:from-purple-200 hover:to-purple-300 transition-all duration-300">
                      {dept}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Permissions Summary */}
      {permissions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Your Permissions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
                <motion.div 
                  className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                    permissions.can_view_direct_reports ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium truncate">View Direct Reports</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    permissions.can_view_team_reports ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">View Team Reports</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    permissions.can_view_subordinate_teams ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">View Sub-teams</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    permissions.can_approve_leaves ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">Approve Leaves</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    permissions.can_manage_team_members ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">Manage Team</span>
                </motion.div>
                
                <motion.div 
                  className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    permissions.can_access_analytics ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span className="font-medium">Access Analytics</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
