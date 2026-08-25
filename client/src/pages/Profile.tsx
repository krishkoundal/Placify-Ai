import React, { useState, useEffect } from 'react';
import { Sparkles, Save, UserCheck, Star, Link2 } from 'lucide-react';
import api from '../services/api';

const UNIVERSITIES = [
  "Indian Institute of Technology, Bombay (IITB)",
  "Indian Institute of Technology, Delhi (IITD)",
  "Indian Institute of Technology, Madras (IITM)",
  "Indian Institute of Technology, Kharagpur (IITKGP)",
  "Indian Institute of Technology, Kanpur (IITK)",
  "Indian Institute of Technology, Roorkee (IITR)",
  "Indian Institute of Technology, Guwahati (IITG)",
  "Indian Institute of Technology, Hyderabad (IITH)",
  "BITS Pilani",
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "Indraprastha Institute of Information Technology Delhi (IIITD)",
  "National Institute of Technology, Trichy (NITT)",
  "National Institute of Technology, Surathkal (NITK)",
  "National Institute of Technology, Rourkela (NITR)",
  "Vellore Institute of Technology (VIT)",
  "Manipal Academy of Higher Education (MAHE)",
  "Thapar Institute of Engineering and Technology",
  "Amity University",
  "SRM Institute of Science and Technology",
  "University of Delhi (DU)",
  "Jawaharlal Nehru University (JNU)",
  "Massachusetts Institute of Technology (MIT)",
  "Stanford University",
  "Harvard University",
  "California Institute of Technology (Caltech)",
  "Carnegie Mellon University (CMU)",
  "University of California, Berkeley (UC Berkeley)",
  "University of Oxford",
  "University of Cambridge",
  "Chandigarh University",
  "Chitkara University",
  "Christ University, Bengaluru",
  "Lovely Professional University (LPU)",
  "Sharda University",
  "Galgotias University",
  "Bennett University",
  "KIIT University, Bhubaneswar",
  "Shiv Nadar University",
  "Ashoka University",
  "Symbiosis International University, Pune",
  "NMIMS University, Mumbai",
  "OP Jindal Global University",
  "K.L. University",
  "PES University, Bengaluru",
  "RV College of Engineering (RVCE), Bengaluru",
  "BMS College of Engineering, Bengaluru",
  "M.S. Ramaiah Institute of Technology (MSRIT)",
  "Jaypee Institute of Information Technology (JIIT)",
  "Nirma University, Ahmedabad",
  "DA-IICT, Gandhinagar",
  "Pandit Deendayal Energy University (PDEU)",
  "UPES, Dehradun",
  "Graphic Era University, Dehradun",
  "PEC (Punjab Engineering College), Chandigarh",
  "Guru Gobind Singh Indraprastha University (GGSIPU)",
  "Maharaja Agrasen Institute of Technology (MAIT)",
  "Bharati Vidyapeeth's College of Engineering (BVCOE)"
];


