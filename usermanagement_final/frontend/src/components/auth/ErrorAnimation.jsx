import React from 'react';
import styles from './ErrorAnimation.module.css';

const ErrorAnimation = () => {
  return (
    <div className={styles.container}>
      <svg
        viewBox="0 0 400 320"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#0b1e4a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Red Pulsing Glow Background */}
        <circle cx="200" cy="160" r="150" fill="url(#redGlow)" className={styles.errorGlow} />

        {/* ===== Broken Form Card ===== */}
        <g transform="translate(120, 50)">
          {/* Card shadow */}
          <rect x="6" y="6" width="160" height="210" rx="14" fill="#000" fillOpacity="0.15" />
          {/* Card body */}
          <rect x="0" y="0" width="160" height="210" rx="14" fill="#1e293b" stroke="#334155" strokeWidth="3" />

          {/* Form Title placeholder */}
          <rect x="20" y="18" width="80" height="10" rx="5" fill="#475569" className={styles.wiggle} />

          {/* Input Field 1 – broken/red border */}
          <rect x="20" y="42" width="120" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          {/* Red squiggly line under input 1 */}
          <path d="M22 74 Q28 68 34 74 Q40 80 46 74 Q52 68 58 74 Q64 80 70 74" stroke="#ef4444" strokeWidth="2" fill="none" className={styles.wiggle} />

          {/* Input Field 2 – broken/red border */}
          <rect x="20" y="88" width="120" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          {/* Error text placeholder below input 2 */}
          <rect x="20" y="120" width="60" height="6" rx="3" fill="#ef4444" fillOpacity="0.6" className={styles.wiggle} />

          {/* Input Field 3 – also red */}
          <rect x="20" y="138" width="120" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
          <rect x="20" y="170" width="45" height="6" rx="3" fill="#ef4444" fillOpacity="0.6" className={styles.wiggle} />

          {/* Disabled Submit Button */}
          <rect x="20" y="186" width="120" height="20" rx="6" fill="#475569" fillOpacity="0.5" />

          {/* Red scanning line across the form card */}
          <rect x="0" y="0" width="160" height="3" rx="1" fill="#ef4444" fillOpacity="0.7" className={styles.scanLine} />
        </g>

        {/* ===== Central Shield with X ===== */}
        <g transform="translate(160, 100)" className={styles.shieldShake}>
          {/* Shield shape */}
          <path
            d="M40 0 L80 15 L80 50 C80 75 60 95 40 105 C20 95 0 75 0 50 L0 15 Z"
            fill="#dc2626"
            fillOpacity="0.9"
          />
          {/* Inner shield */}
          <path
            d="M40 8 L72 20 L72 48 C72 68 56 85 40 93 C24 85 8 68 8 48 L8 20 Z"
            fill="#0b1e4a"
          />
          {/* X Cross Mark */}
          <g stroke="#ef4444" strokeWidth="6" strokeLinecap="round">
            <line x1="28" y1="38" x2="52" y2="62" />
            <line x1="52" y1="38" x2="28" y2="62" />
          </g>
        </g>

        {/* ===== Exclamation Triangle (bottom right) ===== */}
        <g transform="translate(280, 180)" className={styles.exclamationBounce}>
          {/* Triangle */}
          <path d="M25 0 L50 45 L0 45 Z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="2" />
          {/* Exclamation mark */}
          <line x1="25" y1="14" x2="25" y2="30" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
          <circle cx="25" cy="37" r="2.5" fill="#92400E" />
        </g>

        {/* ===== Floating broken pieces / debris ===== */}
        {/* Red X fragment */}
        <g className={`${styles.floatPiece} ${styles.piece1}`} style={{'--float-x': '-40px', '--float-y': '-70px', '--float-r': '-30deg'}} transform="translate(170, 120)">
          <line x1="0" y1="0" x2="14" y2="14" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <line x1="14" y1="0" x2="0" y2="14" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Broken lock */}
        <g className={`${styles.floatPiece} ${styles.piece2}`} style={{'--float-x': '50px', '--float-y': '-60px', '--float-r': '40deg'}} transform="translate(250, 130)">
          <rect x="0" y="8" width="16" height="14" rx="3" fill="#F59E0B" />
          <path d="M3 8 V5 C3 1 5 -1 8 -1 C11 -1 13 1 13 5" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Broken part */}
          <line x1="13" y1="5" x2="16" y2="2" stroke="#ef4444" strokeWidth="2" />
        </g>

        {/* Warning sign chip */}
        <g className={`${styles.floatPiece} ${styles.piece3}`} style={{'--float-x': '-30px', '--float-y': '-90px', '--float-r': '25deg'}} transform="translate(140, 180)">
          <path d="M10 0 L20 18 L0 18 Z" fill="#ef4444" fillOpacity="0.8" />
          <line x1="10" y1="6" x2="10" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx="10" cy="15" r="1" fill="white" />
        </g>

        {/* Broken input field chip */}
        <g className={`${styles.floatPiece} ${styles.piece4}`} style={{'--float-x': '35px', '--float-y': '-75px', '--float-r': '-50deg'}} transform="translate(215, 200)">
          <rect x="0" y="0" width="24" height="10" rx="3" fill="#334155" stroke="#ef4444" strokeWidth="1.5" />
          <line x1="4" y1="5" x2="20" y2="5" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>

        {/* Text at the bottom */}
        <text x="200" y="295" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="13" fontFamily="Inter, sans-serif" fontWeight="500">
          Please fix the errors above
        </text>
      </svg>
    </div>
  );
};

export default ErrorAnimation;
