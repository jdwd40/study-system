import type { ReactElement } from 'react';
import type { ArtScene } from '../lib/courseArt';

/**
 * Illustrated course scenes. Each is a hand-drawn SVG on a 320×180 canvas in
 * one line-and-wash style: thin ink lines in the course accent, soft tint
 * fills, one warm secondary colour. All colours come from the surrounding
 * `.course-ident` tokens so every scene works in light and dark.
 *
 * Decorative: aria-hidden, with the course title always adjacent in the DOM.
 */

const INK = 'var(--course-accent)';
const WASH = 'var(--course-accent-soft)';
const SECOND = 'var(--course-second)';
const PAPER = 'var(--surface)';

/* ---------- Bronze Age: eastern Mediterranean map with trade routes ---------- */
function MapScene() {
  return (
    <g>
      <rect width="320" height="180" fill={PAPER} />
      <rect width="320" height="180" fill={SECOND} opacity="0.14" />
      {/* sea texture */}
      <g stroke={SECOND} strokeWidth="0.7" opacity="0.4" fill="none">
        {[70, 90, 110, 130, 150].map((y) => (
          <path key={y} d={`M 0 ${y} q 10 -3 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`} />
        ))}
      </g>
      {/* landmasses: Greece (left), Anatolia (top), Levant (right), Egypt (bottom right) */}
      <g fill={WASH} stroke={INK} strokeWidth="1.1" strokeLinejoin="round">
        <path d="M -4 -4 H 72 L 66 14 L 74 26 L 60 40 L 70 54 L 56 66 L 40 70 L 30 86 L 14 80 L 4 92 L -4 92 Z" />
        <path d="M 60 -4 H 324 V 36 L 300 44 L 282 58 L 260 54 L 236 62 L 214 58 L 192 66 L 170 62 L 150 70 L 128 64 L 110 54 L 92 46 L 80 30 Z" />
        <path d="M 324 36 V 184 H 300 L 296 160 L 304 130 L 298 104 L 304 84 L 296 64 Z" />
        <path d="M 196 184 L 204 164 L 222 156 L 246 160 L 262 150 L 284 156 L 300 150 L 304 184 Z" />
        {/* Cyprus, Crete, Rhodes */}
        <path d="M 226 90 L 240 84 L 258 86 L 266 92 L 250 98 L 234 100 Z" />
        <path d="M 72 128 L 90 122 L 112 124 L 128 130 L 110 136 L 88 136 Z" />
        <path d="M 148 108 L 156 104 L 162 110 L 154 114 Z" />
      </g>
      {/* Nile and delta */}
      <g stroke={SECOND} strokeWidth="1.2" fill="none" opacity="0.9">
        <path d="M 270 184 C 272 172 268 166 274 156 M 274 156 L 262 150 M 274 156 L 286 152" />
      </g>
      {/* trade routes */}
      <g stroke={SECOND} strokeWidth="1.1" fill="none" strokeDasharray="3 3" opacity="0.95">
        <path d="M 44 48 C 70 80 80 110 100 128" />
        <path d="M 100 128 C 150 140 200 120 240 94" />
        <path d="M 240 94 C 260 84 276 76 292 70" />
        <path d="M 240 94 C 250 120 266 140 274 156" />
        <path d="M 292 70 C 300 100 296 130 274 156" />
        <path d="M 140 24 C 170 40 200 48 240 94" />
      </g>
      {/* palace cities */}
      <g fill={INK}>
        {[[44, 48], [100, 128], [240, 94], [292, 70], [274, 156], [140, 24], [176, 42]].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="3.2" fill={PAPER} stroke={INK} strokeWidth="1.2" />
            <circle cx={x} cy={y} r="1.3" />
          </g>
        ))}
      </g>
      {/* ship */}
      <g stroke={INK} strokeWidth="1.1" fill={PAPER} strokeLinejoin="round">
        <path d="M 160 126 L 198 126 L 190 134 L 168 134 Z" />
        <path d="M 180 126 V 108 M 180 108 L 194 120 L 180 120 Z" fill={SECOND} />
      </g>
      {/* compass rose */}
      <g transform="translate(34 150)" stroke={INK} strokeWidth="1" fill={PAPER}>
        <circle r="13" fill="none" opacity="0.6" />
        <path d="M 0 -14 L 3 0 L 0 14 L -3 0 Z" fill={INK} />
        <path d="M -14 0 L 0 -3 L 14 0 L 0 3 Z" fill={SECOND} />
      </g>
    </g>
  );
}

