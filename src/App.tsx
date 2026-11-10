import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Phone,
  Ticket,
  TrendingUp,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { Header } from './components/Header';
import { MotionOrb, AgentState, VisualizerMode } from './components/MotionOrb';
import { SettingsModal } from './components/SettingsModal';
import {
  checkHealth,
  updateConfig,
  transcribeAudio,
  synthesizeSpeech,
  playBrowserSpeech,
  chatWithCopilot,
  HealthResponse,
} from './services/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  engine?: string;
  confidence?: number;
  options?: string[];
  card?: Record<string, any>;
}

export function App() {
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('orb');
  const [textInput, setTextInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([
    '🌾 मंडी भाव जानना है',
    '🌤️ मौसम और PM-किसान',
  ]);
  const [activeCard, setActiveCard] = useState<Record<string, any> | null>({
    type: 'welcome',
    title: 'इंदौर APMC डिजिटल मंडी सेवा',
    status: 'मंडी खुली है (आवक चालू)',
    time: 'सुबह 8:00 से शाम 6:00',
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [health, setHealth] = useState<HealthResponse>({
    status: 'checking',
    apiKeyConfigured: true,
    apiKeyMasked: 'vach••••••••b807',
    sttModel: 'prisma-v3.0',
    ttsModel: 'timbre-v3.0',
    ttsVoice: 'Shivani',
    language: 'indic-auto',
    fallbackMode: false,
    timestamp: '',
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef<string>('');

  useEffect(() => {
    loadHealth();
    // Start with friendly greeting
    handleInitiateGreeting();
  }, []);

  const loadHealth = async () => {
    const data = await checkHealth();
    setHealth(data);
  };

  const handleInitiateGreeting = () => {
    const greetingMsg: ChatMessage = {
      id: 'greeting',
      sender: 'assistant',
      text: 'नमस्ते! मैं आपकी डिजिटल मंडी सहायक शिवानी बोल रही हूँ। आप आज इंदौर मंडी का फसल भाव जानना चाहते हैं, या मौसम और पीएम-किसान सम्मान निधि के बारे में पूछना चाहते हैं?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'Timbre v3.0 (Shivani 48kHz)',
      options: ['🌾 मंडी भाव जानना है', '🌤️ मौसम और PM-किसान'],
    };
    setMessages([greetingMsg]);
  };

  // Web Audio Analyser
  const startAudioAnalysis = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1.0, Math.max(0, avg / 128));
        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (e) {
      console.warn('Could not initialize audio visualizer analyser', e);
    }
  };

  const stopAudioAnalysis = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  };

  const startSimulatedWave = () => {
    let t = 0;
    const interval = setInterval(() => {
      t += 0.2;
      const level = Math.abs(Math.sin(t) * 0.55 + Math.cos(t * 1.5) * 0.25);
      setAudioLevel(level);
    }, 50);

    return () => {
      clearInterval(interval);
      setAudioLevel(0);
    };
  };

  // STRICT SINGLE VOICE PLAYBACK (Never overlaps voices!)
  const stopAllAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.src = '';
    }
    setAgentState('idle');
    setAudioLevel(0);
  };

  const startRecording = async () => {
    stopAllAudio();
    liveTranscriptRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startAudioAnalysis(stream);

      // Start browser Web Speech API for real-time live preview if available
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const rec = new SpeechRecognition();
          rec.lang = 'hi-IN';
          rec.interimResults = true;
          rec.continuous = true;
          rec.onresult = (event: any) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              interim += event.results[i][0].transcript;
            }
            if (interim.trim()) {
              liveTranscriptRef.current = interim.trim();
              setTextInput(interim.trim());
            }
          };
          rec.onerror = () => {};
          rec.start();
          recognitionRef.current = rec;
        } catch (e) {
          console.warn('SpeechRecognition live preview not supported', e);
        }
      }

      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
          recognitionRef.current = null;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        stopAudioAnalysis();
        await handleAudioProcess(audioBlob);
      };

      recorder.start();
      setAgentState('listening');
    } catch (err) {
      console.error('Microphone access denied:', err);
      setAgentState('idle');
      const errNotice: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'माइक्रोफ़ोन चालू नहीं हो सका। कृपया ब्राउज़र में माइक की अनुमति (Permission) दें, या नीचे सीधे टाइप करके पूछें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'System Notice',
        options: currentOptions,
      };
      setMessages((prev) => [...prev, errNotice]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setAgentState('processing');
    }
  };

  const toggleRecording = () => {
    if (agentState === 'listening') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioProcess = async (audioBlob: Blob) => {
    setAgentState('processing');
    const sttResult = await transcribeAudio(audioBlob, 'indic-auto');
    const finalTranscript = sttResult.transcript?.trim() || liveTranscriptRef.current?.trim();
    if (finalTranscript) {
      setTextInput('');
      await handleUserInput(finalTranscript, sttResult.confidence || 0.98);
    } else {
      setAgentState('idle');
      const noSpeechMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'आवाज़ सुनाई नहीं दी। कृपया माइक बटन दबाकर दोबारा बोलें, या नीचे दिए गए विकल्पों में से चुनें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: 'Voice Detector',
        options: currentOptions,
      };
      setMessages((prev) => [...prev, noSpeechMsg]);
    }
  };

  const handleUserInput = async (text: string, confidence: number = 0.98) => {
    stopAllAudio();

    // Clean user query from chip icons
    const cleanText = text.replace(/^[🌾🚜🌤️📞🎫📱]\s*/, '').trim();

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: cleanText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: 'Prisma v3.0 (Indic-Auto)',
      confidence,
    };
    setMessages((prev) => [...prev, userMessage]);
    setAgentState('processing');

    // Bot Response with Multi-turn Flow
    const chatResult = await chatWithCopilot(cleanText, 'agriculture');
    if (chatResult.options && chatResult.options.length > 0) {
      setCurrentOptions(chatResult.options);
    }
    if (chatResult.card) {
      setActiveCard(chatResult.card);
    }

    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'assistant',
      text: chatResult.reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: chatResult.engine || 'Timbre v3.0 (Shivani 48kHz)',
      options: chatResult.options,
      card: chatResult.card,
    };
    setMessages((prev) => [...prev, botMessage]);

    // SPEAK THROUGH SHIVANI 48kHz (Strict Single Voice)
    setAgentState('speaking');
    const stopWave = startSimulatedWave();

    // Call Gnani Timbre
    const ttsResult = await synthesizeSpeech(chatResult.reply, 'Shivani', 'timbre-v3.0', 'hi-IN');

    if (ttsResult.audioUrl) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio();
      }
      const player = audioPlayerRef.current;
      player.pause();
      player.src = ttsResult.audioUrl;
      player.playbackRate = 1.0;

      player.onended = () => {
        stopWave();
        setAgentState('idle');
      };
      player.onerror = () => {
        stopWave();
        setAgentState('idle');
      };

      try {
        await player.play();
      } catch (err) {
        console.warn('Audio play interrupted or prevented', err);
        stopWave();
        setAgentState('idle');
      }
    } else {
      // Emergency browser speech only if API audioUrl was null
      playBrowserSpeech(chatResult.reply, () => {
        stopWave();
        setAgentState('idle');
      });
    }
  };

  const handleReplayVoice = (msg: ChatMessage) => {
    stopAllAudio();
    handleUserInput(msg.text);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col radial-bg select-none">
      {/* Top Header */}
      <Header
        apiKeyConfigured={health.apiKeyConfigured}
        apiKeyMasked={health.apiKeyMasked}
        fallbackMode={health.fallbackMode}
        sttModel="Prisma v3.0"
        ttsModel="Timbre v3.0 (Shivani)"
        visualizerMode={visualizerMode}
        onSetVisualizerMode={setVisualizerMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Voice Stage */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel-glow rounded-3xl p-6 relative overflow-hidden flex flex-col items-center">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#00f2fe15_1px,transparent_1px)] [background-size:18px_18px] opacity-40 pointer-events-none" />

            {/* Header in Card */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 z-10 mb-1">
              <span className="flex items-center gap-1.5 font-semibold text-cyan-400">
                <Sparkle className="w-4 h-4 text-cyan-400 animate-spin" />
                GramVani • Digital Mandi Assistant
              </span>
              <span className="bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Shivani (48kHz)
              </span>
            </div>

            {/* Animated Motion Orb */}
            <MotionOrb
              state={agentState}
              audioLevel={audioLevel}
              mode={visualizerMode}
              engineName="Timbre v3.0"
              onClickOrb={toggleRecording}
            />

            {/* Voice Control Button */}
            <div className="w-full flex flex-col items-center gap-3 mt-1 z-10">
              <button
                onClick={toggleRecording}
                className={`relative group flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-2xl ${
                  agentState === 'listening'
                    ? 'bg-amber-500 scale-110 shadow-amber-500/50 ring-4 ring-amber-400/30'
                    : agentState === 'speaking'
                    ? 'bg-emerald-500 shadow-emerald-500/40 ring-4 ring-emerald-400/20'
                    : 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 hover:scale-105 shadow-cyan-500/40'
                }`}
              >
                {agentState === 'listening' ? (
                  <MicOff className="w-8 h-8 text-black animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                )}
              </button>

              <p className="text-xs text-slate-300 text-center font-medium">
                {agentState === 'listening'
                  ? 'सुन रही हूँ... बोलने के बाद बटन दबाएं'
                  : agentState === 'speaking'
                  ? 'शिवानी बोल रही है... (48kHz Natural Voice)'
                  : 'माइक दबाकर बोलें या नीचे दिए गए विकल्पों पर क्लिक करें'}
              </p>
            </div>
          </div>

          {/* Interactive Step-by-Step Prompt Chips (Voice Controlled Choices) */}
          <div className="glass-panel rounded-2xl p-4 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              अगला कदम चुनें (बोलें या एक-क्लिक में टैप करें)
            </span>
            <div className="flex flex-wrap gap-2">
              {currentOptions.map((opt, i) => (
                <button
                  key={i}
                  disabled={agentState === 'listening' || agentState === 'processing'}
                  onClick={() => handleUserInput(opt)}
                  className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-cyan-950/70 text-slate-100 hover:text-cyan-300 border border-slate-700/80 hover:border-cyan-400/60 text-xs font-medium transition-all active:scale-[0.98] shadow-sm flex items-center gap-1.5"
                >
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live APMC Mandi Action Card & Transcript */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Real-time Mandi Action Card (Shows Real Task Being Done!) */}
          {activeCard && (
            <div className="glass-panel-glow rounded-2xl p-4 border border-cyan-500/30 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-300 font-display flex items-center gap-1.5">
                  {activeCard.type === 'mandi_rate' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                  {activeCard.type === 'trader_card' && <Phone className="w-4 h-4 text-purple-400" />}
                  {activeCard.type === 'gate_pass' && <Ticket className="w-4 h-4 text-amber-400" />}
                  {activeCard.type === 'weather_pmkisan' && <CloudSun className="w-4 h-4 text-cyan-400" />}
                  {activeCard.title || 'इंदौर APMC डिजिटल सेवा'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  सत्यापित डेटा
                </span>
              </div>

              {/* Dynamic Card Content Based on Turn */}
              {activeCard.type === 'mandi_rate' && (
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">आज का ताज़ा भाव</span>
                    <span className="text-lg font-bold text-emerald-400 block">{activeCard.price}</span>
                    <span className="text-[10px] text-emerald-300 font-medium">{activeCard.change}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">मंडी आवक</span>
                    <span className="text-base font-bold text-white block">{activeCard.arrival}</span>
                    <span className="text-[10px] text-slate-400">{activeCard.topMandi}</span>
                  </div>
                </div>
              )}

              {activeCard.type === 'trader_card' && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{activeCard.name}</span>
                    <span className="text-[10px] text-amber-300 font-semibold">{activeCard.rating}</span>
                  </div>
                  <p className="text-xs text-slate-300">{activeCard.shop}</p>
                  <p className="text-xs font-mono font-bold text-cyan-300">{activeCard.phone}</p>
                </div>
              )}

              {activeCard.type === 'gate_pass' && (
                <div className="bg-slate-950/80 p-3 rounded-xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">ई-गेट पास नंबर</span>
                      <span className="text-sm font-bold font-mono text-amber-400">{activeCard.passNumber}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {activeCard.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-0.5">
                    <p>किसान: <b className="text-white">{activeCard.farmer}</b></p>
                    <p>प्रवेश: <b className="text-white">{activeCard.entryGate}</b></p>
                    <p>वैधता: <b className="text-amber-300">{activeCard.validity}</b></p>
                  </div>
                </div>
              )}

              {activeCard.type === 'weather_pmkisan' && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">मालवा मौसम</span>
                    <span className="text-xs font-bold text-cyan-300 block">{activeCard.weather}</span>
                  </div>
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">PM-किसान सम्मान निधि</span>
                    <span className="text-xs font-bold text-emerald-400 block">{activeCard.pmKisan}</span>
                  </div>
                </div>
              )}

              {activeCard.type !== 'mandi_rate' &&
                activeCard.type !== 'trader_card' &&
                activeCard.type !== 'gate_pass' &&
                activeCard.type !== 'weather_pmkisan' && (
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-cyan-300">{activeCard.title || 'कृषि व मंडी सूचना'}</span>
                      {activeCard.status && (
                        <span className="text-[10px] text-emerald-400 font-semibold">{activeCard.status}</span>
                      )}
                    </div>
                    {activeCard.price && <p className="text-xs font-semibold text-white">{activeCard.price}</p>}
                    {activeCard.help && <p className="text-xs text-slate-300">{activeCard.help}</p>}
                    {activeCard.time && <p className="text-[11px] text-slate-400">{activeCard.time}</p>}
                  </div>
                )}
            </div>
          )}

          {/* Real-time Conversation Feed */}
          <div className="glass-panel rounded-3xl p-5 flex flex-col gap-3 min-h-[380px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white font-display">
                लाइव बातचीत (Shivani & You)
              </h2>
              {messages.length > 0 && (
                <button
                  onClick={() => {
                    setMessages([]);
                    handleInitiateGreeting();
                  }}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  रीसेट करें
                </button>
              )}
            </div>

            <div className="flex-1 space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-br from-indigo-950 via-cyan-950 to-slate-900 border border-cyan-500/40 text-white'
                        : 'glass-panel border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span>{m.sender === 'user' ? 'आप (किसान)' : 'शिवानी (मंडी सहायक)'}</span>
                      <span className="font-mono">{m.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-100">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (textInput.trim()) {
                  handleUserInput(textInput);
                  setTextInput('');
                }
              }}
              className="flex items-center gap-2 pt-2 border-t border-slate-800"
            >
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="बोलें या यहाँ हिंदी/हिंग्लिश में टाइप करें..."
                className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!textInput.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold transition-all disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={health.apiKeyConfigured ? 'configured' : ''}
        sttModel={health.sttModel}
        ttsModel={health.ttsModel}
        ttsVoice="Shivani"
        language={health.language}
        fallbackMode={health.fallbackMode}
        llmProvider={health.llmProvider || 'groq'}
        llmApiKey={health.llmConfigured ? 'configured' : ''}
        llmModel={health.llmModel || 'llama-3.3-70b-versatile'}
        onSave={async (cfg) => {
          await updateConfig(cfg);
          await loadHealth();
        }}
      />
    </div>
  );
}

export default App;
