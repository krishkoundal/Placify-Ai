import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Terminal, 
  Target, 
  ShieldCheck, 
  Cpu, 
  Map, 
  LineChart, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface LandingPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (name: string, email: string, password: string) => Promise<boolean>;
  authError: string | null;
  onClearError?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, authError, onClearError }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const openModal = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setShowAuthModal(true);
    setValidationError(null);
    if (onClearError) onClearError();
  };

  const toggleSignUpMode = (signUpMode: boolean) => {
    setIsSignUp(signUpMode);
    setValidationError(null);
    if (onClearError) onClearError();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (isSignUp && !name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!email.trim()) {
      setValidationError('Please enter your email address');
      return;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    let success = false;
    if (isSignUp) {
      success = await onRegister(name.trim(), email.trim(), password);
    } else {
      success = await onLogin(email.trim(), password);
    }
    setLoading(false);
    if (success) {
      setShowAuthModal(false);
      navigate('/dashboard');
    }
  };

  const featureCards = [
    { title: 'AI Resume Analyzer', desc: 'Checks structural keywords, formats, section titles, and predicts ATS compatibility score instantly.', icon: Sparkles },
    { title: 'GitHub Code Intelligence', desc: 'Analyzes public git repos, checks documentation quality, naming conventions, and project structures.', icon: Terminal },
    { title: 'LeetCode Tracking', desc: 'Monitors difficulty progression, contest ratings, and suggests revision plans for weak sub-topics.', icon: Target },
    { title: 'Placement Predictor', desc: 'Calculates salary expectations and provides placement probability scores for FAANG/top firms.', icon: LineChart },
    { title: 'Career Roadmaps', desc: 'Generates daily study checklists, revisions, mock interview targets, and certificates timeline.', icon: Map },
    { title: 'AI Mock Interviews', desc: 'Conducts speaking and coding interviews with voice support, adaptive difficulty, and Monaco compilers.', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navbar Header */}
      <nav className="h-20 border-b border-slate-900 px-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🎓</span>
          <h1 className="text-xl font-bold tracking-tight text-white">Placify AI</h1>
        </div>
        <button 
          onClick={() => openModal(false)}
          className="px-5 py-2 rounded-full text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md hover:scale-[1.02]"
        >
          Access Career OS
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 max-w-6xl mx-auto px-8 py-20 text-center flex flex-col items-center justify-center relative">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Next Generation AI Career Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl text-white leading-tight">
          Become Placement Ready <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 bg-clip-text text-transparent">
            with Artificial Intelligence
          </span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mt-6 leading-relaxed">
          Analyze your Resume, GitHub repositories, LeetCode ratings, and Interview skills using one unified career operating system.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => openModal(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-white text-slate-950 hover:bg-slate-100 hover:scale-[1.02] transition-all shadow-xl"
          >
            Start Free Now
          </button>
          <button 
            onClick={() => openModal(false)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 transition-all"
          >
            Watch Demo Platform
          </button>
        </div>

        {/* Company Logos Segment */}
        <div className="mt-28 w-full border-t border-slate-900 pt-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Prepare for recruitment bars at</p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-sm font-bold text-slate-600 opacity-80">
            <span>GOOGLE</span>
            <span>MICROSOFT</span>
            <span>AMAZON</span>
            <span>ATLASSIAN</span>
            <span>CRED</span>
            <span>RAZORPAY</span>
            <span>UBER</span>
            <span>FLIPKART</span>
          </div>
        </div>
      </section>

      {/* Features Grid Segment */}
      <section className="bg-slate-900/40 border-t border-slate-900 py-24">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white">Full-Stack Intelligence Features</h2>
            <p className="text-slate-400 mt-2 text-sm">Every capability talks to each other to feed your predictive Career Score.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCards.map((feat, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-2xl hover:border-indigo-500/50 hover:scale-[1.01] transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">{feat.title}</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-8 max-w-7xl mx-auto w-full text-center">
        <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Placify AI. Designed for modern engineering portfolios.</p>
      </footer>

      {/* Auth Glassmorphic Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass w-full max-w-md p-8 rounded-2xl border border-slate-800 relative glowing-primary">
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              &times;
            </button>

            <h3 className="text-xl font-bold text-white mb-2">{isSignUp ? 'Create your Placify OS' : 'Access your Career OS'}</h3>
            <p className="text-xs text-slate-400 mb-6">Enter details below to synchronize your coding stats</p>

            {(validationError || authError) && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg flex items-center space-x-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError || authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Krish Sharma" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="krish@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Security Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-lg text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{isSignUp ? 'Initialize Profile' : 'Synchronize Profile'}</span>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Log In */}
            <div className="mt-6 text-center text-xs text-slate-400 border-t border-slate-900 pt-6">
              {isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <span 
                    onClick={() => toggleSignUpMode(false)} 
                    className="text-indigo-400 hover:underline cursor-pointer font-semibold"
                  >
                    Login here
                  </span>
                </p>
              ) : (
                <p>
                  New to Placify AI?{' '}
                  <span 
                    onClick={() => toggleSignUpMode(true)} 
                    className="text-indigo-400 hover:underline cursor-pointer font-semibold"
                  >
                    Create account
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