/* ---------- Industrial Revolution: beam engine, flywheel, chimneys, timeline ---------- */
function EngineScene() {
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      {/* chimneys and smoke */}
      <g stroke={INK} strokeWidth="1" fill={PAPER}>
        <rect x="236" y="38" width="10" height="92" />
        <rect x="262" y="52" width="8" height="78" />
        <rect x="284" y="30" width="12" height="100" />
        <path d="M 196 130 L 196 100 L 212 92 L 228 100 L 228 130 Z" />
        <path d="M 228 130 L 228 104 L 244 96 L 260 104 L 260 130 Z" />
        <path d="M 260 130 L 260 104 L 276 96 L 292 104 L 292 130 Z" />
        <path d="M 292 130 L 292 104 L 308 96 L 324 104 L 324 130 Z" />
      </g>
      <g stroke={INK} strokeWidth="1" fill="none" opacity="0.45">
        <path d="M 241 36 c -6 -10 4 -14 0 -24 c -4 -8 6 -12 2 -20" />
        <path d="M 290 28 c -8 -8 4 -12 -2 -22 c -5 -8 7 -12 3 -20" />
      </g>
      {/* ground / floor */}
      <line x1="0" y1="130" x2="320" y2="130" stroke={INK} strokeWidth="1.2" />
      {/* engine house pillar */}
      <g stroke={INK} strokeWidth="1.2" fill={PAPER} strokeLinejoin="round">
        <path d="M 110 130 L 118 60 L 134 60 L 142 130 Z" />
        <rect x="104" y="124" width="44" height="6" />
      </g>
      {/* beam pivoting on the pillar */}
      <g stroke={INK} strokeWidth="1.4" fill={PAPER} strokeLinejoin="round">
        <path d="M 40 70 L 126 54 L 212 68 L 212 74 L 126 62 L 40 78 Z" />
        <circle cx="126" cy="58" r="4" fill={SECOND} />
      </g>
      {/* cylinder + piston on the left */}
      <g stroke={INK} strokeWidth="1.2" fill={PAPER}>
        <line x1="44" y1="76" x2="44" y2="104" />
        <rect x="30" y="98" width="28" height="32" />
        <rect x="26" y="96" width="36" height="4" fill={INK} />
      </g>
      {/* connecting rod + flywheel on the right */}
      <g stroke={INK} strokeWidth="1.2" fill="none">
        <line x1="210" y1="72" x2="188" y2="104" />
        <circle cx="178" cy="106" r="24" fill={PAPER} />
        <circle cx="178" cy="106" r="18" />
        <circle cx="178" cy="106" r="3" fill={SECOND} />
        {[0, 45, 90, 135].map((a) => (
          <line key={a} x1={178 + 18 * Math.cos((a * Math.PI) / 180)} y1={106 + 18 * Math.sin((a * Math.PI) / 180)} x2={178 - 18 * Math.cos((a * Math.PI) / 180)} y2={106 - 18 * Math.sin((a * Math.PI) / 180)} />
        ))}
      </g>
      {/* small gear */}
      <g transform="translate(74 118)" stroke={INK} strokeWidth="1" fill={PAPER}>
        <circle r="7" />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={8 * Math.cos((a * Math.PI) / 180)} y1={8 * Math.sin((a * Math.PI) / 180)} x2={-8 * Math.cos((a * Math.PI) / 180)} y2={-8 * Math.sin((a * Math.PI) / 180)} strokeWidth="2.2" />
        ))}
        <circle r="2" fill={SECOND} />
      </g>
      {/* timeline rule */}
      <g stroke={INK} strokeWidth="1" opacity="0.85">
        <line x1="24" y1="156" x2="296" y2="156" />
        {[24, 58, 92, 126, 160, 194, 228, 262, 296].map((x, i) => (
          <line key={x} x1={x} y1={i % 2 === 0 ? 150 : 153} x2={x} y2="159" />
        ))}
      </g>
      <g fill={SECOND}>
        <circle cx="92" cy="156" r="3" />
        <circle cx="194" cy="156" r="3" />
      </g>
    </g>
  );
}

