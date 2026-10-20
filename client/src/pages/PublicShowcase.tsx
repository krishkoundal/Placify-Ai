import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Award, GitBranch, Code, CheckCircle, HelpCircle } from 'lucide-react';

const PublicShowcase: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const backendUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${backendUrl}/profile/public/${userId}`);
        setData(res.data);
      } catch (err: any) {
        console.error('Error loading public showcase card:', err);
        setError('Verification card not found or has been updated.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 mt-4 font-medium">Verifying Credentials Card...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full flex items-center justify-center">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Verification Failed</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">{error || 'Unable to retrieve developer credentials.'}</p>
        </div>
      </div>
    );
  }

  const capitalize = (str: string) => {
    if (!str) return 'Developer';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Shareable Card Wrapper */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 relative shadow-2xl space-y-6 overflow-hidden">
        {/* Certificate Badge */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 rounded-bl-[100px] flex items-start justify-end p-4 border-l border-b border-indigo-500/10">
          <Award className="w-6 h-6 text-indigo-400" />
        </div>

        {/* Brand Name */}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎓</span>
            <span className="text-sm font-black tracking-tight text-white">Placify AI</span>
          </div>
          <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Verified Placement Pass</p>
        </div>

        {/* Main Score & User Header */}
        <div className="flex items-center justify-between mt-2">
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">{capitalize(data.name)}</h1>
            <p className="text-xs text-slate-400">{data.college}</p>
            <p className="text-[10px] text-slate-500">{data.branch} • CGPA {data.cgpa || 'N/A'}</p>
          </div>

          <div className="text-right bg-slate-950/80 border border-slate-850 p-3.5 rounded-2xl flex flex-col items-center justify-center min-w-[5.5rem]">
            <span className="text-2xl font-black text-indigo-400">{data.careerScore}%</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1">Readiness</span>
          </div>
        </div>

        {/* Verification Checks checklist */}
        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-850 space-y-3.5">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync Integrations</h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <GitBranch className="w-4 h-4 text-slate-400" />
              <span>GitHub Status</span>
            </div>
            {data.github ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-400/10" />
                <span>Linked</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">Not connected</span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-300">
              <Code className="w-4 h-4 text-slate-400" />
              <span>LeetCode Sync</span>
            </div>
            {data.leetcode ? (
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-400/10" />
                <span>Active</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[10px]">Not connected</span>
            )}
          </div>
        </div>

        {/* Target Companies */}
        {data.targetCompanies && data.targetCompanies.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target Corporate Pipelines</h3>
            <div className="flex flex-wrap gap-1.5">
              {data.targetCompanies.map((c: string, idx: number) => (
                <span 
                  key={idx}
                  className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Certificate Verification Footer */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400 text-[9px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-400">Authentic Placify OS Credential</span>
          </div>
          <span className="text-[8px] text-slate-500 font-mono">ID: {userId?.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      <p className="text-[10px] text-slate-600 mt-6 font-medium">Verified using Placify AI Career Operating System.</p>
    </div>
  );
};

export default PublicShowcase;