const BRANCHES = [
  "Computer Science Engineering",
  "Information Technology",
  "Software Engineering",
  "Electronics and Communication Engineering",
  "Electrical Engineering",
  "Artificial Intelligence and Machine Learning",
  "Data Science and Analytics",
  "Cyber Security",
  "Mechanical Engineering",
  "Electrical and Electronics Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Aerospace Engineering",
  "Mathematics and Computing"
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Razorpay",
  "CRED",
  "Vercel",
  "Zomato",
  "Swiggy",
  "Uber",
  "Adobe",
  "Goldman Sachs",
  "JPMorgan Chase",
  "Flipkart",
  "Ola",
  "Paytm",
  "Stripe",
  "Airbnb",
  "Salesforce",
  "Atlassian",
  "Nvidia",
  "TCS",
  "Infosys",
  "Wipro",
  "Cognizant"
];

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Local Form Inputs
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');
  const [cgpa, setCgpa] = useState(0);
  const [leetcodeUser, setLeetcodeUser] = useState('');
  const [githubUser, setGithubUser] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [companyInput, setCompanyInput] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        setProfile(res.data);
        // Bind form hooks
        setName(res.data.user?.name || '');
        setCollege(res.data.user?.college || '');
        setBranch(res.data.user?.branch || '');
        setCgpa(res.data.user?.cgpa || 0);
        setLeetcodeUser(res.data.profiles?.leetcode || '');
        setGithubUser(res.data.socialLinks?.github || '');
        setSelectedCompanies(res.data.targetCompanies || []);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  const handleAddCompany = () => {
    const trimmed = companyInput.trim();
    if (trimmed && !selectedCompanies.includes(trimmed)) {
      setSelectedCompanies([...selectedCompanies, trimmed]);
    }
    setCompanyInput('');
  };

  const handleRemoveCompany = (company: string) => {
    setSelectedCompanies(selectedCompanies.filter(c => c !== company));
  };

  const handleKeyDownCompany = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCompany();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        college,
        branch,
        cgpa,
        profiles: { leetcode: leetcodeUser },
        socialLinks: { github: githubUser },
        targetCompanies: selectedCompanies
      };
      const res = await api.put('/profile', payload);
      setProfile(res.data);
      setMessage('Profile credentials successfully updated.');
    } catch (err) {
      console.error('Error saving profile:', err);
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const leetcodeConnected = !!leetcodeUser;
  const githubConnected = !!githubUser;
  const targetCompaniesCount = selectedCompanies.length;

  const getAiInsights = () => {
    const insights = [];
    
    if (leetcodeConnected) {
      insights.push({
        title: 'LeetCode Analytics Active',
        desc: `Dynamic problem sync enabled for user '${leetcodeUser}'. Tracking queue, stack, tree consistency metrics.`,
        type: 'positive'
      });
    } else {
      insights.push({
        title: 'DSA Analysis Pending',
        desc: 'Connect your LeetCode username to verify algorithms frequency and unlock DSA level growth insights.',
        type: 'negative'
      });
    }

    if (githubConnected) {
      insights.push({
        title: 'GitHub Core Analytics Active',
        desc: `Repository crawler tracking commit frequency, velocity & code stars for linked user '${githubUser}'.`,
        type: 'positive'
      });
    } else {
      insights.push({
        title: 'GitHub Insights Missing',
        desc: 'Connect your GitHub developer username to audit commit timelines and calculate readiness scores.',
        type: 'negative'
      });
    }

    if (targetCompaniesCount > 0) {
      insights.push({
        title: 'Corporate Pipeline Aligned',
        desc: `Excellent preparation parameters check aligned for: ${selectedCompanies.join(', ')}.`,
        type: 'positive'
      });
    } else {
      insights.push({
        title: 'Target Firms Deficit',
        desc: 'Define target companies to receive tailwind alignment checks for core engineering interviews.',
        type: 'negative'
      });
    }

    return insights;
  };

  const aiInsights = getAiInsights();

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/share/profile/${profile?.user?._id || ''}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Edit Form */}
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-indigo-500" />
              <span>Digital Developer Identity</span>
            </h1>
            <span className="text-[10px] text-slate-500">Last Synced: Just Now</span>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-xs font-semibold mb-6 ${
              message.includes('updated') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Full Name</label>
                <input 
                  type="text" 
                  disabled
                  value={name}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-500 cursor-not-allowed rounded-lg px-4 py-2.5 text-sm outline-none"
                />
              </div>

              {/* College / Institution */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">College / University</label>
                <input 
                  type="text" 
                  placeholder="e.g. IIT Bombay"
                  value={college}
                  onChange={(e) => {
                    setCollege(e.target.value);
                    setShowCollegeDropdown(true);
                  }}
                  onFocus={() => setShowCollegeDropdown(true)}
                  onBlur={() => {
                    // Delay blur slightly to allow list click handler to fire first
                    setTimeout(() => setShowCollegeDropdown(false), 200);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
                {showCollegeDropdown && (
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-slate-900 border border-slate-850 rounded-xl shadow-2xl z-50">
                    {UNIVERSITIES.filter(u => u.toLowerCase().includes(college.toLowerCase())).length > 0 ? (
                      UNIVERSITIES.filter(u => u.toLowerCase().includes(college.toLowerCase())).slice(0, 15).map((u) => (
                        <div 
                          key={u}
                          onMouseDown={() => {
                            setCollege(u);
                            setShowCollegeDropdown(false);
                          }}
                          className="p-3 text-xs hover:bg-indigo-650 hover:bg-indigo-600 hover:text-white text-slate-300 cursor-pointer border-b border-slate-850 last:border-0 transition-colors"
                        >
                          {u}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">No colleges found. Type to save custom.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Academic Branch</label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none cursor-pointer"
                >
                  <option value="" disabled>Select Academic Branch</option>
                  {BRANCHES.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* CGPA */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Current CGPA</label>
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="e.g. 8.42"
                  value={cgpa || ''}
                  onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>

              {/* Leetcode username */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">LeetCode Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. krish_coder"
                  value={leetcodeUser}
                  onChange={(e) => setLeetcodeUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>

              {/* GitHub Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">GitHub Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. krish-dev"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
              </div>
            </div>

            {/* Target Companies Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Target Companies</label>
              
              {/* Tags Display */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCompanies.map((c) => (
                  <span 
                    key={c}
                    className="flex items-center space-x-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  >
                    <span>{c}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveCompany(c)}
                      className="text-indigo-400 hover:text-rose-500 font-bold focus:outline-none ml-1 text-[10px]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Text Input with datalist autocomplete */}
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  list="companies-list"
                  placeholder="Type company name (e.g. Google) and press Add"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={handleKeyDownCompany}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-2.5 text-sm text-slate-200 outline-none"
                />
                <button 
                  type="button"
                  onClick={handleAddCompany}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 rounded-lg transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              <datalist id="companies-list">
                {COMPANIES.filter(c => !selectedCompanies.includes(c)).map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile Identity'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* AI digital twin insights sidebar */}
      <div className="space-y-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-2 text-indigo-400 mb-6">
            <Sparkles className="w-5 h-5 fill-indigo-400/20" />
            <h3 className="text-base font-bold text-white">AI Profile Insights</h3>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, idx) => (
              <div 
                key={idx} 
                className={`p-4 border rounded-xl space-y-1.5 ${
                  insight.type === 'positive' 
                    ? 'bg-emerald-500/5 border-emerald-500/10' 
                    : 'bg-rose-500/5 border-rose-500/10'
                }`}
              >
                <h4 className={`text-xs font-bold ${insight.type === 'positive' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {insight.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">{insight.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick developer link promo */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Portfolio Showcase Card</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Generate a shareable, responsive portfolio card showing your active placement level and target companies.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold hover:underline outline-none focus:outline-none"
          >
            Generate Shareable Link &rarr;
          </button>
        </div>
      </div>

      {/* Portfolio Showcase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shareable Portfolio Pass</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>
            
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Preview Pass</span>
                <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-white">{name || 'Developer'}</h4>
                <p className="text-[11px] text-slate-400">{college || 'e.g. University'}</p>
                <p className="text-[10px] text-slate-500">{branch || 'e.g. Branch'} • CGPA {cgpa || 0}</p>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-2 text-[10px] text-slate-400">
                <span>GitHub: {githubUser ? 'Linked' : 'Not Connected'}</span>
                <span>LeetCode: {leetcodeUser ? 'Linked' : 'Not Connected'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Share Link</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}/share/profile/${profile?.user?._id || ''}`}
                  className="bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-indigo-300 w-full outline-none focus:outline-none"
                />
                <button 
                  onClick={handleCopyLink}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold py-2 rounded-lg mt-2"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
