import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, FileText, Users } from 'lucide-react';
import api from '../../utils/api';

export default function ReportsPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/overview');
      setStats(response.data?.data || {});
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#181A2A]">Reports & Analytics</h1>
        <p className="text-[#737791] mt-1">Track your practice performance and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#E2F1FF] rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#007EF4]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#28B779]" />
          </div>
          <h3 className="text-2xl font-bold text-[#181A2A] mb-1">{stats.activeCases || 0}</h3>
          <p className="text-[#737791] text-sm">Active Cases</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#DCFCE7] rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-[#16D959]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#28B779]" />
          </div>
          <h3 className="text-2xl font-bold text-[#181A2A] mb-1">{stats.totalClients || 0}</h3>
          <p className="text-[#737791] text-sm">Total Clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#FFE3E1] rounded-full flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#E6372B]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#28B779]" />
          </div>
          <h3 className="text-2xl font-bold text-[#181A2A] mb-1">${(stats.monthlyRevenue || 0).toLocaleString()}</h3>
          <p className="text-[#737791] text-sm">Monthly Revenue</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-[#FFF4E0] rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-[#F5AB23]" />
            </div>
            <TrendingUp className="w-5 h-5 text-[#28B779]" />
          </div>
          <h3 className="text-2xl font-bold text-[#181A2A] mb-1">{stats.upcomingHearings || 0}</h3>
          <p className="text-[#737791] text-sm">Upcoming Hearings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Revenue Trends</h2>
          <div className="bg-[#F8F9FA] rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-[#737791] mx-auto mb-4" />
            <p className="text-[#737791]">Revenue chart coming soon</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Case Status Distribution</h2>
          <div className="bg-[#F8F9FA] rounded-lg p-8 text-center">
            <BarChart3 className="w-16 h-16 text-[#737791] mx-auto mb-4" />
            <p className="text-[#737791]">Case distribution chart coming soon</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
        <h2 className="text-lg font-semibold text-[#181A2A] mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border border-[#F8F9FA] rounded-lg">
            <h3 className="text-xl font-bold text-[#181A2A]">85%</h3>
            <p className="text-[#737791] text-sm">Case Success Rate</p>
          </div>
          <div className="text-center p-4 border border-[#F8F9FA] rounded-lg">
            <h3 className="text-xl font-bold text-[#181A2A]">42</h3>
            <p className="text-[#737791] text-sm">Avg. Hours/Case</p>
          </div>
          <div className="text-center p-4 border border-[#F8F9FA] rounded-lg">
            <h3 className="text-xl font-bold text-[#181A2A]">92%</h3>
            <p className="text-[#737791] text-sm">Client Satisfaction</p>
          </div>
        </div>
      </div>
    </div>
  );
}