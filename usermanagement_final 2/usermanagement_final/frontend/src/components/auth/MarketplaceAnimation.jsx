import React from 'react';
import { motion } from 'framer-motion';

export default function MarketplaceAnimation({ isTyping }) {
  return (
    <motion.div 
      style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <svg viewBox="0 0 800 600" style={{ width: '100%', height: 'auto', maxWidth: '36rem' }}>
        <defs>
          <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <motion.circle 
          cx="400" cy="300" r="160" 
          fill="#FF6321" 
          filter="blur(70px)"
          animate={{ 
            opacity: isTyping ? 0.25 : 0.05,
            scale: isTyping ? 1.1 : 1
          }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />

        {/* Floor Line */}
        <line x1="150" y1="480" x2="650" y2="480" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.2" strokeLinecap="round" />

        {/* Left: Stack of Academic Textbooks */}
        <g transform="translate(160, 400)">
          {/* Bottom Book */}
          <path d="M 0 60 L 140 60 L 150 40 L 10 40 Z" fill="#2563eb" />
          <path d="M 140 60 L 150 40 L 150 50 L 140 70 Z" fill="#1d4ed8" />
          <rect x="10" y="45" width="120" height="10" fill="#ffffff" opacity="0.8" />
          {/* Middle Book */}
          <motion.g animate={isTyping ? { y: [-2, 0, -2] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            <path d="M 10 40 L 130 40 L 140 20 L 20 20 Z" fill="#10b981" />
            <path d="M 130 40 L 140 20 L 140 30 L 130 50 Z" fill="#059669" />
            <rect x="20" y="25" width="100" height="10" fill="#ffffff" opacity="0.8" />
          </motion.g>
          {/* Top Book */}
          <motion.g animate={isTyping ? { y: [-4, 0, -4], rotate: [-1, 0, -1] } : {}} transition={{ duration: 2.2, repeat: Infinity }}>
            <path d="M 20 20 L 120 20 L 130 0 L 30 0 Z" fill="#f59e0b" />
            <path d="M 120 20 L 130 0 L 130 10 L 120 30 Z" fill="#d97706" />
            <rect x="30" y="5" width="80" height="10" fill="#ffffff" opacity="0.8" />
            {/* Bookmark */}
            <path d="M 50 20 L 65 20 L 65 45 L 57.5 40 L 50 45 Z" fill="#ef4444" />
          </motion.g>
        </g>

        {/* Right: Shopping Cart */}
        <motion.g 
          transform="translate(520, 360)"
          animate={isTyping ? { x: [-5, 5, -5] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Cart Frame */}
          <path d="M 0 20 L 25 20 L 45 90 L 120 90 L 140 30 L 30 30" fill="none" stroke="#FF6321" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="40" y1="50" x2="130" y2="50" stroke="#FF6321" strokeWidth="4" />
          <line x1="42" y1="70" x2="125" y2="70" stroke="#FF6321" strokeWidth="4" />
          <line x1="65" y1="30" x2="60" y2="90" stroke="#FF6321" strokeWidth="4" />
          <line x1="95" y1="30" x2="90" y2="90" stroke="#FF6321" strokeWidth="4" />
          {/* Wheels */}
          <circle cx="55" cy="110" r="12" fill="#cbd5e1" />
          <circle cx="55" cy="110" r="6" fill="#475569" />
          <circle cx="110" cy="110" r="12" fill="#cbd5e1" />
          <circle cx="110" cy="110" r="6" fill="#475569" />
          
          {/* Box inside cart */}
          <motion.g animate={isTyping ? { y: [-5, 0, -5] } : {}} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}>
            <path d="M 50 25 L 100 25 L 110 60 L 45 60 Z" fill="#d97706" />
            <path d="M 50 25 L 100 25 L 90 10 L 60 10 Z" fill="#f59e0b" />
            <rect x="65" y="35" width="20" height="15" fill="#fcd34d" opacity="0.5" />
          </motion.g>
        </motion.g>

        {/* Center: Smartphone/Tablet Marketplace UI */}
        <g transform="translate(300, 120)">
          {/* Device Body */}
          <rect x="0" y="0" width="200" height="360" rx="24" fill="#94a3b8" />
          <rect x="8" y="8" width="184" height="344" rx="18" fill="url(#phoneGrad)" />
          
          {/* App Header */}
          <path d="M 8 26 L 192 26 L 192 60 L 8 60 Z" fill="#FF6321" />
          <circle cx="30" cy="43" r="8" fill="#ffffff" opacity="0.8" />
          <rect x="50" y="39" width="80" height="8" rx="4" fill="#ffffff" opacity="0.8" />
          <rect x="150" y="37" width="24" height="12" rx="4" fill="#ffffff" opacity="0.4" />

          {/* Search Bar */}
          <rect x="20" y="75" width="160" height="24" rx="12" fill="#334155" />
          <circle cx="35" cy="87" r="5" fill="none" stroke="#94a3b8" strokeWidth="2" />
          <line x1="39" y1="91" x2="44" y2="96" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <rect x="50" y="85" width="60" height="4" rx="2" fill="#64748b" />

          {/* Product Grid */}
          <motion.g animate={isTyping ? { y: [-2, 2, -2] } : {}} transition={{ duration: 2, repeat: Infinity }}>
            {/* Product 1 */}
            <rect x="20" y="115" width="75" height="90" rx="8" fill="url(#cardGrad)" />
            <rect x="28" y="123" width="59" height="45" rx="4" fill="#475569" />
            <rect x="28" y="176" width="40" height="6" rx="3" fill="#cbd5e1" />
            <rect x="28" y="188" width="25" height="8" rx="4" fill="#10b981" />
            
            {/* Product 2 */}
            <rect x="105" y="115" width="75" height="90" rx="8" fill="url(#cardGrad)" />
            <rect x="113" y="123" width="59" height="45" rx="4" fill="#475569" />
            <rect x="113" y="176" width="50" height="6" rx="3" fill="#cbd5e1" />
            <rect x="113" y="188" width="30" height="8" rx="4" fill="#10b981" />

            {/* Product 3 */}
            <rect x="20" y="215" width="75" height="90" rx="8" fill="url(#cardGrad)" />
            <rect x="28" y="223" width="59" height="45" rx="4" fill="#475569" />
            <rect x="28" y="276" width="45" height="6" rx="3" fill="#cbd5e1" />
            <rect x="28" y="288" width="20" height="8" rx="4" fill="#10b981" />

            {/* Product 4 */}
            <rect x="105" y="215" width="75" height="90" rx="8" fill="url(#cardGrad)" />
            <rect x="113" y="223" width="59" height="45" rx="4" fill="#475569" />
            <rect x="113" y="276" width="35" height="6" rx="3" fill="#cbd5e1" />
            <rect x="113" y="288" width="25" height="8" rx="4" fill="#10b981" />
          </motion.g>

          {/* Bottom Nav */}
          <path d="M 8 310 L 192 310 L 192 352 L 8 352 Z" fill="#1e293b" />
          <circle cx="40" cy="331" r="10" fill="#FF6321" />
          <circle cx="100" cy="331" r="8" fill="#475569" />
          <circle cx="160" cy="331" r="8" fill="#475569" />
        </g>

        {/* Floating Elements (Marketplace Icons) */}
        {isTyping && (
          <>
            <FloatingMarketIcon x={350} y={100} delay={0} type="coin" />
            <FloatingMarketIcon x={480} y={150} delay={0.3} type="tag" />
            <FloatingMarketIcon x={250} y={180} delay={0.6} type="box" />
            <FloatingMarketIcon x={420} y={80} delay={0.9} type="star" />
            <FloatingMarketIcon x={300} y={50} delay={1.2} type="coin" />
          </>
        )}
      </svg>
    </motion.div>
  );
}

function FloatingMarketIcon({ x, y, delay, type }) {
  return (
    <motion.g
      initial={{ opacity: 0, y: y, x: x, scale: 0.5 }}
      animate={{ 
        opacity: [0, 1, 0], 
        y: y - 120,
        x: x + (Math.random() * 60 - 30),
        scale: [0.5, 1.2, 0.8]
      }}
      transition={{ 
        duration: 2.5, 
        delay: delay, 
        repeat: Infinity,
        ease: "easeOut"
      }}
    >
      {type === 'coin' && (
        <g>
          <circle cx="0" cy="0" r="16" fill="#facc15" />
          <circle cx="0" cy="0" r="10" fill="none" stroke="#ca8a04" strokeWidth="2" />
          <text x="0" y="5" fontFamily="sans-serif" fontSize="14" fill="#ca8a04" textAnchor="middle" fontWeight="bold">$</text>
        </g>
      )}
      {type === 'tag' && (
        <g transform="rotate(-15)">
          <path d="M -10 -15 L 10 -15 L 15 5 L 0 20 L -15 5 Z" fill="#f43f5e" />
          <circle cx="0" cy="-8" r="3" fill="#ffffff" />
        </g>
      )}
      {type === 'box' && (
        <g>
          <path d="M -15 -10 L 0 -18 L 15 -10 L 15 10 L 0 18 L -15 10 Z" fill="#d97706" />
          <path d="M -15 -10 L 0 0 L 15 -10" fill="none" stroke="#fcd34d" strokeWidth="2" />
          <line x1="0" y1="0" x2="0" y2="18" stroke="#fcd34d" strokeWidth="2" />
        </g>
      )}
      {type === 'star' && (
        <path d="M 0 -15 L 4 -4 L 15 -4 L 6 3 L 10 14 L 0 7 L -10 14 L -6 3 L -15 -4 L -4 -4 Z" fill="#34d399" />
      )}
    </motion.g>
  );
}
