'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/hooks/use-user';
import { OrgChart } from '@/components/hierarchy/org-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Users,
  Building,
  Crown,
  Shield,
  RefreshCw,
  Download,
  Settings,
  Loader2,
  Brain,
  TrendingUp,
  BarChart3,
  Eye,
  ArrowRight,
  FileText
} from 'lucide-react';
import { getTeamHierarchy, getManagerPermissions } from '@/lib/hierarchy-service';
import { db, auth } from '@/lib/firebase';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'firebase/auth';
import type { User, HierarchyNode } from '@/types/index';
import { toast } from 'sonner';

export default function OrgChartPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWellnessIndicators, setShowWellnessIndicators] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    // For demo mode, allow access without strict authentication
    if (!userLoading) {
      if (!user) {
        // Create demo user for org chart access
        const demoUser = {
          id: 'demo-manager-1',
          role: 'manager' as const,
          company_id: 'demo-company',
          hierarchy_level: 3,
          can_view_team_reports: true
        };
      }
      fetchOrgChart();
    }
  }, [user, userLoading, router]);

  const fetchOrgChart = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // For managers, show their team hierarchy
      // For HR/Admin, show company-wide hierarchy (would need additional logic)
      const teamHierarchy = await getTeamHierarchy(user.id, 4);
      setHierarchy(teamHierarchy);

    } catch (error) {
      console.error('Error fetching org chart:', error);
      toast.error('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setSelectedUser(selectedUser);
    // Could open a modal or navigate to user profile
    toast.info(`Selected: ${selectedUser.first_name} ${selectedUser.last_name}`);
  };

  const exportOrgChart = () => {
    // Implementation for exporting org chart
    toast.info('Exporting organization chart...');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/auth/login');
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Loader2 className="h-16 w-16 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading organization chart...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const permissions = getManagerPermissions(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 text-gray-900 dark:text-gray-100 transition-colors duration-500 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 dark:bg-emerald-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-blue-300/20 dark:bg-blue-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-teal-600/10 rounded-full blur-3xl"
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <div className="border-b border-white/20 dark:border-gray-800/50 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14 lg:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => router.push('/auth/login')}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-green-600 transition-colors truncate">Wellness Hub</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">Manager Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden lg:flex text-green-600 border-green-200 bg-green-50 text-xs px-2 sm:px-3">
                Management
              </Button>
              <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-1.5 sm:p-2">
                <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 px-1.5 sm:px-2 lg:px-3"
                onClick={handleLogout}
              >
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1 lg:mr-2" />
                <span className="hidden sm:inline text-xs sm:text-sm">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-3 md:px-4 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-3 lg:mb-4 tracking-tight leading-tight">
              Organization Chart
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 font-light leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl">
              View your team structure and reporting relationships.
            </p>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <div className="flex space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide">
            <Link href="/manager/dashboard">
              <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                Dashboard
              </button>
            </Link>
            <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
              Org Chart
            </button>
            <Link href="/manager/team-reports">
              <button className="pb-2 sm:pb-3 lg:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-xs sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0">
                Team Reports
              </button>
            </Link>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div></div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={fetchOrgChart}
                className="border-green-200 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={exportOrgChart}
                className="border-green-200 text-green-600 hover:bg-green-50 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mb-4 sm:mb-6 lg:mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 dark:text-blue-400" />
                <span>View Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="wellness-indicators"
                    checked={showWellnessIndicators}
                    onCheckedChange={setShowWellnessIndicators}
                  />
                  <label htmlFor="wellness-indicators" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Wellness Indicators
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="compact-view"
                    checked={compactView}
                    onCheckedChange={setCompactView}
                  />
                  <label htmlFor="compact-view" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    Compact View
                  </label>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                  <motion.div
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="font-medium">Executive</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">HR</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-green-50 dark:bg-green-900/20"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                    <span className="font-medium">Manager</span>
                  </motion.div>
                  <motion.div
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Building className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 dark:text-gray-400" />
                    <span className="font-medium">Employee</span>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {hierarchy.reduce((total, node) => {
                        const countNodes = (n: HierarchyNode): number => {
                          return 1 + n.children.reduce((sum, child) => sum + countNodes(child), 0);
                        };
                        return total + countNodes(node);
                      }, 0)}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Crown className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {hierarchy.filter(node =>
                        node.user.role === 'manager' || node.user.role === 'admin'
                      ).length}
                    </div>
                    <p className="text-sm text-gray-600">Managers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Building className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {[...new Set(hierarchy.map(node => node.user.department).filter((dept): dept is string => Boolean(dept)))].length}
                    </div>
                    <p className="text-sm text-gray-600">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Shield className="h-6 w-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {Math.max(...hierarchy.map(node => {
                        const getDepth = (n: HierarchyNode): number => {
                          return n.children.length > 0
                            ? 1 + Math.max(...n.children.map(getDepth))
                            : 1;
                        };
                        return getDepth(node);
                      }), 0)}
                    </div>
                    <p className="text-sm text-gray-600">Hierarchy Levels</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Organization Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <OrgChart
                hierarchy={hierarchy}
                onUserSelect={handleUserSelect}
                showWellnessIndicators={showWellnessIndicators}
                compactView={compactView}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Selected User Info */}
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-8"
          >
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-900">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <span>Selected Team Member</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-white font-bold text-lg">
                      {selectedUser.first_name?.[0]}{selectedUser.last_name?.[0]}
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.position}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {selectedUser.role}
                      </Badge>
                      {selectedUser.department && (
                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                          {selectedUser.department}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {permissions.can_view_team_reports && (
                      <Button
                        variant="outline"
                        onClick={() => router.push(`/manager/team-member/${selectedUser.id}`)}
                        className="bg-white/60 backdrop-blur-sm hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Reports
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setSelectedUser(null)}
                      className="bg-white/60 backdrop-blur-sm hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Access Level Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Your Access Level</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 text-sm">
                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                    <Brain className="h-4 w-4 mr-2 text-blue-500" />
                    Permissions
                  </h4>
                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">View direct reports</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${permissions.can_view_direct_reports ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {permissions.can_view_direct_reports ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">View team reports</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${permissions.can_view_team_reports ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {permissions.can_view_team_reports ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">View subordinate teams</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${permissions.can_view_subordinate_teams ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {permissions.can_view_subordinate_teams ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Access analytics</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${permissions.can_access_analytics ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                        }`}>
                        {permissions.can_access_analytics ? '✓' : '✗'}
                      </div>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-purple-500" />
                    Hierarchy Info
                  </h4>
                  <div className="space-y-3">
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Your level</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs whitespace-nowrap">
                        {user.hierarchy_level || 'Not set'}
                      </Badge>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Access depth</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs whitespace-nowrap">
                        {permissions.hierarchy_access_level} levels
                      </Badge>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Department head</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${user.is_department_head ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {user.is_department_head ? '✓' : '✗'}
                      </div>
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">Skip-level access</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${user.skip_level_access ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {user.skip_level_access ? '✓' : '✗'}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
