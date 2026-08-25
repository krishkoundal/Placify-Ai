import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck, Activity, Award } from 'lucide-react';
import api from '../services/api';

const PlacementPredictor: React.FC = () => {
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // What-if simulator states
  const [dsaGoal, setDsaGoal] = useState(150);
  const [atsGoal, setAtsGoal] = useState(75);
  const [projectGoal, setProjectGoal] = useState(2);
  
  // Simulated output results
  const [simulatedCareerScore, setSimulatedCareerScore] = useState<number | null>(null);
  const [simulatedSalary, setSimulatedSalary] = useState('');

  const fetchPredictions = async () => {
    try {
      const res = await api.post('/placement/predict');
      setPredictions(res.data);
      // Initialize what-if base values
      setSimulatedCareerScore(res.data.careerScore);
      setSimulatedSalary(res.data.expectedSalary);
    } catch (err) {
      console.error('Error fetching placement predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const handleSimulate = () => {
    // Simple frontend logic mimicking backend calculation logic
    let simulatedScore = Math.round(
      (atsGoal * 0.2) +
      (Math.min(dsaGoal / 300, 1) * 100 * 0.25) +
      (80 * 0.3) + // default avg interview
      (8.2 * 10) + // default cgpa
      (projectGoal * 8)
    );

    if (simulatedScore > 100) simulatedScore = 100;
    if (simulatedScore < 10) simulatedScore = 10;

    const minLPA = Math.max(3, Math.round(3 + (simulatedScore * 0.12)));
    const maxLPA = minLPA + Math.max(2, Math.round(2 + (simulatedScore * 0.08)));
    setSimulatedCareerScore(simulatedScore);
    setSimulatedSalary(`${minLPA}-${maxLPA} LPA`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const probColors: { [key: string]: string } = {
    Google: 'text-indigo-400',
    Amazon: 'text-orange-400',
    Microsoft: 'text-sky-400',
    Razorpay: 'text-blue-500',
    CRED: 'text-white',
    Vercel: 'text-slate-100'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2.5">
          <Activity className="w-8 h-8 text-indigo-400" />
          <span>AI Placement Readiness & Predictions</span>
        </h1>
        <p className="text-slate-400 mt-1 text-sm">Calculate recruiter shortlist probability and expected salary ranges based on current metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Readiness scores and Company probability rates */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Predictor score summary */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <span>Career Score & Salary Forecast</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Career readiness</span>
                <span className="text-3xl font-extrabold text-indigo-400 mt-2 block">{predictions?.careerScore}%</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Recruiter shortlists</span>
                <span className="text-3xl font-extrabold text-emerald-400 mt-2 block">{predictions?.offerProbability}</span>
              </div>
              <div className="bg-slate-950 p-5 rounded-xl border border-slate-850">
                <span className="text-[10px] text-slate-500 font-bold block uppercase">Salary Forecast</span>
                <span className="text-xl font-extrabold text-purple-400 mt-2 block">{predictions?.expectedSalary}</span>
              </div>
            </div>

            {/* AI Predictions growth list */}
            <div className="mt-8 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Forecast (Study streak maintained)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">30 Days Target</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">+{predictions?.growthForecast?.['30Days'] - predictions?.careerScore}%</span>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">60 Days Target</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">+{predictions?.growthForecast?.['60Days'] - predictions?.careerScore}%</span>
                </div>
                <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-xl">
                  <span className="text-[9px] text-slate-500 block font-bold uppercase">90 Days Target</span>
                  <span className="text-sm font-bold text-slate-200 mt-1 block">+{predictions?.growthForecast?.['90Days'] - predictions?.careerScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Readiness probabilities */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6">Target Firm Shortlist Probability</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {predictions?.companyProbabilities && Object.entries(predictions.companyProbabilities).map(([company, prob]: any) => (
                <div key={company} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
                  <span className={`text-xs font-bold ${probColors[company] || 'text-indigo-400'}`}>{company}</span>
                  <h4 className="text-2xl font-extrabold text-white mt-4">{prob}%</h4>
                  <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${prob > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${prob}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: What-if simulator widget */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>What-If Success Simulator</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Simulate changes in your coding streaks and see how it impacts your aggregate expected shortlists and expected salary.
            </p>

            <div className="space-y-4">
              {/* DSA slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Target DSA Solved</span>
                  <span className="text-white font-bold">{dsaGoal} Questions</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="500" 
                  step="10"
                  value={dsaGoal} 
                  onChange={(e) => setDsaGoal(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* ATS slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>ATS Score Target</span>
                  <span className="text-white font-bold">{atsGoal}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  step="5"
                  value={atsGoal} 
                  onChange={(e) => setAtsGoal(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Projects slider */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                  <span>Deployed Full-Stack Projects</span>
                  <span className="text-white font-bold">{projectGoal} Projects</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="1"
                  value={projectGoal} 
                  onChange={(e) => setProjectGoal(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <button 
                onClick={handleSimulate}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <span>Recalculate Impact</span>
              </button>
            </div>

            {/* Simulated output display */}
            {simulatedCareerScore !== null && (
              <div className="border-t border-slate-800/80 pt-6 space-y-4 text-center bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Simulated Score</span>
                    <span className="text-2xl font-extrabold text-indigo-400 mt-1 block">{simulatedCareerScore}%</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Simulated Salary</span>
                    <span className="text-sm font-extrabold text-purple-400 mt-2 block">{simulatedSalary}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPredictor;
