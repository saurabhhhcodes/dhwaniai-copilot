import React from 'react';
import { Volume2, User, Sparkles, CheckCircle2, Clock, Globe } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  engine?: string;
  confidence?: number;
  entities?: Record<string, any>;
  intent?: string;
  latencyMs?: number;
  audioUrl?: string;
}

interface ChatFeedProps {
  messages: ChatMessage[];
  onReplayAudio?: (msg: ChatMessage) => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({ messages, onReplayAudio }) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-slate-500 border border-dashed border-slate-800/80 rounded-2xl bg-slate-900/30">
        <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
        <p className="text-sm font-medium text-slate-400">Voice stream transcript will appear here in real time</p>
        <p className="text-xs text-slate-500 mt-1">
          Supports Hindi, English & Code-Mixed Hinglish powered by Gnani Prisma
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 animate-fade-in ${
            msg.sender === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {msg.sender === 'assistant' && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] flex-shrink-0 mt-1 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          )}

          <div
            className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 transition-all ${
              msg.sender === 'user'
                ? 'bg-gradient-to-br from-indigo-900/40 via-cyan-950/40 to-slate-900/80 border border-cyan-500/30 text-white shadow-lg shadow-cyan-950/30'
                : 'glass-panel border-slate-800 text-slate-100 shadow-xl'
            }`}
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-3 mb-1.5 text-[10px] text-slate-400">
              <span className="font-semibold flex items-center gap-1.5">
                {msg.sender === 'user' ? (
                  <>
                    <User className="w-3 h-3 text-cyan-400" />
                    <span>You (Voice Input)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 text-purple-400" />
                    <span>DhwaniAI (Timbre v3.0)</span>
                  </>
                )}
              </span>
              <span className="font-mono">{msg.timestamp}</span>
            </div>

            {/* Main message text */}
            <p className="text-sm leading-relaxed text-slate-100 mb-2 font-normal">
              {msg.text}
            </p>

            {/* Structured Card if entities exist */}
            {msg.entities && Object.keys(msg.entities).length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  Live Action Summary
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  {Object.entries(msg.entities).map(([key, value]) => (
                    <div key={key} className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-500 capitalize block">{key}</span>
                      <span className="font-semibold text-slate-200 truncate block">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Metadata Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-[10px]">
              <div className="flex items-center gap-2">
                {msg.engine && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-cyan-300 font-mono">
                    {msg.engine}
                  </span>
                )}
                {msg.confidence && (
                  <span className="text-emerald-400 font-mono">
                    {(msg.confidence * 100).toFixed(1)}% match
                  </span>
                )}
                {msg.latencyMs && (
                  <span className="text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {msg.latencyMs}ms
                  </span>
                )}
              </div>

              {msg.sender === 'assistant' && onReplayAudio && (
                <button
                  onClick={() => onReplayAudio(msg)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 px-2 py-1 rounded-md border border-cyan-800/50 transition-colors"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Replay Voice</span>
                </button>
              )}
            </div>
          </div>

          {msg.sender === 'user' && (
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-cyan-500/40 p-[1px] flex-shrink-0 mt-1">
              <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
