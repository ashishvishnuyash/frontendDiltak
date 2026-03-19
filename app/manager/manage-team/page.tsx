'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/shared/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Edit,
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  ArrowLeft,
  UserPlus,
  Settings,
  MoreVertical
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { getDirectReports } from '@/lib/hierarchy-service';
import { getDemoUser, demoUsers } from '@/lib/demo-data';
import type { User } from '@/types/index';
import { motion } from 'framer-motion';

export default function ManageTeamPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchTeamMembers();
  }, [user, userLoading]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      
      const currentUser = user || getDemoUser('manager');
      
      try {
        // Try to get real data
        const directReports = await getDirectReports(currentUser.id);
        setTeamMembers(directReports);
      } catch (error) {
        console.log('Using demo data for team management');
        // Use demo data
        const demoTeamMembers = demoUsers.filter(u => u.manager_id === 'demo-manager-1');
        setTeamMembers(demoTeamMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = [...new Set(teamMembers.map(member => member.department).filter((dept): dept is string => Boolean(dept)))];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchTerm === '' || 
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && member.is_active) ||
      (filterStatus === 'inactive' && !member.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleViewMember = (memberId: string) => {
    router.push(`/manager/team-member/${memberId}`);
  };

  const handleEditMember = (memberId: string) => {
    router.push(`/manager/edit-member/${memberId}`);
  };

  const currentUser = user || getDemoUser('manager');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-gray-950 dark:via-slate-900 dark:to-teal-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading team...</p>
        </motion.div>
      </div>
    );
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

      <Navbar user={currentUser} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="w-full sm:w-auto">
            <Link href="/manager/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </Link>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">Manage Team</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
              Manage your direct reports and team member information.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Request New Member</span>
              <span className="sm:hidden">Request Member</span>
            </Button>
            <Button className="w-full sm:w-auto text-sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Team Member</span>
              <span className="sm:hidden">Add Member</span>
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Members</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Building className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{departments.length}</div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 dark:text-purple-400" />
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {teamMembers.filter(m => m.is_active).length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 dark:text-orange-400" />
                <div className="min-w-0">
                  <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {teamMembers.filter(m => m.hierarchy_level === 4).length}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
              
              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="text-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center sm:justify-start">
                <span>{filteredMembers.length} of {teamMembers.length} members</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members List */}
        {filteredMembers.length > 0 ? (
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          {member.first_name?.[0]}{member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {member.first_name} {member.last_name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={member.is_active ? "default" : "secondary"} className="text-xs">
                              {member.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {member.hierarchy_level !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                Level {member.hierarchy_level}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 mt-2 space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <Building className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{member.position || 'Employee'}</span>
                          </span>
                          
                          {member.department && (
                            <span className="flex items-center space-x-1">
                              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{member.department}</span>
                            </span>
                          )}
                          
                          {member.email && (
                            <span className="flex items-center space-x-1">
                              <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </span>
                          )}
                          
                          {member.phone && (
                            <span className="flex items-center space-x-1">
                              <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span className="truncate">{member.phone}</span>
                            </span>
                          )}
                        </div>

                        {member.hire_date && (
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Joined: {new Date(member.hire_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 lg:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMember(member.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditMember(member.id)}
                        className="text-xs sm:text-sm"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Permissions:</span>
                        <div className="mt-1 space-y-1">
                          {member.can_view_team_reports && (
                            <Badge variant="outline" className="text-xs mr-1 mb-1">View Reports</Badge>
                          )}
                          {member.can_manage_employees && (
                            <Badge variant="outline" className="text-xs mr-1 mb-1">Manage Team</Badge>
                          )}
                          {member.can_approve_leaves && (
                            <Badge variant="outline" className="text-xs mr-1 mb-1">Approve Leaves</Badge>
                          )}
                          {member.is_department_head && (
                            <Badge variant="outline" className="text-xs mr-1 mb-1">Dept Head</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Reporting:</span>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          {member.direct_reports && member.direct_reports.length > 0 ? (
                            <span>{member.direct_reports.length} direct reports</span>
                          ) : (
                            <span>No direct reports</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Last Activity:</span>
                        <div className="mt-1 text-gray-600 dark:text-gray-400">
                          {member.last_login ? (
                            new Date(member.last_login).toLocaleDateString()
                          ) : (
                            'Never logged in'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 sm:p-12 text-center">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Team Members Found</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all'
                  ? 'No team members match your current filters. Try adjusting your search criteria.'
                  : 'You don\'t have any team members assigned yet.'
                }
              </p>
              <Button className="text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <Button variant="outline" className="justify-start text-sm h-auto py-3">
                <UserPlus className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Request New Team Member</span>
              </Button>
              
              <Button variant="outline" className="justify-start text-sm h-auto py-3">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Send Team Update</span>
              </Button>
              
              <Button variant="outline" className="justify-start text-sm h-auto py-3">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Schedule Team Meeting</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
