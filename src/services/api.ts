export interface HealthResponse {
  status: string;
  apiKeyConfigured: boolean;
  apiKeyMasked: string | null;
  sttModel: string;
  ttsModel: string;
  ttsVoice: string;
  language: string;
  fallbackMode: boolean;
  llmConfigured?: boolean;
  llmProvider?: string;
  llmModel?: string;
  llmMasked?: string | null;
  timestamp: string;
}

export interface STTResponse {
  engine: string;
  transcript: string;
  confidence: number;
  language: string;
  isCodeMixed?: boolean;
  codeMixRatio?: { hindi: number; english: number };
  apiNotice?: string;
}

export interface ChatResponse {
  reply: string;
  options?: string[];
  card?: Record<string, any>;
  engine?: string;
  intent?: string;
  entities?: Record<string, any>;
  detectedLang?: string;
  latencyMs: number;
}

export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend unavailable, using local fallback state', err);
    return {
      status: 'offline',
      apiKeyConfigured: false,
      apiKeyMasked: null,
      sttModel: 'prisma-v3.0',
      ttsModel: 'timbre-v3.0',
      ttsVoice: 'Shivani',
      language: 'indic-auto',
      fallbackMode: true,
      timestamp: new Date().toISOString(),
    };
  }
};

export const updateConfig = async (config: {
  apiKey?: string;
  sttModel?: string;
  ttsModel?: string;
  ttsVoice?: string;
  language?: string;
  forceFallback?: boolean;
  llmProvider?: string;
  llmApiKey?: string;
  llmModel?: string;
}) => {
  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to update config', err);
    return { success: false };
  }
};

export const transcribeAudio = async (
  audioBlob: Blob,
  language: string = 'indic-auto'
): Promise<STTResponse> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice.wav');
    formData.append('language', language);

    const res = await fetch('/api/stt', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('STT fetch failed', e);
  }

  return {
    engine: 'client-detector',
    transcript: '',
    confidence: 0,
    language,
    apiNotice: 'Audio transcription failed or was empty',
  };
};

export const chatWithCopilot = async (message: string, domain: string): Promise<ChatResponse> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, domain }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Chat request failed', e);
  }

  // Client side fallback rule
  return {
    reply: `नमस्ते! आपका प्रश्न "${message}" दर्ज हुआ। मैं आपकी पूरी सहायता करूँगा।`,
    intent: 'general_assistance',
    entities: { status: 'fallback_active' },
    detectedLang: 'hi-IN (Hinglish)',
    latencyMs: 140,
  };
};

export const synthesizeSpeech = async (
  text: string,
  voice: string = 'Nalini',
  model: string = 'timbre-v3.0',
  language: string = 'hi-IN'
): Promise<{ audioUrl?: string; useBrowserSpeech?: boolean }> => {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice, model, language }),
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('audio') || contentType.includes('octet-stream')) {
        const blob = await res.blob();
        return { audioUrl: URL.createObjectURL(blob) };
      }

      const data = await res.json();
      if (data.audioBase64) {
        return { audioUrl: `data:audio/${data.format || 'wav'};base64,${data.audioBase64}` };
      }

      if (data.useBrowserTTS) {
        return { useBrowserSpeech: true };
      }
    }
  } catch (e) {
    console.warn('TTS server request failed, defaulting to browser speech synthesis', e);
  }

  return { useBrowserSpeech: true };
};

// Browser speech synthesis fallback with natural Hindi/Indian English voice selection
export const playBrowserSpeech = (text: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  // Try to find an Indian voice or Hindi voice
  const indicVoice = voices.find(
    (v) =>
      v.lang.includes('hi') ||
      v.lang.includes('IN') ||
      v.name.includes('India') ||
      v.name.includes('Hindi') ||
      v.name.includes('Lekha') ||
      v.name.includes('Veena')
  );

  if (indicVoice) {
    utterance.voice = indicVoice;
  }
  utterance.rate = 1.0;
  utterance.pitch = 1.05;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
};
