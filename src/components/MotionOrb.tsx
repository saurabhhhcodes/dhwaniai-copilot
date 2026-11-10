import React, { useEffect, useRef } from 'react';

export type AgentState = 'idle' | 'listening' | 'processing' | 'speaking';
export type VisualizerMode = 'orb' | 'radial' | 'wave';

interface MotionOrbProps {
  state: AgentState;
  audioLevel: number; // 0.0 to 1.0 (from Web Audio API analyser or simulation)
  mode?: VisualizerMode;
  engineName?: string;
  onClickOrb?: () => void;
}

export const MotionOrb: React.FC<MotionOrbProps> = ({
  state,
  audioLevel,
  mode = 'orb',
  engineName = 'Prisma v3.0',
  onClickOrb,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle swarm initialization
    const particles = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * width * 0.7,
      y: (Math.random() - 0.5) * height * 0.7,
      radius: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 0.015 + 0.005,
      angle: Math.random() * Math.PI * 2,
      orbitRadius: Math.random() * 110 + 60,
      color: ['#00f2fe', '#9d4edd', '#4facfe', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      phaseRef.current += 0.03 + (state === 'speaking' || state === 'listening' ? audioLevel * 0.08 : 0);
      const phase = phaseRef.current;
      const centerX = width / 2;
      const centerY = height / 2;

      // Base radius calculation with audio reactivity
      const baseRadius = Math.min(width, height) * 0.22;
      const dynamicBoost = (state === 'listening' || state === 'speaking') ? audioLevel * 55 : (state === 'processing' ? Math.sin(phase * 4) * 8 : Math.sin(phase) * 6);
      const currentRadius = baseRadius + dynamicBoost;

      // =====================================
      // 1. NEURAL ORB MODE (Fluid Glow Blob)
      // =====================================
      if (mode === 'orb') {
        // Outer Ambient Aurora Halo
        const haloGrad = ctx.createRadialGradient(
          centerX, centerY, currentRadius * 0.4,
          centerX, centerY, currentRadius * 2.2
        );
        if (state === 'listening') {
          haloGrad.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
          haloGrad.addColorStop(0.5, 'rgba(157, 78, 221, 0.25)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (state === 'speaking') {
          haloGrad.addColorStop(0, 'rgba(79, 172, 254, 0.45)');
          haloGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.25)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (state === 'processing') {
          haloGrad.addColorStop(0, 'rgba(157, 78, 221, 0.5)');
          haloGrad.addColorStop(0.5, 'rgba(236, 72, 153, 0.3)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          // Idle
          haloGrad.addColorStop(0, 'rgba(0, 242, 254, 0.2)');
          haloGrad.addColorStop(0.6, 'rgba(157, 78, 221, 0.1)');
          haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Fluid Multi-point Morphing Blob
        const points = 16;
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const waveFactor = Math.sin(angle * 4 + phase * 2) * 12 + Math.cos(angle * 3 - phase) * 8;
          const r = currentRadius + waveFactor * (1 + audioLevel * 1.5);
          const px = centerX + Math.cos(angle) * r;
          const py = centerY + Math.sin(angle) * r;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.closePath();

        // Inner glowing gradient
        const coreGrad = ctx.createRadialGradient(
          centerX - currentRadius * 0.25, centerY - currentRadius * 0.25, 10,
          centerX, centerY, currentRadius
        );
        if (state === 'listening') {
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.3, '#00f2fe');
          coreGrad.addColorStop(0.7, '#4facfe');
          coreGrad.addColorStop(1, '#9d4edd');
        } else if (state === 'speaking') {
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.3, '#4facfe');
          coreGrad.addColorStop(0.6, '#00f2fe');
          coreGrad.addColorStop(1, '#f59e0b');
        } else if (state === 'processing') {
          coreGrad.addColorStop(0, '#ffffff');
          coreGrad.addColorStop(0.4, '#ec4899');
          coreGrad.addColorStop(0.8, '#9d4edd');
          coreGrad.addColorStop(1, '#3b82f6');
        } else {
          coreGrad.addColorStop(0, '#e0f2fe');
          coreGrad.addColorStop(0.4, '#00f2fe');
          coreGrad.addColorStop(0.8, '#6366f1');
          coreGrad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = coreGrad;
        ctx.shadowColor = state === 'speaking' ? '#f59e0b' : '#00f2fe';
        ctx.shadowBlur = 35 + audioLevel * 25;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Particle Swarm
        particles.forEach((p) => {
          p.angle += p.speed * (state === 'listening' || state === 'speaking' ? 2.5 : 1);
          const currentOrbit = p.orbitRadius + (state === 'speaking' ? audioLevel * 40 : 0);
          const px = centerX + Math.cos(p.angle) * currentOrbit;
          const py = centerY + Math.sin(p.angle) * currentOrbit;

          ctx.beginPath();
          ctx.arc(px, py, p.radius * (1 + audioLevel * 0.8), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = 0.65;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        });
      }

      // =====================================
      // 2. RADIAL CYBER SPECTRUM MODE
      // =====================================
      else if (mode === 'radial') {
        const bars = 64;
        const innerR = currentRadius * 0.75;
        for (let i = 0; i < bars; i++) {
          const angle = (i / bars) * Math.PI * 2;
          const barHeight = 8 + (Math.sin(i * 0.5 + phase * 3) * 0.5 + 0.5) * (30 + audioLevel * 90);

          const x1 = centerX + Math.cos(angle) * innerR;
          const y1 = centerY + Math.sin(angle) * innerR;
          const x2 = centerX + Math.cos(angle) * (innerR + barHeight);
          const y2 = centerY + Math.sin(angle) * (innerR + barHeight);

          ctx.strokeStyle = i % 2 === 0 ? '#00f2fe' : '#9d4edd';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerR * 0.85, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // =====================================
      // 3. CINEMATIC WAVE MODE
      // =====================================
      else if (mode === 'wave') {
        const waveLayers = [
          { color: 'rgba(0, 242, 254, 0.7)', speed: 1.0, freq: 0.02, amp: 45 },
          { color: 'rgba(157, 78, 221, 0.6)', speed: 1.4, freq: 0.03, amp: 35 },
          { color: 'rgba(245, 158, 11, 0.5)', speed: 0.8, freq: 0.015, amp: 55 },
        ];

        waveLayers.forEach((layer) => {
          ctx.beginPath();
          ctx.strokeStyle = layer.color;
          ctx.lineWidth = 3;
          for (let x = 0; x < width; x += 3) {
            const y = centerY + Math.sin(x * layer.freq + phase * layer.speed) * (layer.amp * (0.3 + audioLevel * 1.5));
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [state, audioLevel, mode]);

  const stateLabels: Record<AgentState, { text: string; color: string; badge: string }> = {
    idle: { text: 'Ready • Tap Mic to Talk', color: 'text-cyan-400', badge: 'bg-cyan-500/20 border-cyan-500/40' },
    listening: { text: 'Listening (Prisma v3.0)...', color: 'text-amber-400', badge: 'bg-amber-500/20 border-amber-500/50 animate-pulse' },
    processing: { text: 'Reasoning & Generating...', color: 'text-purple-400', badge: 'bg-purple-500/20 border-purple-500/50' },
    speaking: { text: 'Speaking (Timbre v3.0)', color: 'text-emerald-400', badge: 'bg-emerald-500/20 border-emerald-500/50' },
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[360px] md:h-[420px] select-none">
      {/* Dynamic Animated Canvas */}
      <canvas
        ref={canvasRef}
        onClick={onClickOrb}
        className="w-full h-full cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
      />

      {/* Center Interactive Pill Badge */}
      <div className="absolute bottom-6 flex flex-col items-center gap-2 pointer-events-none">
        <div className={`px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md flex items-center gap-2 transition-all ${stateLabels[state].badge}`}>
          <span className={`w-2 h-2 rounded-full ${state === 'listening' ? 'bg-amber-400 animate-ping' : state === 'speaking' ? 'bg-emerald-400 animate-bounce' : 'bg-cyan-400'}`} />
          <span className={stateLabels[state].color}>{stateLabels[state].text}</span>
          <span className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">{engineName}</span>
        </div>

        {/* Real-time Decibel / Audio Activity Bar */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="flex items-center gap-1 h-3 px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
            <span>Audio Flux:</span>
            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400 transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(8, audioLevel * 100))}%` }}
              />
            </div>
            <span>{Math.round(audioLevel * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
