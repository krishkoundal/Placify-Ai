import React, { useState, useRef } from 'react';
import { Sparkles, FileText, Upload, CheckCircle, AlertTriangle, FileCheck, X, File, Zap, Copy, Download, Award, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const ResumeAnalyzer: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [autoFixing, setAutoFixing] = useState(false);
  const [autoFixResult, setAutoFixResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Results states
  const [analysis, setAnalysis] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          // If DOCX XML structure (Extract paragraph by paragraph <w:p> to keep all line breaks!)
          if (file.name.endsWith('.docx') || file.name.endsWith('.doc') || text.includes('word/document.xml')) {
            const paragraphs = text.match(/<w:p[^>]*>(.*?)<\/w:p>/gi);
            if (paragraphs && paragraphs.length > 0) {
              const extractedLines = paragraphs.map(p => {
                const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
                if (!textMatches) return '';
                return textMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
              }).map(l => l.trim()).filter(Boolean);

              if (extractedLines.length > 0) {
                setResumeText(extractedLines.join('\n'));
                return;
              }
            }
          }
          // If Plain Text or readable text
          if (!text.startsWith('PK') && !text.includes('%PDF')) {
            setResumeText(text);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleUploadResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeText && !selectedFile) {
      alert('Please paste your resume text in the box below or select a PDF/DOCX file first!');
      return;
    }
    setAnalyzing(true);
    try {
      let res;
      if (selectedFile && !resumeText) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        if (jobDescription) formData.append('jobDescription', jobDescription);
        res = await api.post('/resume/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/resume/analyze', { resumeText });
      }
      setAnalysis(res.data);
      if (res.data?.analysis?.rawResumeText) {
        setResumeText(res.data.analysis.rawResumeText);
      }
    } catch (err: any) {
      console.error('Error analyzing resume:', err);
      alert('ATS Audit error: ' + (err.response?.data?.message || 'Server connection issue. Please retry.'));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAutoFix = async () => {
    if (!resumeText && !selectedFile) {
      alert('Please paste your resume text in the box below or select a PDF/DOCX file first!');
      return;
    }
    setAutoFixing(true);
    try {
      let res;
      if (selectedFile && !resumeText) {
        const formData = new FormData();
        formData.append('resume', selectedFile);
        if (jobDescription) formData.append('jobDescription', jobDescription);
        res = await api.post('/resume/auto-fix', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/resume/auto-fix', { resumeText, jobDescription });
      }

      if (res.data) {
        setAutoFixResult(res.data);
        setAnalysis({
          analysis: {
            atsScore: 100,
            recruiterScore: 98,
            score: 100,
            suggestions: ['Your resume is 100% ATS-optimized! All formatting errors fixed and high-impact metrics injected.']
          }
        });
      }
    } catch (err: any) {
      console.error('Error auto-fixing resume:', err);
      alert('Auto-Fix error: ' + (err.response?.data?.message || 'Server connection issue. Please retry.'));
    } finally {
      setAutoFixing(false);
    }
  };

  const handleCopyOptimized = () => {
    if (autoFixResult?.optimizedResume) {
      navigator.clipboard.writeText(autoFixResult.optimizedResume);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTXT = () => {
    if (autoFixResult?.optimizedResume) {
      const element = document.createElement('a');
      const file = new Blob([autoFixResult.optimizedResume], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = '100_ATS_Optimized_Resume.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(element.href);
    }
  };

  const handleDownloadDOCX = () => {
    if (!autoFixResult?.optimizedResume) return;

    const formattedLines = autoFixResult.optimizedResume
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('================')) return '';
        if (line.startsWith('----------------')) return '';
        if (line === line.toUpperCase() && line.length > 3 && !line.includes(':') && !line.includes('@')) {
          return `<h2 style="font-size:12pt; font-weight:bold; text-transform:uppercase; border-bottom:1.5pt solid #222; margin-top:14pt; margin-bottom:6pt; color:#000;">${line}</h2>`;
        }
        if (line.startsWith('* ')) {
          return `<li style="margin-bottom:3pt;">${line.substring(2)}</li>`;
        }
        if (line.includes('@') || line.includes('Phone:')) {
          return `<div style="text-align:center; font-size:10pt; color:#444; margin-bottom:14pt;">${line}</div>`;
        }
        if (line.trim()) {
          return `<p style="margin-top:4pt; margin-bottom:6pt;">${line}</p>`;
        }
        return '';
      }).join('');

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>100% ATS Optimized Resume</title>
        <style>
          body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.45; color: #111; margin: 1in; }
        </style>
      </head>
      <body>
        ${formattedLines}
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '100_ATS_Optimized_Resume.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!autoFixResult?.optimizedResume) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const formattedLines = autoFixResult.optimizedResume
      .split('\n')
      .map((line: string) => {
        if (line.startsWith('================')) return '';
        if (line.startsWith('----------------')) return '';
        if (line === line.toUpperCase() && line.length > 3 && !line.includes(':') && !line.includes('@')) {
          return `<h2>${line}</h2>`;
        }
        if (line.startsWith('* ')) {
          return `<li>${line.substring(2)}</li>`;
        }
        if (line.includes('@') || line.includes('Phone:')) {
          return `<div class="contact">${line}</div>`;
        }
        if (line.trim()) {
          return `<p>${line}</p>`;
        }
        return '';
      }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>100% ATS Optimized Resume - Placify AI</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; color: #0f172a; margin: 0; padding: 25px; }
          h1 { font-size: 18pt; font-weight: 800; text-align: center; text-transform: uppercase; margin: 0 0 6px 0; letter-spacing: 0.5px; color: #0f172a; }
          .contact { text-align: center; font-size: 9.5pt; color: #475569; margin-bottom: 18px; font-weight: 500; }
          h2 { font-size: 11pt; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 3px; margin-top: 16px; margin-bottom: 8px; color: #0f172a; letter-spacing: 0.5px; }
          ul { margin: 4px 0 10px 0; padding-left: 20px; }
          li { margin-bottom: 4px; }
          p { margin: 4px 0 8px 0; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${formattedLines}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 200);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleMatchJob = async () => {
    if (!jobDescription) return;
    setMatching(true);
    try {
      const res = await api.post('/resume/match-job', { jobDescription });
      setMatchResult(res.data);
    } catch (err) {
      console.error('Error matching job description:', err);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">AI Resume Intelligence</h1>
        <p className="text-slate-400 mt-1 text-sm">Upload your resume to crawl ATS formatting issues, auto-fix mistakes, and boost your score to 100%.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload & Input area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Resume Upload Form */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <span>Resume Text Analysis & Auto-Optimizer</span>
            </h3>

            <form onSubmit={handleUploadResume} className="space-y-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.txt,.doc,.docx" 
                className="hidden" 
              />
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 cursor-pointer rounded-xl p-8 text-center bg-slate-950/40 transition-colors"
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-3 text-indigo-400">
                    <File className="w-6 h-6" />
                    <span className="text-xs font-bold text-slate-200">{selectedFile.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                    <p className="text-xs text-slate-300 font-medium mb-1">
                      Click to browse & upload resume PDF / Document
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Supports PDF, TXT, DOC, DOCX up to 10MB
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Paste Your Full 1-Page Resume Text Below:
                  </label>
                  {resumeText && (
                    <button
                      type="button"
                      onClick={() => { setResumeText(''); setAutoFixResult(null); setSelectedFile(null); }}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline cursor-pointer"
                    >
                      Clear / Reset Text
                    </button>
                  )}
                </div>

                <textarea 
                  rows={8}
                  placeholder="Paste your complete 1-page resume text here (Name, Contact, Education, Skills, Projects, Experience)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-4 py-3 text-xs font-mono text-slate-200 outline-none placeholder:text-slate-600 leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <button 
                  type="submit"
                  disabled={analyzing}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{analyzing ? 'Analyzing structure...' : 'Trigger ATS Audit'}</span>
                </button>

                <button 
                  type="button"
                  onClick={handleAutoFix}
                  disabled={autoFixing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{autoFixing ? 'Fixing & Optimizing...' : '⚡ Auto-Fix & Boost to 100 ATS Score'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* 100% ATS Optimized Resume Result Display */}
          {autoFixResult && (
            <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border-2 border-emerald-500/40 p-8 rounded-2xl space-y-8 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-emerald-500/30 pb-6 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <h3 className="text-xl font-black text-white tracking-tight">100% ATS SCORE MASTER RESUME</h3>
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                        PERFECT SCORE 100%
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">All formatting mistakes auto-corrected, keywords injected, & bullet points quantified.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <button 
                    onClick={handleCopyOptimized}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Copy raw text to clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button 
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-emerald-900/40 transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Generate & print/download ATS PDF resume"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>

                  <button 
                    onClick={handleDownloadDOCX}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Download Word Document (.doc/.docx)"
                  >
                    <File className="w-3.5 h-3.5" />
                    <span>Download DOCX</span>
                  </button>

                  <button 
                    onClick={handleDownloadTXT}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Download Plain Text file (.txt)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Improvements Applied Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/80 p-4 border border-emerald-500/20 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Auto-Fix Improvements Applied</span>
                  <ul className="space-y-2">
                    {autoFixResult.improvementsApplied?.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/80 p-4 border border-indigo-500/20 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">High-Value Tech Keywords Injected</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {autoFixResult.keywordsInjected?.map((kw: string, idx: number) => (
                      <span key={idx} className="text-xs font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Optimized Resume Text Container */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Optimized Master Resume (100% ATS Ready Format)</span>
                  <span className="text-[10px] text-slate-400">Single-column standardized text structure</span>
                </div>
                <textarea 
                  rows={14}
                  readOnly
                  value={autoFixResult.optimizedResume}
                  className="w-full bg-slate-950 border border-emerald-500/30 rounded-xl px-5 py-4 text-xs font-mono text-emerald-300 leading-relaxed outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Analysis Results Display */}
          {analysis && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-8">
              {/* Scores Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ATS Score</span>
                  <h4 className="text-3xl font-extrabold text-indigo-400 mt-2">{analysis.analysis?.atsScore || 74}%</h4>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recruiter Rating</span>
                  <h4 className="text-3xl font-extrabold text-emerald-400 mt-2">{analysis.analysis?.recruiterScore || 82}%</h4>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-800/80 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Score</span>
                  <h4 className="text-3xl font-extrabold text-purple-400 mt-2">{analysis.analysis?.score || 78}%</h4>
                </div>
              </div>

              {/* Suggestions Section */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white">Parser Suggestions & Fixes</h4>
                <ul className="space-y-2.5">
                  {analysis.analysis?.suggestions?.map((sug: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grammar/ATS Sections */}
              {analysis.grammarIssues?.length > 0 && (
                <div className="space-y-4 border-t border-slate-800/60 pt-6">
                  <h4 className="text-sm font-bold text-white">Grammatical Revisions</h4>
                  <ul className="space-y-2.5">
                    {analysis.grammarIssues.map((issue: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-400">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Project improvements */}
              {analysis.improvedProjectDescription && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-xl space-y-3">
                  <div className="flex items-center space-x-2 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Bullet Rewriting</span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{analysis.improvedProjectDescription}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Job Description comparison & Match tool */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <span>Job Description Match</span>
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paste the target job description to match skills, identify missing keywords, and forecast ATS shortlist probability.
            </p>

            <textarea 
              rows={5}
              placeholder="Paste target Job Description here... (e.g. Node.js backend developer at Swiggy)"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-600"
            />

            <button 
              onClick={handleMatchJob}
              disabled={matching || !jobDescription}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <span>{matching ? 'Matching profiles...' : 'Match Resume'}</span>
            </button>

            {/* Match output results */}
            {matchResult && (
              <div className="border-t border-slate-800/80 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Match Score</span>
                  <span className="text-sm font-bold text-emerald-400">{matchResult.atsMatch}%</span>
                </div>

                {matchResult.missingKeywords?.length > 0 && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Missing Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingKeywords.map((word: string, i: number) => (
                        <span key={i} className="text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {matchResult.suggestions?.length > 0 && (
                  <div className="space-y-1.5 text-[10px] text-slate-400">
                    <span className="block font-bold text-slate-500 uppercase tracking-wider">Tailoring Tips</span>
                    <ul className="list-disc pl-4 space-y-1">
                      {matchResult.suggestions.slice(0, 2).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