/* ---------- Computer Architecture: chip-die blueprint ---------- */
function DieScene() {
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      {/* blueprint grid */}
      <g stroke={INK} strokeWidth="0.4" opacity="0.18">
        {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="180" />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="320" y2={i * 20} />)}
      </g>
      {/* package pins */}
      <g stroke={INK} strokeWidth="1.4" opacity="0.8">
        {Array.from({ length: 9 }, (_, i) => <line key={`t${i}`} x1={96 + i * 16} y1="22" x2={96 + i * 16} y2="34" />)}
        {Array.from({ length: 9 }, (_, i) => <line key={`b${i}`} x1={96 + i * 16} y1="146" x2={96 + i * 16} y2="158" />)}
        {Array.from({ length: 6 }, (_, i) => <line key={`l${i}`} x1="68" y1={50 + i * 16} x2="80" y2={50 + i * 16} />)}
        {Array.from({ length: 6 }, (_, i) => <line key={`r${i}`} x1="240" y1={50 + i * 16} x2="252" y2={50 + i * 16} />)}
      </g>
      {/* die */}
      <g stroke={INK} strokeWidth="1.3" fill={PAPER}>
        <rect x="80" y="34" width="160" height="112" rx="3" />
        {/* cores */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={90 + (i % 2) * 36} y={44 + Math.floor(i / 2) * 36} width="30" height="30" rx="2" fill={WASH} />
            <rect x={96 + (i % 2) * 36} y={50 + Math.floor(i / 2) * 36} width="18" height="18" rx="1" fill="none" strokeWidth="0.8" />
          </g>
        ))}
        {/* L3 cache */}
        <rect x="90" y="118" width="66" height="18" rx="2" fill={WASH} />
        {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={100 + i * 10} y1="118" x2={100 + i * 10} y2="136" strokeWidth="0.6" />)}
        {/* GPU / accelerator block */}
        <rect x="166" y="44" width="64" height="48" rx="2" fill={WASH} />
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={172 + (i % 4) * 14} y={50 + Math.floor(i / 4) * 12} width="10" height="8" fill="none" strokeWidth="0.6" />
        ))}
        {/* memory controller + IO */}
        <rect x="166" y="100" width="30" height="36" rx="2" fill={WASH} />
        <rect x="200" y="100" width="30" height="36" rx="2" fill={WASH} />
      </g>
      {/* bus lines */}
      <g stroke={SECOND} strokeWidth="1.3" fill="none">
        <path d="M 160 90 H 166" />
        <path d="M 130 112 V 118 M 130 96 V 112 H 160 V 108 H 166" />
        <path d="M 182 92 V 100 M 214 92 V 100" />
        <path d="M 90 110 H 126" strokeDasharray="2 2" />
      </g>
      {/* dimension lines */}
      <g stroke={INK} strokeWidth="0.8" opacity="0.7">
        <line x1="80" y1="166" x2="240" y2="166" />
        <line x1="80" y1="162" x2="80" y2="170" />
        <line x1="240" y1="162" x2="240" y2="170" />
        <line x1="262" y1="34" x2="262" y2="146" />
        <line x1="258" y1="34" x2="266" y2="34" />
        <line x1="258" y1="146" x2="266" y2="146" />
      </g>
    </g>
  );
}

/* ---------- Software Systems Engineering: layered system blueprint ---------- */
function BlueprintScene() {
  const box = (x: number, y: number, w: number, h: number, fill = PAPER) => <rect x={x} y={y} width={w} height={h} rx="3" fill={fill} />;
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      <g stroke={INK} strokeWidth="0.4" opacity="0.16">
        {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="180" />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2="320" y2={i * 20} />)}
      </g>
      {/* system boundary */}
      <rect x="62" y="48" width="236" height="114" rx="6" fill="none" stroke={INK} strokeWidth="1" strokeDasharray="4 3" opacity="0.8" />
      <g stroke={INK} strokeWidth="1.2">
        {/* clients */}
        {box(20, 18, 28, 18)}
        {box(20, 44, 28, 18)}
        {box(20, 70, 28, 18)}
        {/* gateway */}
        {box(84, 36, 40, 26, WASH)}
        {/* services */}
        {box(150, 58, 36, 24)}
        {box(150, 92, 36, 24)}
        {box(150, 126, 36, 24)}
        {/* queue */}
        {box(206, 92, 48, 14, WASH)}
        {[214, 226, 238].map((x) => <line key={x} x1={x} y1="92" x2={x} y2="106" strokeWidth="0.8" />)}
        {/* databases */}
        <g fill={PAPER}>
          <path d="M 262 52 a 14 5 0 0 1 28 0 v 22 a 14 5 0 0 1 -28 0 Z" />
          <path d="M 262 52 a 14 5 0 0 0 28 0" fill="none" />
          <path d="M 262 128 a 14 5 0 0 1 28 0 v 22 a 14 5 0 0 1 -28 0 Z" />
          <path d="M 262 128 a 14 5 0 0 0 28 0" fill="none" />
        </g>
        {/* worker */}
        {box(216, 126, 28, 20)}
      </g>
      {/* flows */}
      <g stroke={SECOND} strokeWidth="1.2" fill="none">
        <path d="M 48 27 C 66 27 70 49 84 49" />
        <path d="M 48 53 H 84" />
        <path d="M 48 79 C 66 79 70 49 84 49" />
        <path d="M 124 49 C 138 49 138 70 150 70" />
        <path d="M 124 49 C 138 49 138 104 150 104" />
        <path d="M 124 49 C 140 49 140 138 150 138" />
        <path d="M 186 70 C 240 70 250 64 262 64" />
        <path d="M 186 104 H 206" />
        <path d="M 254 99 C 262 99 262 136 262 136" strokeDasharray="3 2" />
        <path d="M 186 138 H 216" />
      </g>
      <g fill={SECOND}>
        <circle cx="84" cy="49" r="2" />
        <circle cx="150" cy="70" r="2" />
        <circle cx="150" cy="104" r="2" />
        <circle cx="150" cy="138" r="2" />
        <circle cx="262" cy="64" r="2" />
      </g>
      {/* health/metrics sparkline in the corner */}
      <polyline points="232,30 244,24 254,34 266,20 278,28 290,18" fill="none" stroke={INK} strokeWidth="1.2" />
    </g>
  );
}

