import React from 'react';
import { Sprout, ShoppingCart, Stethoscope, Play } from 'lucide-react';

export interface Scenario {
  id: string;
  domain: string;
  title: string;
  subtitle: string;
  query: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'mandi',
    domain: 'agriculture',
    title: 'Kisan Mandi Rates',
    subtitle: 'Tier 2/3 AgTech • Hinglish Voice',
    query: 'नमस्ते, आज इंदौर मंडी में सोयाबीन और गेहूं का भाव क्या चल रहा है?',
    badge: 'Code-Mixed Indic',
    badgeColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    icon: Sprout,
  },
  {
    id: 'kirana',
    domain: 'kirana',
    title: 'Kirana Voice Khata',
    subtitle: 'Conversational Billing & Ledger',
    query: 'रमेश जी के खाते में 2 किलो बासमती चावल और 1 लीटर सरसों का तेल जोड़ दो।',
    badge: 'Real-Time Udhaar',
    badgeColor: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    icon: ShoppingCart,
  },
  {
    id: 'health',
    domain: 'health',
    title: 'PHC Clinic Triage',
    subtitle: 'Noisy Telephonic 8kHz Audio Simulation',
    query: 'डॉक्टर साहब, 2 दिन से तेज़ बुखार और सिरदर्द है, कल सुबह की अपॉइंटमेंट मिलेगी क्या?',
    badge: 'Telephony Voice',
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    icon: Stethoscope,
  },
];

interface ScenarioSelectorProps {
  onSelectScenario: (scenario: Scenario) => void;
  disabled?: boolean;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ onSelectScenario, disabled }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          Instant Demo Scenarios (1-Click for Video Recording)
        </span>
        <span className="text-[11px] text-slate-400">Award Showcase Modes</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          return (
            <button
              key={sc.id}
              disabled={disabled}
              onClick={() => onSelectScenario(sc)}
              className="group text-left p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex flex-col justify-between gap-3 shadow-sm hover:shadow-cyan-500/10"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors font-display">
                  {sc.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1">{sc.subtitle}</p>
              </div>

              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-[11px] text-slate-300 font-mono italic truncate">
                "{sc.query}"
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
