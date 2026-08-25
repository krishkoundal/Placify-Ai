import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';
import { 
  TrendingUp, 
  FileCheck, 
  Briefcase, 
  Flame, 
  Star,
  CheckCircle2, 
  XCircle, 
  Play, 
  ChevronRight,
  Activity
} from 'lucide-react';
import api from '../services/api';

interface AnalyticsSummary {
  careerScore: number;
  atsScore: number;
  expectedSalary: string;
  leetcodeSolved: number;
  leetcodeBreakdown: { total: number; easy: number; medium: number; hard: number };
  githubCommitsThisMonth: number;
  streak: number;
  xp: number;
  level: number;
  avatar: string;
  targetCompanies: string[];
}

const Dashboard: React.FC = () => {
  const [data, setData] = useState<{ summary: AnalyticsSummary; charts: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<any[]>([]);
  const [githubDays, setGithubDays] = useState<number>(7);
  const [leetcodeMonths, setLeetcodeMonths] = useState<number>(6);

  const getFilteredGithubActivity = () => {
    if (!data?.charts?.githubActivity) return [];
    return data.charts.githubActivity.slice(-githubDays);
  };

  const getFilteredLeetcodeGrowth = () => {
    if (!data?.charts?.leetcodeGrowth) return [];
    return data.charts.leetcodeGrowth.slice(-leetcodeMonths);
  };

  const fetchDashboardData = async () => {
    try {
      const resAnalytics = await api.get('/analytics/dashboard');
      setData(resAnalytics.data);

      const resRoadmap = await api.get('/roadmap');
      if (resRoadmap.data && resRoadmap.data.tasks) {
        setGoals(resRoadmap.data.tasks.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleGoal = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await api.put('/roadmap/update', { taskId, completed: !currentStatus });
      if (res.data.roadmap && res.data.roadmap.tasks) {
        setGoals(res.data.roadmap.tasks.slice(0, 5));
      }
      const resAnalytics = await api.get('/analytics/dashboard');
      setData(resAnalytics.data);
    } catch (err) {
      console.error('Error toggling goal task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = data?.summary;
  const charts = data?.charts;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Digital Twin Workspace</h1>
          <p className="text-slate-400 mt-1 text-sm">Your AI digital twin has parsed your profiles and updated your placement timeline.</p>
        </div>
        <NavLink 
          to="/predictor" 
          className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 text-indigo-400 transition-colors"
        >
          <Activity className="w-4 h-4" />
          <span>Simulate What-If Scenarios</span>
        </NavLink>
      </div>

      {/* Analytics Score Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Career Score */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career score</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{summary?.careerScore || 0}%</h3>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary?.careerScore || 0}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Weighted aggregate of all profiles</p>
        </div>

        {/* ATS Rating */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Score</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{summary?.atsScore || 0}%</h3>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${summary?.atsScore || 0}%` }}
              ></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Parsed from active PDF resume</p>
        </div>

        {/* Expected Salary */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Salary</span>
            <Briefcase className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{summary?.expectedSalary || 'N/A'}</h3>
            <p className="text-xs text-purple-400 font-semibold mt-1">Ready for product startups</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Calculated using current skills</p>
        </div>

        {/* Leetcode breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">DSA Solved</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500/10" />
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">{summary?.leetcodeSolved || 0}</h3>
            <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-400">
              <span className="text-emerald-400 font-bold">E: {summary?.leetcodeBreakdown?.easy || 0}</span>
              <span>•</span>
              <span className="text-amber-500 font-bold">M: {summary?.leetcodeBreakdown?.medium || 0}</span>
              <span>•</span>
              <span className="text-rose-500 font-bold">H: {summary?.leetcodeBreakdown?.hard || 0}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-3">Refreshed from coding sync profile</p>
        </div>
      </div>

      {/* Main Charts & Goals Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Graphs */}
        <div className="lg:col-span-2 space-y-8">
          {/* GitHub Commit activity graph */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">Commit Timeline Activity</h3>
              <select 
                value={githubDays}
                onChange={(e) => setGithubDays(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value={7}>Last 7 Days</option>
                <option value={15}>Last 15 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center">
              {charts?.githubActivity && charts.githubActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getFilteredGithubActivity()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }} 
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '10px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="commits" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCommits)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-xs text-slate-400">Connect GitHub profile to view contributions calendar charts.</p>
                  <NavLink to="/github-leetcode" className="inline-block text-xs font-bold text-indigo-400 hover:underline">
                    Connect GitHub &rarr;
                  </NavLink>
                </div>
              )}
            </div>
          </div>

          {/* LeetCode growth chart */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">LeetCode DSA Growth Pattern</h3>
              <select 
                value={leetcodeMonths}
                onChange={(e) => setLeetcodeMonths(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-300 outline-none cursor-pointer"
              >
                <option value={3}>Last 3 Months</option>
                <option value={6}>Last 6 Months</option>
                <option value={12}>Last 12 Months</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center">
              {charts?.leetcodeGrowth && charts.leetcodeGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getFilteredLeetcodeGrowth()} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dy={8} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} dx={-5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', borderRadius: '12px' }} 
                      labelStyle={{ color: '#64748b', fontWeight: 'bold', fontSize: '10px' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Line type="monotone" dataKey="solved" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#090d16' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-3">
                  <p className="text-xs text-slate-400">Connect LeetCode username to track dynamic DSA growth stats.</p>
                  <NavLink to="/github-leetcode" className="inline-block text-xs font-bold text-emerald-400 hover:underline">
                    Connect LeetCode &rarr;
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Goals & Quick Links */}
        <div className="space-y-8">
          {/* Today's Goals checklists */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-white">Today's AI Standup Goals</h3>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Sync Active</span>
            </div>
            <div className="space-y-4">
              {goals.map((g) => (
                <div 
                  key={g._id} 
                  onClick={() => handleToggleGoal(g._id, g.completed)}
                  className={`p-3.5 border rounded-xl flex items-start space-x-3 cursor-pointer transition-all ${
                    g.completed 
                      ? 'bg-slate-900/30 border-slate-800 text-slate-500 line-through' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <button className="mt-0.5">
                    {g.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 fill-indigo-500/10" />
                    ) : (
                      <div className="w-4 h-4 border border-slate-600 rounded-full"></div>
                    )}
                  </button>
                  <div className="flex-1">
                    <span className="text-xs font-semibold leading-relaxed">{g.title}</span>
                    <span className={`block mt-1 text-[9px] font-bold uppercase tracking-wider ${
                      g.category === 'DSA' ? 'text-amber-500' : g.category === 'Resume' ? 'text-emerald-500' : 'text-indigo-400'
                    }`}>
                      {g.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Mock Interview Promo Panel */}
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Flagship Feature</span>
            <h4 className="text-base font-bold text-white mt-1.5">Adaptive AI Mock Interview</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Test your engineering limits. Simulate rigorous company rounds with real-time feedback loop.
            </p>
            <NavLink 
              to="/interview" 
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Enter Interview Room</span>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