/* ---------- AI Engineering: luminous model graph ---------- */
function ModelScene() {
  const layers = [
    { x: 92, ys: [50, 80, 110, 140] },
    { x: 160, ys: [40, 68, 96, 124, 152] },
    { x: 228, ys: [50, 80, 110, 140] },
  ];
  const edges: ReactElement[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const y1 of layers[l]!.ys) for (const y2 of layers[l + 1]!.ys) {
      edges.push(<line key={`${l}-${y1}-${y2}`} x1={layers[l]!.x} y1={y1} x2={layers[l + 1]!.x} y2={y2} />);
    }
  }
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      {/* soft glow halo */}
      <circle cx="160" cy="96" r="70" fill={PAPER} opacity="0.5" />
      <circle cx="160" cy="96" r="46" fill={PAPER} opacity="0.5" />
      <g stroke={INK} strokeWidth="0.6" opacity="0.35">{edges}</g>
      {/* attention arcs */}
      <g stroke={SECOND} strokeWidth="1.4" fill="none" opacity="0.95">
        <path d="M 92 80 C 130 50 190 50 228 80" />
        <path d="M 92 110 C 126 150 194 150 228 110" />
        <path d="M 160 68 C 180 80 180 112 160 124" />
      </g>
      {/* input tokens → */}
      <g stroke={INK} strokeWidth="1" fill={PAPER}>
        {[52, 70, 88, 106, 124].map((y) => <rect key={y} x="30" y={y} width="20" height="12" rx="2" />)}
        <path d="M 50 94 H 72" strokeDasharray="2 2" fill="none" />
      </g>
      {/* output */}
      <g stroke={INK} strokeWidth="1" fill={PAPER}>
        <path d="M 248 96 H 268" strokeDasharray="2 2" fill="none" />
        <rect x="270" y="78" width="30" height="36" rx="4" />
        <line x1="276" y1="88" x2="294" y2="88" />
        <line x1="276" y1="96" x2="290" y2="96" />
        <line x1="276" y1="104" x2="286" y2="104" />
      </g>
      {/* nodes */}
      <g stroke={INK} strokeWidth="1.2">
        {layers.flatMap((l) => l.ys.map((y) => <circle key={`${l.x}-${y}`} cx={l.x} cy={y} r="6" fill={PAPER} />))}
      </g>
      <g fill={SECOND}>
        <circle cx="160" cy="96" r="3" />
        <circle cx="92" cy="80" r="2.5" />
        <circle cx="228" cy="110" r="2.5" />
      </g>
    </g>
  );
}

