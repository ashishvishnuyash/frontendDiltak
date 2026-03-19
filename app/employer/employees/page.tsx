'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreVertical,
  Eye,
  Edit,
  Building,
  ChevronRight,
  ChevronDown,
  User,
  Crown,
  Shield,
  Loader2,
  Sparkles,
  Heart,
  Zap,
  Star,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { User as UserType, MentalHealthReport as MentalHealthReportType } from '@/types';
import { useUser } from '@/hooks/use-user';
import { db, auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'sonner';

interface EmployeeWithStats extends Omit<UserType, 'direct_reports'> {
  latest_report?: MentalHealthReportType;
  reports_count: number;
  average_wellness: number;
  last_report_date?: string;
  direct_reports?: EmployeeWithStats[];
}

interface HierarchyNode {
  employee: EmployeeWithStats;
  children: HierarchyNode[];
  level: number;
}

export default function EmployeesPage() {
  const { user, loading: userLoading } = useUser();
  const [employees, setEmployees] = useState<EmployeeWithStats[]>([]);
  const [hierarchyTree, setHierarchyTree] = useState<HierarchyNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('hierarchy');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userLoading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!['employer', 'hr', 'admin', 'manager'].includes(user.role)) {
        toast.error('Access denied. You do not have permission to view employees.');
        router.push(`/${user.role}/dashboard`);
        return;
      }

      if (user.company_id) {
        fetchEmployees();
      }
    }
  }, [user, userLoading, router]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // Fetch all company users (employees, managers, etc.)
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        where('company_id', '==', user!.company_id),
        where('role', 'in', ['employee', 'manager'])
      );

      const userSnapshot = await getDocs(usersQuery);
      const usersData: UserType[] = userSnapshot.docs.map(doc => ({
        ...doc.data() as UserType,
        id: doc.id,
      }));

      // Fetch reports for each user
      const usersWithStats: EmployeeWithStats[] = [];

      const reportPromises = usersData.map(async (employee) => {
        const reportsRef = collection(db, 'mental_health_reports');
        const reportsQuery = query(
          reportsRef,
          where('employee_id', '==', employee.id)
        );

        try {
          const reportSnapshot = await getDocs(reportsQuery);
          const reports: MentalHealthReportType[] = reportSnapshot.docs.map(doc => ({
            ...doc.data() as MentalHealthReportType,
            id: doc.id,
          }));

          const sortedReports = reports.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          const reportsCount = sortedReports.length || 0;
          const averageWellness = reportsCount > 0
            ? Math.round(sortedReports.reduce((sum, report) => sum + report.overall_wellness, 0) / reportsCount)
            : 0;

          const { direct_reports, ...employeeData } = employee;
          usersWithStats.push({
            ...employeeData,
            latest_report: sortedReports?.[0],
            reports_count: reportsCount,
            average_wellness: averageWellness,
            last_report_date: sortedReports?.[0]?.created_at,
            direct_reports: undefined, // Will be populated later in hierarchy building
          });
        } catch (error) {
          console.error(`Error fetching reports for employee ${employee.id}:`, error);
          const { direct_reports, ...employeeData } = employee;
          usersWithStats.push({
            ...employeeData,
            latest_report: undefined,
            reports_count: 0,
            average_wellness: 0,
            last_report_date: undefined,
            direct_reports: undefined, // Will be populated later in hierarchy building
          });
        }
      });

      await Promise.all(reportPromises);

      setEmployees(usersWithStats);
      buildHierarchy(usersWithStats);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEmployees();
    setRefreshing(false);
    toast.success('Team data refreshed!');
  };

  const buildHierarchy = (employees: EmployeeWithStats[]) => {
    const employeeMap = new Map<string, EmployeeWithStats>();
    employees.forEach(emp => employeeMap.set(emp.id, emp));

    // Find root employees (those without managers or whose managers aren't in the company)
    const rootEmployees: EmployeeWithStats[] = [];
    const childrenMap = new Map<string, EmployeeWithStats[]>();

    employees.forEach(employee => {
      if (employee.manager_id && employeeMap.has(employee.manager_id)) {
        // This employee has a manager in the company
        if (!childrenMap.has(employee.manager_id)) {
          childrenMap.set(employee.manager_id, []);
        }
        childrenMap.get(employee.manager_id)!.push(employee);
      } else {
        // This is a root employee (no manager or manager not in company)
        rootEmployees.push(employee);
      }
    });

    const buildTree = (employee: EmployeeWithStats, level: number = 0): HierarchyNode => {
      const children = childrenMap.get(employee.id) || [];
      return {
        employee,
        children: children.map(child => buildTree(child, level + 1)),
        level
      };
    };

    const tree = rootEmployees.map(emp => buildTree(emp));
    setHierarchyTree(tree);

    // Auto-expand first level
    const firstLevelIds = new Set(tree.map(node => node.employee.id));
    setExpandedNodes(firstLevelIds);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getRiskBadgeColor = (riskLevel?: 'low' | 'medium' | 'high') => {
    if (!riskLevel) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    const colors = {
      low: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[riskLevel];
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager': return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'hr': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const renderHierarchyNode = (node: HierarchyNode) => {
    const { employee, children, level } = node;
    const isExpanded = expandedNodes.has(employee.id);
    const hasChildren = children.length > 0;

    return (
      <motion.div
        key={employee.id}
        className="mb-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`flex items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${level > 0 ? 'ml-' + (level * 6) : ''
            }`}
          style={{ marginLeft: level * 24 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          {hasChildren && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNode(employee.id)}
                className="mr-3 p-1 h-6 w-6 bg-white/60 hover:bg-green-50"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Avatar className="h-12 w-12 mr-4 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                {getInitials(employee.first_name, employee.last_name)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                {employee.first_name} {employee.last_name}
              </h3>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {getRoleIcon(employee.role)}
              </motion.div>
              <Badge variant="outline" className="text-xs bg-white/60">
                {employee.role}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Mail className="h-3 w-3 mr-1" />
                {employee.email}
              </span>
              {employee.department && (
                <>
                  <span>•</span>
                  <span>{employee.department}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {employee.latest_report && (
              <Badge className={getRiskBadgeColor(employee.latest_report.risk_level)}>
                {employee.latest_report.risk_level} risk
              </Badge>
            )}
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {employee.average_wellness || 'N/A'}
                {employee.average_wellness && '/10'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Wellness</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button variant="ghost" size="sm" className="bg-white/60 hover:bg-green-50">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm">
                <DropdownMenuItem asChild>
                  <Link href={`/employer/employees/${employee.id}`} className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children.map(child => renderHierarchyNode(child))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const departments = Array.from(new Set(employees.map(emp => emp.department).filter(Boolean)));

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' ||
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesRisk = filterRisk === 'all' || employee.latest_report?.risk_level === filterRisk;

    return matchesSearch && matchesDepartment && matchesRisk;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
          </motion.div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading your team...</p>
        </motion.div>
      </div>
    );
  }

  if (!user || user.role !== 'employer') {
    return null;
  }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Wellness Hub</h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Employer Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button variant="outline" size="sm" className="hidden md:flex text-green-600 border-green-200 bg-green-50 text-xs sm:text-sm px-2 sm:px-3">
                Management
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button variant="outline" size="sm" className="p-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <ThemeToggle size="sm" />
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-200 px-2 sm:px-3"
                onClick={async () => {
                  try {
                    await signOut(auth);
                    router.push('/auth/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/auth/login');
                  }
                }}
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2 sm:mb-3 lg:mb-4 leading-tight">Team Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage your team members and monitor their wellness status with organizational hierarchy.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex space-x-4 sm:space-x-6 md:space-x-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <Link href="/employer/dashboard">
              <button className="pb-3 sm:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-sm sm:text-base whitespace-nowrap">
                Overview
              </button>
            </Link>
            <button className="pb-3 sm:pb-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base whitespace-nowrap">
              Employees
            </button>
            <Link href="/employer/reports">
              <button className="pb-3 sm:pb-4 px-1 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors text-sm sm:text-base whitespace-nowrap">
                Reports
              </button>
            </Link>
          </div>
        </div>
        <motion.div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0" variants={itemVariants}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-lg">
              <Button
                variant={viewMode === 'hierarchy' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('hierarchy')}
                className={viewMode === 'hierarchy' ? 'bg-green-600 hover:bg-green-700 text-xs sm:text-sm' : 'hover:bg-green-50 text-xs sm:text-sm'}
              >
                <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Hierarchy</span>
                <span className="sm:hidden">Tree</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-green-600 hover:bg-green-700 text-xs sm:text-sm' : 'hover:bg-green-50 text-xs sm:text-sm'}
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                List
              </Button>
            </div>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="bg-white/60 backdrop-blur-sm hover:bg-green-50 text-xs sm:text-sm px-3 py-2"
            >
              {refreshing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                </motion.div>
              ) : (
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/employer/employees/new">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg text-xs sm:text-sm px-3 py-2">
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Employee</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="mb-2 sm:mb-0"
                  >
                    <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600 dark:text-blue-400 mx-auto sm:mx-0" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{employees.length}</div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Team Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="mb-2 sm:mb-0"
                  >
                    <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-green-600 mx-auto sm:mx-0" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {employees.filter(emp => emp.latest_report?.risk_level === 'low').length}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Low Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="mb-2 sm:mb-0"
                  >
                    <Clock className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-yellow-600 mx-auto sm:mx-0" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {employees.filter(emp => emp.latest_report?.risk_level === 'medium').length}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">Medium Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -5 }}>
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex flex-col sm:flex-row items-center sm:space-x-3 text-center sm:text-left">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className="mb-2 sm:mb-0"
                  >
                    <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-red-600 mx-auto sm:mx-0" />
                  </motion.div>
                  <div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {employees.filter(emp => emp.latest_report?.risk_level === 'high').length}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">High Risk</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                    <Input
                      placeholder="Search team members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 sm:pl-10 bg-white/60 backdrop-blur-sm border-white/20 focus:border-green-400 focus:ring-green-400 text-sm"
                    />
                  </div>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterRisk} onValueChange={setFilterRisk}>
                    <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                      <SelectValue placeholder="Filter by risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <span>{filteredEmployees.length} of {employees.length} members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {viewMode === 'hierarchy' ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Building className="h-6 w-6 mr-3 text-green-600" />
                    </motion.div>
                    Organizational Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hierarchyTree.length > 0 ? (
                    <div className="space-y-2">
                      {hierarchyTree.map(node => renderHierarchyNode(node))}
                    </div>
                  ) : (
                    <motion.div
                      className="text-center py-12"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <motion.div
                        animate={floatingAnimation}
                        className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      >
                        <Building className="h-8 w-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Hierarchy Data</h3>
                      <p className="text-gray-600 dark:text-gray-400">Add employees and set up manager relationships to see the organizational structure.</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            /* List View */
            filteredEmployees.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
                variants={containerVariants}
              >
                {filteredEmployees.map((employee, index) => (
                  <motion.div
                    key={employee.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -5 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Avatar className="h-14 w-14 shadow-lg">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                                  {getInitials(employee.first_name, employee.last_name)}
                                </AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                  {employee.first_name} {employee.last_name}
                                </h3>
                                <motion.div
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  {getRoleIcon(employee.role)}
                                </motion.div>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2 sm:mb-3">
                                <Mail className="h-4 w-4" />
                                <span>{employee.email}</span>
                              </div>
                              {employee.department && (
                                <p className="text-sm text-gray-600">{employee.department}</p>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button variant="ghost" size="sm" className="bg-white/60 hover:bg-green-50">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-sm">
                              <DropdownMenuItem asChild>
                                <Link href={`/employer/employees/${employee.id}`} className="flex items-center">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Wellness Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <motion.div
                            className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="text-xl font-bold text-blue-700">
                              {employee.average_wellness || 'N/A'}
                              {employee.average_wellness && '/10'}
                            </div>
                            <div className="text-xs text-blue-600">Avg Wellness</div>
                          </motion.div>
                          <motion.div
                            className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl"
                            whileHover={{ scale: 1.05 }}
                          >
                            <div className="text-xl font-bold text-purple-700">
                              {employee.reports_count}
                            </div>
                            <div className="text-xs text-purple-600">Total Reports</div>
                          </motion.div>
                        </div>

                        {/* Risk Level and Last Report */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Risk Level:</span>
                            {employee.latest_report ? (
                              <Badge className={getRiskBadgeColor(employee.latest_report.risk_level)}>
                                {employee.latest_report.risk_level} risk
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-700">No Data</Badge>
                            )}
                          </div>

                          {employee.last_report_date && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(employee.last_report_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Latest Metrics */}
                        {employee.latest_report && (
                          <motion.div
                            className="pt-4 border-t border-gray-200"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div className="text-center p-2 bg-green-50 rounded-lg">
                                <div className="font-semibold text-green-700">
                                  {employee.latest_report.mood_rating}/10
                                </div>
                                <div className="text-green-600">Mood</div>
                              </div>
                              <div className="text-center p-2 bg-red-50 rounded-lg">
                                <div className="font-semibold text-red-700">
                                  {employee.latest_report.stress_level}/10
                                </div>
                                <div className="text-red-600">Stress</div>
                              </div>
                              <div className="text-center p-2 bg-yellow-50 rounded-lg">
                                <div className="font-semibold text-yellow-700">
                                  {employee.latest_report.energy_level}/10
                                </div>
                                <div className="text-yellow-600">Energy</div>
                              </div>
                              <div className="text-center p-2 bg-purple-50 rounded-lg">
                                <div className="font-semibold text-purple-700">
                                  {employee.latest_report.work_satisfaction}/10
                                </div>
                                <div className="text-purple-600">Work Sat.</div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <Card className="bg-white border border-gray-200 shadow-sm">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      animate={floatingAnimation}
                      className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    >
                      <Users className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Team Members Found</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      {searchTerm || filterDepartment !== 'all' || filterRisk !== 'all'
                        ? 'No team members match your current filters. Try adjusting your search criteria.'
                        : 'You haven\'t added any team members yet. Start building your team!'
                      }
                    </p>
                    {!searchTerm && filterDepartment === 'all' && filterRisk === 'all' && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Link href="/employer/employees/new">
                          <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Your First Team Member
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </div >
  );
}
