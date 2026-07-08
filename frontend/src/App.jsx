import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Upload, Activity, ShieldAlert, FileText, CheckCircle, RefreshCw, Layers, Database, Package, TrendingUp, Clock, Stethoscope, HeartHandshake, X, Calendar, MapPin, Phone, Dumbbell, Trophy, Apple } from 'lucide-react';

// YOUR GEMINI API KEY PLACED SECURELY HERE
const GEMINI_API_KEY = "AQ.Ab8RN6IwzPVOO3ZFOEeu2E7CU97yuu0rLyCRtvBBv6gu5c4MQw";
function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [completedExercises, setCompletedExercises] = useState({
    walk: false,
    yoga: false,
    breathing: false
  });

  const [mockHistory, setMockHistory] = useState([
    { id: "A1-408", patient: "K. Rao", date: "10 mins ago", status: "Normal Sync" },
    { id: "A1-407", patient: "J. Fernandez", date: "1 hr ago", status: "Supply Trigger" },
  ]);

  const nearbyHospitals = [
    { name: "Apollo Health City", distance: "1.2 km away", contact: "+91 891 2727272" },
    { name: "Care Hospitals", distance: "2.8 km away", contact: "+91 891 3923300" },
    { name: "GVP Institute of Health Care", distance: "4.5 km away", contact: "+91 891 2856444" }
  ];

  const handleFileChange = (e) => {
    e.preventDefault();
  
  // 1. Validation
  if (!file) {
    alert("Please select a report image first!");
    return;
  }
  
  setLoading(true);

  try {
    // 2. Prepare the data for the backend (using FormData for file uploads)
    const formData = new FormData();
    formData.append('report', file);

    // 3. Point to your live Render backend URL
    const response = await fetch('https://medpulse-ai-z3gx.onrender.com/api/analyze', {
      method: 'POST',
      body: formData, // Send the file as part of the FormData
    });

    const data = await response.json();

    if (response.ok) {
      // Success! Update your state with the data from Gemini
      setData(data);
      alert("Report scanned successfully!");
    } else {
      // If the backend returns an error
      console.error("Backend Error:", data.error);
      alert(data.error || "Failed to scan report. Check backend logs.");
    }

  } catch (error) {
    console.error("Network Error:", error);
    alert("Could not connect to the server. Check your internet connection.");
  } finally {
    setLoading(false);
  }
  };

  const toggleExercise = (key) => {
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const completedCount = Object.values(completedExercises).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / 3) * 100);

  const fileToGenerativePart = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          inlineData: {
            data: reader.result.split(',')[1],
            mimeType: file.type
          },
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a report image first!");
    
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const imagePart = await fileToGenerativePart(file);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `
        You are an advanced medical report extraction AI. Analyze this blood report image carefully.
        Extract the patient's name, identify the key biomarkers, and determine if they are Normal, Low, or High.
        
        Respond ONLY with a valid JSON object matching this exact structure. Do not include markdown blocks like \`\`\`json. Just the raw string:
        {
          "patientName": "Extract Patient Name here",
          "summary": "Write a 2-3 sentence clinical summary talking about the specific findings for this patient name.",
          "supplyChain": "Write a recommendation for medicine/supplements to restock based on their specific deficiency.",
          "metrics": [
            { "parameter": "Hemoglobin", "value": "12.5", "unit": "g/dL", "status": "Low" }
          ]
        }
      `;

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const responseText = response.text().trim();
      
      const cleanJsonString = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
      const parsedData = JSON.parse(cleanJsonString);

      setData({
        summary: parsedData.summary,
        supplyChain: parsedData.supplyChain,
        metrics: parsedData.metrics
      });

      setMockHistory(prev => [
        { id: `A1-${Math.floor(100 + Math.random() * 900)}`, patient: parsedData.patientName || "Unknown", date: "Just now", status: "Scanned Sync" },
        ...prev
      ]);

    } catch (error) {
      console.error("Scanning Error:", error);
      alert("Failed to scan report. Check console logs or verify your API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <Activity className="text-slate-950 w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                MedPulse <span className="text-emerald-400">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Community Intelligence Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl transition-all hover:border-slate-700">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 tracking-wide">Smart Health Track Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
        
        {/* METRICS PANEL */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Reports Aggregated", value: "1,249", change: "+12%", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Database },
            { label: "Supply Orders Fired", value: "85 Orders", change: "", color: "text-amber-400", bg: "bg-amber-500/10", icon: Package },
            { label: "Flagged Anomalies", value: "33 Cases", change: "", color: "text-rose-400", bg: "bg-rose-500/10", icon: ShieldAlert },
            { label: "AI Accuracy Rate", value: "99.4%", change: "", color: "text-blue-400", bg: "bg-blue-500/10", icon: TrendingUp }
          ].map((item, index) => (
            <div key={index} className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-900/60 hover:border-slate-800 shadow-md">
              <div className={`p-2.5 ${item.bg} rounded-xl ${item.color} border border-white/5`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-xl font-bold text-slate-100">
                  {item.value} {item.change && <span className="text-xs text-emerald-400 font-medium">{item.change}</span>}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* INGESTION SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/60 border border-slate-850 backdrop-blur-md p-5 rounded-2xl shadow-xl transition-all duration-300 hover:border-slate-800">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Ingestion Pipeline
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/30 transition-all duration-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-950/40 group relative overflow-hidden">
                  <Upload className="w-7 h-7 text-slate-600 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-2 stroke-[1.5]" />
                  <span className="text-xs font-medium text-slate-300 text-center max-w-[180px] truncate block">
                    {file ? file.name : "Select Blood Report Image"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                <button
                  type="submit"
                  disabled={loading || !file}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-2.5 px-4 rounded-xl transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:scale-100 shadow-md text-sm"
                >
                  <span className="flex items-center justify-center gap-2">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Scan & Extract Report"}
                  </span>
                </button>
              </form>
            </div>

            {/* EVENT HISTORY */}
            <div className="bg-slate-900/60 border border-slate-850 backdrop-blur-md p-5 rounded-2xl shadow-xl">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" /> Platform Event History
              </h2>
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {mockHistory.map((item, idx) => (
                  <div key={idx} className="bg-slate-950/50 border border-slate-850/80 p-3 rounded-xl flex items-center justify-between text-xs animate-fade-in transition-all duration-300 hover:bg-slate-900/50">
                    <div>
                      <p className="font-semibold text-slate-300">{item.patient} <span className="text-slate-600 font-mono text-[10px]">({item.id})</span></p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{item.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                      item.status.includes('Critical') || item.status.includes('Trigger') || item.status.includes('Scan')
                        ? 'bg-amber-500/5 text-amber-400 border-amber-500/10'
                        : 'bg-slate-800 text-slate-400 border-transparent'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ANALYSIS DISPLAY CHANNELS */}
          <div className="lg:col-span-8 space-y-6">
            {data ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* AI Text Block */}
                <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl shadow-xl transition-all hover:border-slate-800">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Automated AI Assessment Summary</h3>
                  <p className="text-slate-200 text-base leading-relaxed font-normal">{data.summary}</p>
                </div>

                {/* DOUBLE ADMINISTRATIVE ROUTING PANEL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-amber-500/[0.02] border border-amber-500/10 p-5 rounded-2xl flex gap-4 items-start shadow-md transition-all duration-300 hover:border-amber-500/20">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shrink-0">
                      <Package className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-amber-400 mb-0.5">Predictive Logistic Dispatch</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{data.supplyChain}</p>
                    </div>
                  </div>

                  <div className="bg-sky-500/[0.02] border border-sky-500/10 p-5 rounded-2xl flex gap-4 items-start shadow-md justify-between flex-col transition-all duration-300 hover:border-sky-500/20">
                    <div className="flex gap-4 items-start">
                      <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/20 shrink-0">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-sky-400 mb-0.5">Clinical Consultation Protocol</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Biomarker fluctuations flagged. Triggering direct connection protocols for clinical validation.
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="mt-3 text-xs font-bold bg-sky-500 text-slate-950 px-3 py-2 rounded-lg hover:bg-sky-400 active:scale-95 transition-all self-end flex items-center gap-1.5 shadow-md shadow-sky-550/10"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Consult Doctor
                    </button>
                  </div>
                </div>

                {/* INTERACTIVE EXERCISE & NUTRITION FUEL PLANNER */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300 hover:border-slate-800">
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400 pointer-events-none">
                    <Dumbbell className="w-32 h-32" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-200 tracking-wide">AI-Generated Routine & Nutritional Fuel</h3>
                        <p className="text-[11px] text-slate-500">Click a card to log completion and unlock target recovery food insights.</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-center transition-all">
                      <Trophy className={`w-4 h-4 transition-all duration-500 ${progressPercentage === 100 ? 'text-amber-400 scale-110 animate-bounce' : 'text-slate-600'}`} />
                      <span className="text-[11px] font-mono font-bold text-slate-300">Today's Sync: {progressPercentage}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 h-2 rounded-full mb-6 overflow-hidden border border-slate-900">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { key: 'walk', category: 'Cardio', title: '20-Min Gentle Walk', desc: 'Increases red blood cell oxygen binding without taxing muscle tissues.', fuelTag: 'Iron Catalyst Fuel', fuel: 'Spinach & Beet Salad (Optimizes hemoglobin)', iconColor: 'text-purple-400' },
                      { key: 'yoga', category: 'Mobility', title: 'Restorative Hatha Yoga', desc: 'Asanas focused on open circulation adjustments and nervous system balance.', fuelTag: 'Absorption Synergy', fuel: 'Citrus Salad / Amla Juice (Vitamin C pairs)', iconColor: 'text-amber-400' },
                      { key: 'breathing', category: 'Respiratory', title: 'Diaphragmatic Breathing', desc: '5-min cycles of deep pranayama breathing to boost alveolar exchange.', fuelTag: 'Oxidative Shield', fuel: 'Handful of Soaked Almonds (Supports cell repair)', iconColor: 'text-teal-400' }
                    ].map((card) => {
                      const isDone = completedExercises[card.key];
                      return (
                        <div 
                          key={card.key}
                          onClick={() => toggleExercise(card.key)}
                          className={`p-4 rounded-xl border cursor-pointer select-none flex flex-col justify-between transition-all duration-300 active:scale-[0.98] ${
                            isDone 
                              ? 'bg-emerald-500/[0.03] border-emerald-500/40 shadow-lg shadow-emerald-500/5 min-h-[170px]' 
                              : 'bg-slate-950/40 border-slate-850 hover:border-slate-800 hover:bg-slate-950/80 min-h-[130px]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500"> {card.category} </span>
                              <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                                isDone ? 'bg-emerald-500 border-transparent text-slate-950 scale-110' : 'border-slate-700'
                              }`}>
                                {isDone && <CheckCircle className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                            <h4 className={`text-xs font-bold mb-1 transition-colors duration-300 ${isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {card.title}
                            </h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{card.desc}</p>
                          </div>

                          {isDone && (
                            <div className="mt-3 pt-2.5 border-t border-emerald-500/20 bg-slate-950/60 p-2 rounded-lg flex items-start gap-2 animate-fade-in">
                              <Apple className={`w-3.5 h-3.5 ${card.iconColor} shrink-0 mt-0.5`} />
                              <div>
                                <p className={`text-[9px] font-bold ${card.iconColor} uppercase tracking-wide`}>{card.fuelTag}</p>
                                <p className="text-[10px] text-slate-300">{card.fuel}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl flex gap-3 items-center">
                  <HeartHandshake className="w-4 h-4 text-emerald-500 shrink-0" />
                  <p className="text-[11px] text-slate-500 italic leading-snug">
                    <strong className="text-slate-400 not-italic">Disclaimer:</strong> MedPulse AI provides structural data parsing for workflow reference.
                  </p>
                </div>

                {/* Metrics Table */}
                <div className="bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-800">
                  <div className="p-4 bg-slate-900/80 border-b border-slate-850 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-slate-300 tracking-wide flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> Extracted Bio-Markers
                    </h3>
                    <span className="text-[11px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded-md">
                      {data.metrics?.length || 0} Indicators
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-850 bg-slate-900/20 text-xs font-bold tracking-wider uppercase">
                          <th className="p-4 pl-6">Parameter</th>
                          <th className="p-4">Reported Value</th>
                          <th className="p-4 pr-6 text-right">Status Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {data.metrics?.map((metric, idx) => {
                          const isNormal = metric.status.toLowerCase() === 'normal';
                          return (
                            <tr key={idx} className="hover:bg-slate-900/30 transition-all duration-150 group">
                              <td className="p-4 pl-6 font-medium text-slate-300 group-hover:text-emerald-400 transition-colors duration-200">{metric.parameter}</td>
                              <td className="p-4 font-mono text-slate-200">{metric.value} <span className="text-xs text-slate-500 font-sans">{metric.unit}</span></td>
                              <td className="p-4 pr-6 text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wide border transition-all duration-300 ${
                                  isNormal ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 'bg-rose-500/5 text-rose-400 border-rose-500/10 animate-pulse shadow-sm shadow-rose-500/5'
                                }`}>
                                  {metric.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="border border-slate-900 bg-slate-900/10 border-dashed min-h-[440px] rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center backdrop-blur-sm animate-fade-in">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-850 mb-3 group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-slate-300 font-semibold text-sm mb-1">Awaiting Core Processing Engagement</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Provide a diagnostic report image package via the ingestion controller on the left side to compile live network insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* HOSPITAL MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto transform transition-all scale-100 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/10">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-200">Clinical Hospital Dispatch</h3>
                <p className="text-xs text-slate-500">Instant consultation connection networks</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-400 leading-relaxed mb-2">
                Based on the reported low parameter flags, the network suggests dispatching records to these local entities:
              </p>

              {nearbyHospitals.map((hospital, idx) => (
                <div key={idx} className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex justify-between items-center group hover:border-sky-500/30 hover:bg-slate-950/90 transition-all duration-200">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-300 group-hover:text-sky-400 transition-colors">{hospital.name}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {hospital.distance}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {hospital.contact}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      alert(`Mock Booking Successful with ${hospital.name}! Clinical records synced.`);
                      setIsModalOpen(false);
                    }}
                    className="text-[10px] font-bold bg-slate-800 hover:bg-sky-500 hover:text-slate-950 text-slate-300 px-2.5 py-1.5 rounded-md transition-all active:scale-95 shrink-0 shadow-md"
                  >
                    Connect
                  </button>
                </div>
              ))}
            </div>

            <div className="max-w-full mt-6 pt-4 border-t border-slate-850 flex justify-end gap-2">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-medium text-slate-400 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