/* ---------- AI Automation: pipelines, triggers, approval gate ---------- */
function PipelineScene() {
  const node = (x: number, y: number, fill = PAPER) => <rect x={x - 14} y={y - 11} width="28" height="22" rx="5" fill={fill} />;
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      {/* faint dot grid */}
      <g fill={INK} opacity="0.14">
        {Array.from({ length: 16 }, (_, i) => Array.from({ length: 9 }, (_, j) => <circle key={`${i}-${j}`} cx={i * 20 + 10} cy={j * 20 + 10} r="0.9" />))}
      </g>
      {/* pipes */}
      <g stroke={INK} strokeWidth="1.6" fill="none" strokeLinejoin="round">
        <path d="M 44 90 H 90" />
        <path d="M 118 90 H 150" />
        <path d="M 178 90 H 198" />
        <path d="M 198 90 L 212 74 L 226 90 L 212 106 Z" fill={PAPER} />
        <path d="M 226 90 H 246" />
        <path d="M 212 106 V 140 H 246" />
        <path d="M 104 101 V 140 H 150" />
        <path d="M 164 140 H 178" strokeDasharray="3 3" />
      </g>
      {/* moving packets */}
      <g fill={SECOND}>
        <circle cx="66" cy="90" r="2.6" />
        <circle cx="134" cy="90" r="2.6" />
        <circle cx="236" cy="90" r="2.6" />
        <circle cx="212" cy="124" r="2.6" />
        <circle cx="126" cy="140" r="2.6" />
      </g>
      {/* trigger */}
      <g stroke={INK} strokeWidth="1.4">
        <circle cx="32" cy="90" r="14" fill={PAPER} />
        <path d="M 34 80 L 27 92 H 33 L 30 100 L 38 88 H 32 Z" fill={SECOND} strokeWidth="0.8" />
      </g>
      {/* nodes */}
      <g stroke={INK} strokeWidth="1.3">
        {node(104, 90, WASH)}
        {node(164, 90)}
        {node(164, 140, WASH)}
        {/* approval check inside the gate */}
        <path d="M 205 90 L 210 95 L 220 84" fill="none" stroke={SECOND} strokeWidth="2" strokeLinecap="round" />
        {/* destinations: mail, table, database */}
        <rect x="248" y="78" width="28" height="22" rx="4" fill={PAPER} />
        <path d="M 250 80 L 262 90 L 274 80" fill="none" strokeWidth="1" />
        <rect x="248" y="128" width="28" height="22" rx="4" fill={PAPER} />
        <path d="M 248 136 H 276 M 248 143 H 276 M 258 128 V 150 M 266 128 V 150" strokeWidth="0.8" />
        <path d="M 290 76 a 11 4 0 0 1 22 0 v 26 a 11 4 0 0 1 -22 0 Z" fill={PAPER} />
        <path d="M 290 76 a 11 4 0 0 0 22 0" fill="none" />
      </g>
      {/* gear accents on the top node */}
      <g transform="translate(104 90)" stroke={INK} strokeWidth="1" fill="none">
        <circle r="5" />
        {[0, 60, 120].map((a) => (
          <line key={a} x1={7 * Math.cos((a * Math.PI) / 180)} y1={7 * Math.sin((a * Math.PI) / 180)} x2={-7 * Math.cos((a * Math.PI) / 180)} y2={-7 * Math.sin((a * Math.PI) / 180)} strokeWidth="2" />
        ))}
        <circle r="2" fill={SECOND} stroke="none" />
      </g>
      {/* schedule clock on the lower node */}
      <g transform="translate(164 140)" stroke={INK} strokeWidth="1" fill="none">
        <circle r="6" />
        <path d="M 0 -4 V 0 H 3" />
      </g>
      <g stroke={INK} strokeWidth="1" fill="none"><path d="M 156 86 h 16 M 156 90 h 12 M 156 94 h 14" /></g>
    </g>
  );
}

