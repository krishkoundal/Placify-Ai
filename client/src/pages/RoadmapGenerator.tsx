import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Map, CheckCircle2, ChevronRight } from 'lucide-react';
import api from '../services/api';

const RoadmapGenerator: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState('30');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const fetchRoadmap = async () => {
      setLoading(true);
      try {
        const res = await api.get('/roadmap');
        setRoadmap(res.data);
      } catch (err) {
        console.log('No roadmap found for user yet');
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    setGenerating(true);
    try {
      const res = await api.post('/roadmap/generate', { goal, durationDays: parseInt(duration) });
      setRoadmap(res.data);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await api.put('/roadmap/update', { taskId, completed: !currentStatus });
      setRoadmap(res.data.roadmap);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
          <Map className="w-8 h-8 text-indigo-400" />
          <span>Interactive Career Roadmaps</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Generate structured, goal-centric daily plans that adapt to your target placement timelines.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Generate configurations */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Configure Target</h3>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Primary Career Goal</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Crack Amazon in 90 Days" 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Roadmap Timeline</label>
              <select 
                value={duration} 
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
              >
                <option value="30">30 Day Express Roadmap</option>
                <option value="90">90 Day Core Prep</option>
                <option value="180">180 Day Thorough Architect</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={generating}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{generating ? 'Mapping skills...' : 'Generate AI Roadmap'}</span>
            </button>
          </form>
        </div>

        {/* Right Pane: Active Roadmap Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {!roadmap ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center space-y-4">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Active Roadmap Found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Configure your target goal in the left panel to map out daily milestones and earn learning XP points.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Summary Card */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">Goal: {roadmap.goal}</h3>
                    <p className="text-xs text-slate-400 mt-1">Timeline: {roadmap.durationDays} Days</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-indigo-400">{roadmap.progress}%</span>
                    <span className="text-[10px] text-slate-500 block">COMPLETED</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${roadmap.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Milestones / Week Groups */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Milestone Progress</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {roadmap.milestones?.map((mil: any, i: number) => (
                    <div 
                      key={i} 
                      className={`p-4 border rounded-xl flex items-center space-x-3 ${
                        mil.completed 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-905 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${mil.completed ? 'text-emerald-500' : 'text-slate-600'}`} />
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-500 uppercase">{mil.weekRange}</span>
                        <span className="block text-xs font-bold truncate text-slate-200 mt-0.5">{mil.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Tasks List Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Tasks Checkmarks</h4>
                <div className="space-y-3">
                  {roadmap.tasks?.map((task: any) => (
                    <div 
                      key={task._id}
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      className={`p-4 border rounded-xl flex items-center justify-between cursor-pointer transition-all ${
                        task.completed 
                          ? 'bg-slate-900/30 border-slate-800 text-slate-500 line-through' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center font-bold text-xs">
                          {task.day}
                        </div>
                        <div>
                          <span className="text-xs font-semibold block leading-relaxed">{task.title}</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{task.category}</span>
                        </div>
                      </div>

                      <button className="text-slate-500">
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-indigo-500 fill-indigo-500/10" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-slate-700 rounded-full hover:border-indigo-500 transition-colors"></div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapGenerator;
