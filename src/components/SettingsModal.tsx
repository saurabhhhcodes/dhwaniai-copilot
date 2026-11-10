import React, { useState } from 'react';
import { X, Key, Sliders, CheckCircle, Volume2, Mic, RefreshCw, Eye, EyeOff, Cloud, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  sttModel: string;
  ttsModel: string;
  ttsVoice: string;
  language: string;
  fallbackMode: boolean;
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
  onSave: (config: {
    apiKey: string;
    sttModel: string;
    ttsModel: string;
    ttsVoice: string;
    language: string;
    forceFallback: boolean;
    llmProvider?: string;
    llmApiKey?: string;
    llmModel?: string;
  }) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey: initialApiKey,
  sttModel: initialSttModel,
  ttsModel: initialTtsModel,
  ttsVoice: initialTtsVoice,
  language: initialLanguage,
  fallbackMode: initialFallbackMode,
  llmProvider: initialLlmProvider = 'groq',
  llmApiKey: initialLlmApiKey = '',
  llmModel: initialLlmModel = 'llama-3.3-70b-versatile',
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(initialApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [sttModel, setSttModel] = useState(initialSttModel || 'prisma-v3.0');
  const [ttsModel, setTtsModel] = useState(initialTtsModel || 'timbre-v3.0');
  const [ttsVoice, setTtsVoice] = useState(initialTtsVoice || 'Shivani');
  const [language, setLanguage] = useState(initialLanguage || 'indic-auto');
  const [forceFallback, setForceFallback] = useState(initialFallbackMode);

  // Cloud Open-Source LLM State
  const [llmProvider, setLlmProvider] = useState(initialLlmProvider);
  const [llmApiKey, setLlmApiKey] = useState(initialLlmApiKey);
  const [showLlmKey, setShowLlmKey] = useState(false);
  const [llmModel, setLlmModel] = useState(initialLlmModel);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      apiKey,
      sttModel,
      ttsModel,
      ttsVoice,
      language,
      forceFallback,
      llmProvider,
      llmApiKey,
      llmModel,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-panel-glow bg-[#0b1120] rounded-2xl border border-cyan-500/30 p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Gnani AI & Cloud LLM Engine Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure Prisma STT, Timbre TTS & Cloud Open-Source LLM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Cloud Open Source LLM Section */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Cloud className="w-4 h-4 text-cyan-400" />
                Cloud Open-Source LLM Engine (Production / Deployment)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                No Localhost
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Cloud Provider</label>
                <select
                  value={llmProvider}
                  onChange={(e) => {
                    const p = e.target.value;
                    setLlmProvider(p);
                    if (p === 'groq') setLlmModel('llama-3.3-70b-versatile');
                    else if (p === 'openrouter') setLlmModel('meta-llama/llama-3.3-70b-instruct');
                    else if (p === 'huggingface') setLlmModel('gnani/gnani-evon-v3.3-30B-A3B');
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="groq">Groq (Llama 3.3 70B - Fastest 200ms)</option>
                  <option value="openrouter">OpenRouter (Open Source Cloud)</option>
                  <option value="huggingface">Hugging Face (Gnani Evon 30B)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Open-Source Model</label>
                <input
                  type="text"
                  value={llmModel}
                  onChange={(e) => setLlmModel(e.target.value)}
                  placeholder="e.g. llama-3.3-70b-versatile"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                <span>Cloud LLM API Key ({llmProvider.toUpperCase()})</span>
                <span className="text-[10px] text-slate-400">Paste your free key below</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showLlmKey ? 'text' : 'password'}
                  value={llmApiKey}
                  onChange={(e) => setLlmApiKey(e.target.value)}
                  placeholder={
                    llmProvider === 'groq'
                      ? 'gsk_...'
                      : llmProvider === 'openrouter'
                      ? 'sk-or-...'
                      : 'hf_...'
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowLlmKey(!showLlmKey)}
                  className="absolute right-3 text-slate-400 hover:text-slate-200"
                >
                  {showLlmKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Gnani AI Credentials */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Gnani AI Voice Key (X-API-Key-ID)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">Connected</span>
            </label>
            <div className="relative flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Gnani API key configured"
                className="w-full px-3.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Voice & Model Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">STT Engine</span>
              <span className="font-bold text-white flex items-center gap-1">
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                Prisma v3.0 (Indic-Auto)
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">TTS Voice</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                Shivani (48kHz Natural)
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-900" />
                <span>Cloud Config Applied!</span>
              </>
            ) : isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save & Connect Cloud LLM</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