/* ---------- Writing: desk with manuscript, quill, inkwell and lamp ---------- */
function DeskScene() {
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      {/* lamp glow */}
      <path d="M 70 24 L 10 180 H 150 Z" fill={PAPER} opacity="0.55" />
      {/* desk edge */}
      <path d="M 0 150 H 320" stroke={INK} strokeWidth="1.4" />
      <rect x="0" y="150" width="320" height="30" fill={PAPER} opacity="0.5" />
      {/* lamp */}
      <g stroke={INK} strokeWidth="1.2" fill={PAPER}>
        <path d="M 46 24 H 94 L 104 44 H 36 Z" fill={SECOND} />
        <line x1="70" y1="44" x2="70" y2="150" />
        <path d="M 70 150 l -16 0" />
      </g>
      {/* manuscript page, slightly rotated */}
      <g transform="rotate(-4 180 110)">
        <rect x="120" y="58" width="112" height="90" rx="2" fill={PAPER} stroke={INK} strokeWidth="1.1" />
        <g stroke={INK} strokeWidth="0.9" fill="none" opacity="0.8">
          {[72, 82, 92, 102, 112, 122, 132].map((y, i) => (
            <path key={y} d={`M 130 ${y} q 6 -3 12 0 t 12 0 t 12 0 t 12 0 t 12 0 ${i % 3 === 1 ? '' : 't 12 0'} ${i === 6 ? '' : 't 8 0'}`} />
          ))}
        </g>
        <line x1="130" y1="66" x2="166" y2="66" stroke={SECOND} strokeWidth="1.6" />
      </g>
      {/* quill */}
      <g stroke={INK} strokeWidth="1.2" fill={PAPER} strokeLinejoin="round">
        <path d="M 236 132 C 250 110 266 84 292 58 C 282 90 268 112 246 138 Z" />
        <path d="M 236 132 L 230 140" />
        <path d="M 252 118 L 272 94 M 258 112 C 268 108 276 98 282 86" fill="none" strokeWidth="0.8" />
      </g>
      {/* inkwell */}
      <g stroke={INK} strokeWidth="1.2" fill={PAPER}>
        <path d="M 262 134 h 30 l 4 16 h -38 Z" />
        <rect x="270" y="126" width="14" height="8" rx="1" fill={SECOND} />
      </g>
      {/* books */}
      <g stroke={INK} strokeWidth="1.1" fill={PAPER}>
        <rect x="26" y="120" width="52" height="10" rx="1" fill={WASH} />
        <rect x="30" y="110" width="46" height="10" rx="1" />
        <rect x="24" y="130" width="56" height="10" rx="1" fill={SECOND} />
        <line x1="34" y1="135" x2="70" y2="135" strokeWidth="0.8" opacity="0.6" />
      </g>
      {/* cup */}
      <g stroke={INK} strokeWidth="1.1" fill={PAPER}>
        <path d="M 96 128 h 20 v 16 a 6 6 0 0 1 -6 6 h -8 a 6 6 0 0 1 -6 -6 Z" />
        <path d="M 116 132 a 5 5 0 0 1 0 10" fill="none" />
        <path d="M 102 122 q 2 -3 0 -6 M 110 122 q 2 -3 0 -6" fill="none" opacity="0.5" />
      </g>
    </g>
  );
}

/* ---------- Fallback: atlas contours and compass ---------- */
function AtlasScene() {
  return (
    <g>
      <rect width="320" height="180" fill={WASH} />
      <g stroke={INK} strokeWidth="1" fill="none" opacity="0.55">
        <path d="M 40 150 C 80 90 160 110 200 70 C 230 40 280 50 320 30" />
        <path d="M 20 170 C 70 110 160 130 210 90 C 240 64 290 70 320 54" />
        <path d="M 60 130 C 100 80 170 90 200 50 C 220 26 270 26 300 10" />
      </g>
      <g transform="translate(236 118)" stroke={INK} strokeWidth="1.2" fill={PAPER}>
        <circle r="28" />
        <circle r="22" fill="none" opacity="0.6" />
        <path d="M 0 -26 L 5 0 L 0 26 L -5 0 Z" fill={INK} />
        <path d="M -26 0 L 0 -5 L 26 0 L 0 5 Z" fill={SECOND} />
        <circle r="2.5" fill={PAPER} />
      </g>
      <g fill={INK}>
        <circle cx="70" cy="60" r="3" />
        <circle cx="140" cy="100" r="3" />
        <circle cx="110" cy="40" r="2" opacity="0.6" />
      </g>
      <path d="M 70 60 C 100 70 120 90 140 100" stroke={SECOND} strokeWidth="1.1" strokeDasharray="3 3" fill="none" />
    </g>
  );
}

const SCENES: Record<ArtScene, () => ReactElement> = {
  map: MapScene,
  engine: EngineScene,
  die: DieScene,
  blueprint: BlueprintScene,
  model: ModelScene,
  pipeline: PipelineScene,
  desk: DeskScene,
  atlas: AtlasScene,
};

/**
 * Course scene at any size: fills its box (16:9 canvas, `slice` so a wide
 * banner crops top/bottom rather than letterboxing). Place it inside an
 * element with the `course-ident` class so its colour tokens resolve.
 */
export function CourseScene({ scene, className = 'course-scene' }: { scene: ArtScene; className?: string }) {
  const Scene = SCENES[scene];
  return (
    <svg className={className} viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <Scene />
    </svg>
  );
}
