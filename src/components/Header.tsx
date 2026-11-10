import React from 'react';
import { Sparkles, Sliders, ShieldCheck, AlertCircle, PhoneCall, Radio } from 'lucide-react';
import { VisualizerMode } from './MotionOrb';

interface HeaderProps {
  apiKeyConfigured: boolean;
  apiKeyMasked: string | null;
  fallbackMode: boolean;
  sttModel: string;
  ttsModel: string;
  visualizerMode: VisualizerMode;
  onSetVisualizerMode: (mode: VisualizerMode) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiKeyConfigured,
  fallbackMode,
  sttModel,
  ttsModel,
  visualizerMode,
  onSetVisualizerMode,
  onOpenSettings,
}) => {
  return (
    <header className="w-full glass-panel border-b border-slate-800/80 px-4 md:px-8 py-3.5 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand & Contest Badge */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-[#090d16] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent font-display">
                DhwaniAI Copilot
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30">
                Gnani.ai Edition
              </span>
            </div>
            <p className="text-xs text-slate-400">
              The Great Indian AI Internship Challenge • Indic Voice Engine
            </p>
          </div>
        </div>

        {/* Center: Live Engine Badges */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-900/70 border border-slate-800 rounded-full px-3 py-1 text-xs">
          <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            STT: {sttModel}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1.5 text-purple-400 font-medium">
            TTS: {ttsModel}
          </span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <PhoneCall className="w-3 h-3" />
            8kHz Telephony Ready
          </span>
        </div>

        {/* Right: Visualizer Switch & Settings */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => onSetVisualizerMode('orb')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                visualizerMode === 'orb'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Orb
            </button>
            <button
              onClick={() => onSetVisualizerMode('radial')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                visualizerMode === 'radial'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Radial
            </button>
            <button
              onClick={() => onSetVisualizerMode('wave')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                visualizerMode === 'wave'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Wave
            </button>
          </div>

          {/* Connection Status Button */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              apiKeyConfigured && !fallbackMode
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
            }`}
          >
            {apiKeyConfigured && !fallbackMode ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Gnani API Live</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Fallback Active (Safe)</span>
              </>
            )}
            <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
