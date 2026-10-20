import React, { useState, useEffect } from 'react';
import { GitBranch, Code2, Check, RefreshCw, BarChart2, Folder, Star, ExternalLink } from 'lucide-react';
import api from '../services/api';

const GithubLeetcode: React.FC = () => {
  const [gitUser, setGitUser] = useState('');
  const [leetcodeUser, setLeetcodeUser] = useState('');
  
  const [syncingGit, setSyncingGit] = useState(false);
  const [syncingLC, setSyncingLC] = useState(false);
  
  const [gitProfile, setGitProfile] = useState<any>(null);
  const [lcProfile, setLcProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const resGit = await api.get('/github/profile');
        setGitProfile(resGit.data);
      } catch (err) {
        console.log('GitHub not synced yet');
      }

      try {
        const resLC = await api.get('/leetcode/profile');
        setLcProfile(resLC.data);
      } catch (err) {
        console.log('LeetCode not synced yet');
      }
    };
    fetchProfiles();
  }, []);

  const handleSyncGit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUser) return;
    setSyncingGit(true);
    try {
      const res = await api.post('/github/connect', { username: gitUser });
      setGitProfile(res.data.github);
    } catch (err) {
      console.error('Error syncing GitHub:', err);
    } finally {
      setSyncingGit(false);
    }
  };

  const handleSyncLC = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUser) return;
    setSyncingLC(true);
    try {
      const res = await api.post('/leetcode/connect', { username: leetcodeUser });
      setLcProfile(res.data.leetcode);
    } catch (err) {
      console.error('Error syncing LeetCode:', err);
    } finally {
      setSyncingLC(false);
    }
  };

  const handleDisconnectGit = async () => {
    try {
      await api.post('/github/disconnect');
      setGitProfile(null);
      setGitUser('');
    } catch (err) {
      console.error('Error disconnecting GitHub:', err);
    }
  };

  const handleDisconnectLC = async () => {
    try {
      await api.post('/leetcode/disconnect');
      setLcProfile(null);
      setLeetcodeUser('');
    } catch (err) {
      console.error('Error disconnecting LeetCode:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Coding Profiles Integrations</h1>
        <p className="text-slate-400 mt-1 text-sm">Sync your contributions calendars and DSA counts to feed AI predictions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card: Github connect */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <span>GitHub Sync Engine</span>
          </h3>

          {!gitProfile ? (
            <form onSubmit={handleSyncGit} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your profile link to parse repositories count, popular language distributions, and commit frequency.
              </p>
              <input 
                type="text" 
                required
                placeholder="Enter GitHub Link or Username (e.g. https://github.com/octocat)" 
                value={gitUser}
                onChange={(e) => setGitUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
              />
              <button 
                type="submit"
                disabled={syncingGit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {syncingGit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Synchronize Repositories</span>}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 bg-slate-950 p-4 border border-slate-800 rounded-xl">
                {gitProfile.avatarUrl ? (
                  <img src={gitProfile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-slate-700 object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm">
                    {gitProfile.username.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">@{gitProfile.username}</h4>
                  {gitProfile.bio && <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{gitProfile.bio}</p>}
                  <button 
                    onClick={handleDisconnectGit}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold hover:underline mt-1.5 outline-none block text-left"
                  >
                    Disconnect Profile
                  </button>
                </div>
                <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4" />
                </div>
              </div>

              {/* Stats values */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Repositories</span>
                  <span className="text-base font-bold text-white mt-1 block">{gitProfile.repositoriesCount}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Stars</span>
                  <span className="text-base font-bold text-white mt-1 block">{gitProfile.starsCount} ⭐</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Followers</span>
                  <span className="text-base font-bold text-white mt-1 block">{gitProfile.followersCount}</span>
                </div>
              </div>

              {/* Top Repositories list */}
              {gitProfile.topRepos && gitProfile.topRepos.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Top Repositories</span>
                  <div className="space-y-2">
                    {gitProfile.topRepos.map((repo: any) => (
                      <a 
                        key={repo.name} 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between bg-slate-950 hover:bg-slate-950/70 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center space-x-2">
                          <Folder className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span className="text-xs text-slate-200 font-medium group-hover:text-indigo-400 transition-colors">{repo.name}</span>
                        </div>
                        <div className="flex items-center space-x-2.5 text-[10px] text-slate-400">
                          <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{repo.language}</span>
                          <span className="flex items-center"><Star className="w-3 h-3 text-amber-400 mr-0.5 fill-amber-400/20" /> {repo.stars}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Language lists */}
              <div className="space-y-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Top Languages</span>
                <div className="space-y-2">
                  {gitProfile.topLanguages?.map((l: any, i: number) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">{l.language}</span>
                      <span className="text-slate-500">{l.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Leetcode connect */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <span>LeetCode Stats Sync</span>
          </h3>

          {!lcProfile ? (
            <form onSubmit={handleSyncLC} className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your profile link to pull rankings, contest score, and solved statistics dynamically.
              </p>
              <input 
                type="text" 
                required
                placeholder="Enter LeetCode Link or Username (e.g. https://leetcode.com/u/leetcode_coder/)" 
                value={leetcodeUser}
                onChange={(e) => setLeetcodeUser(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
              />
              <button 
                type="submit"
                disabled={syncingLC}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {syncingLC ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Synchronize Coding Stats</span>}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-white">@{lcProfile.username}</h4>
                  <button 
                    onClick={handleDisconnectLC}
                    className="text-[10px] text-rose-450 hover:text-rose-350 font-semibold hover:underline mt-0.5 outline-none block text-left"
                  >
                    Disconnect Profile
                  </button>
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              </div>

              {/* Stats values */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Solved</span>
                  <span className="text-base font-bold text-white mt-1 block">{lcProfile.solved?.total}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-center col-span-2">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Global Ranking</span>
                  <span className="text-sm font-bold text-white mt-1 block truncate">#{lcProfile.ranking?.toLocaleString() || 'N/A'}</span>
                </div>
              </div>

              {/* Solved details with progress bars */}
              <div className="space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Difficulty Breakdown</span>
                <div className="space-y-3 text-xs">
                  {/* Easy */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-emerald-400 font-medium">Easy</span>
                      <span className="text-slate-300 font-bold">{lcProfile.solved?.easy}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${lcProfile.solved?.total > 0 ? (lcProfile.solved.easy / lcProfile.solved.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Medium */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-amber-500 font-medium">Medium</span>
                      <span className="text-slate-300 font-bold">{lcProfile.solved?.medium}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${lcProfile.solved?.total > 0 ? (lcProfile.solved.medium / lcProfile.solved.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Hard */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-rose-500 font-medium">Hard</span>
                      <span className="text-slate-300 font-bold">{lcProfile.solved?.hard}</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className="bg-rose-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${lcProfile.solved?.total > 0 ? (lcProfile.solved.hard / lcProfile.solved.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Coding profile audit panel */}
      {(gitProfile || lcProfile) && (
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2.5">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>AI Code Profile Rating Audit</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score circle */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">Placify AI Rating</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="56" 
                    cy="56" 
                    r="48" 
                    stroke="#6366f1" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * (
                      Math.round(
                        (lcProfile ? Math.min(100, (lcProfile.solved?.total / 400) * 100) * 0.6 : 0) +
                        (gitProfile ? Math.min(100, (gitProfile.repositoriesCount * 8 + gitProfile.starsCount * 12)) * 0.4 : 0)
                      ) || 35
                    )) / 100}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-2xl font-black text-white">
                  {Math.round(
                    (lcProfile ? Math.min(100, (lcProfile.solved?.total / 400) * 100) * 0.6 : 0) +
                    (gitProfile ? Math.min(100, (gitProfile.repositoriesCount * 8 + gitProfile.starsCount * 12)) * 0.4 : 0)
                  ) || 35}%
                </div>
              </div>
              <span className="text-[10px] text-indigo-400 font-bold mt-3 block">
                {(() => {
                  const rating = Math.round(
                    (lcProfile ? Math.min(100, (lcProfile.solved?.total / 400) * 100) * 0.6 : 0) +
                    (gitProfile ? Math.min(100, (gitProfile.repositoriesCount * 8 + gitProfile.starsCount * 12)) * 0.4 : 0)
                  ) || 35;
                  if (rating > 75) return '⭐ Tier-1 Candidate';
                  if (rating > 50) return '⚡ Intermediate Ready';
                  return '🌱 Needs Foundations Dev';
                })()}
              </span>
            </div>

            {/* Rating criteria breakdown */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 md:col-span-2 space-y-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">AI Evaluation Insights</span>
              <div className="space-y-3.5 text-xs">
                {/* LeetCode feedback */}
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${lcProfile && lcProfile.solved?.total > 150 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <p className="text-slate-300 leading-relaxed">
                    {lcProfile 
                      ? `LeetCode stats show ${lcProfile.solved?.total} solved problems (${lcProfile.solved?.medium || 0} medium, ${lcProfile.solved?.hard || 0} hard) with a global ranking of #${lcProfile.ranking?.toLocaleString() || 'N/A'}. ${lcProfile.solved?.total > 200 ? 'Strong algorithmic focus detected.' : 'We recommend targeting 60+ Medium level problems to pass corporate coding rounds.'}`
                      : 'Leetcode metrics are missing. Please sync your LeetCode profile link to verify your problem solving capabilities.'
                    }
                  </p>
                </div>

                {/* GitHub feedback */}
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${gitProfile && gitProfile.repositoriesCount > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                  <p className="text-slate-300 leading-relaxed">
                    {gitProfile 
                      ? `GitHub profile active with ${gitProfile.repositoriesCount} repositories. Star value is at ${gitProfile.starsCount || 0} stars. ${gitProfile.repositoriesCount > 8 ? 'Good repository velocity.' : 'Create and publish 2-3 detailed project source codes to showcase development frameworks competence.'}`
                      : 'GitHub profile details missing. Connect your link to evaluate repository activity and top languages.'
                    }
                  </p>
                </div>

                {/* AI Tip */}
                <div className="bg-indigo-950/20 border border-indigo-950/60 p-3.5 rounded-lg text-indigo-400">
                  <span className="font-bold block mb-1 uppercase tracking-wider text-[9px]">AI Growth Suggestion:</span>
                  <span className="text-[11px] leading-relaxed">
                    {(() => {
                      const totalSolved = lcProfile?.solved?.total || 0;
                      const repoCount = gitProfile?.repositoriesCount || 0;
                      if (totalSolved < 150) return 'Focus on solving daily coding challenges. Consistency increases career score by 15%';
                      if (repoCount < 5) return 'Dockerize one of your top repositories and write a professional README.md file.';
                      return 'Excellent candidate standing. Proceed to Career Mentor to practice mock interviews.';
                    })()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubLeetcode;
