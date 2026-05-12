'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useUser } from './use-user';
import ServerAddress from '@/constent/ServerAddress';
import type { DashboardStats, Employee, MentalHealthReport, Company } from '@/types/index';

export interface EmployerData {
  company: Company | null;
  employees: Employee[];
  stats: DashboardStats | null;
  recentReports: MentalHealthReport[];
  loading: boolean;
  error: string | null;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function useEmployer() {
  const { user } = useUser();
  const [data, setData] = useState<EmployerData>({
    company: null,
    employees: [],
    stats: null,
    recentReports: [],
    loading: true,
    error: null,
  });

  const loadData = useCallback(async () => {
    if (!user || user.role !== 'employer' || !user.company_id) {
      setData(prev => ({ ...prev, loading: false, error: 'Invalid employer access' }));
      return;
    }

    try {
      const headers = getAuthHeaders();
      const companyId = user.company_id;

      const [employeesRes, reportsRes] = await Promise.allSettled([
        axios.get(`${ServerAddress}/employer/employees`, { params: { company_id: companyId }, headers }),
        axios.get(`${ServerAddress}/reports`, { params: { company_id: companyId, limit: 10 }, headers }),
      ]);

      const employees: Employee[] =
        employeesRes.status === 'fulfilled'
          ? (employeesRes.value.data?.employees ?? employeesRes.value.data ?? [])
          : [];

      const recentReports: MentalHealthReport[] =
        reportsRes.status === 'fulfilled'
          ? (reportsRes.value.data?.reports ?? reportsRes.value.data ?? [])
          : [];

      setData({
        company: null,
        employees,
        stats: null,
        recentReports,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: err?.response?.data?.message || err?.message || 'Failed to load employer data',
      }));
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { ...data, refreshData: loadData };
}
