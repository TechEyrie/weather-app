export function WeatherSprite() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="sprite-hidden"
    >
      <defs>
        <linearGradient id="wg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".05" />
          <stop offset="35%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="65%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="100%" stopColor="#fff" stopOpacity=".08" />
        </linearGradient>
        <linearGradient id="wf" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".32" />
          <stop offset="100%" stopColor="#fff" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id="wfade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="72%" stopColor="#fff" stopOpacity=".25" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="wclip">
          <rect id="wclipr" x="0" y="0" width="835" height="230" />
        </clipPath>
        <mask id="wmask">
          <rect width="835" height="230" fill="url(#wfade)" />
        </mask>
      </defs>
      <symbol id="i-grid" viewBox="0 0 24 24">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      </symbol>
      <symbol id="i-chart" viewBox="0 0 24 24">
        <path
          d="M4 19V5M4 19h16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M8 15v-4M12 15V8M16 15v-7"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-globe" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <ellipse
          cx="12"
          cy="12"
          rx="4"
          ry="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M3 12h18M5.5 7h13M5.5 17h13"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-cal" viewBox="0 0 24 24">
        <rect
          x="4"
          y="5"
          width="16"
          height="16"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8 3v4M16 3v4M4 10h16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-gear" viewBox="0 0 24 24">
        <path
          d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 00-1.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82 1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </symbol>
      <symbol id="i-climate" viewBox="0 0 24 24">
        <path
          d="M14 4.5v10.2a4 4 0 11-4 0V4.5a2 2 0 114 0z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M12 7v7"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-out" viewBox="0 0 24 24">
        <path
          d="M10 17l5-5-5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12H4M20 4v16"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-plus" viewBox="0 0 24 24">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          strokeWidth="1.85"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-search" viewBox="0 0 24 24">
        <circle
          cx="11"
          cy="11"
          r="6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M16.5 16.5L20 20"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-bell" viewBox="0 0 24 24">
        <path
          d="M6.5 17h11l-1.1-1.6c-.6-.9-.9-2-.9-3.1V11a4.5 4.5 0 10-9 0v1.3c0 1.1-.3 2.2-.9 3.1L6.5 17z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M10 19.5a2 2 0 004 0"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-pin" viewBox="0 0 24 24">
        <path
          d="M12 21s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <circle cx="12" cy="11" r="2.2" fill="currentColor" />
      </symbol>
      <symbol id="i-wind" viewBox="0 0 24 24">
        <path
          d="M4 8h11a3 3 0 010 6H9M4 14h9a2.5 2.5 0 010 5H6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-drop" viewBox="0 0 24 24">
        <path
          d="M12 3.5c3.5 5.2 6 8.7 6 12a6 6 0 11-12 0c0-3.3 2.5-6.8 6-12z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </symbol>
      <symbol id="i-gust" viewBox="0 0 24 24">
        <path
          d="M4 7h10M4 12h14M4 17h8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M17 10l3 2-3 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </symbol>
      <symbol id="i-cloud" viewBox="0 0 24 24">
        <path
          d="M7 18h11a4 4 0 000-8 5.5 5.5 0 00-10.6-1.8A3.8 3.8 0 007 18z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </symbol>
      <symbol id="i-cloud2" viewBox="0 0 24 24">
        <path
          d="M6 17h12a3.5 3.5 0 000-7 4.5 4.5 0 00-8.7-1.4A3.2 3.2 0 006 17z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M4 14h14a2.8 2.8 0 000-5.6 3.6 3.6 0 00-6.9-1.1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          opacity=".65"
        />
      </symbol>
      <symbol id="i-hail" viewBox="0 0 24 24">
        <path
          d="M7 14h10a3.5 3.5 0 000-7 5 5 0 00-9.5-1.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="18" r="1.1" fill="currentColor" />
        <circle cx="12" cy="20" r="1.1" fill="currentColor" />
        <circle cx="15" cy="18" r="1.1" fill="currentColor" />
      </symbol>
      <symbol id="i-sun" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-moon" viewBox="0 0 24 24">
        <path
          d="M20 14.5A8.5 8.5 0 119.5 4 7 7 0 0020 14.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </symbol>
      <symbol id="i-avatar" viewBox="0 0 24 24">
        <circle
          cx="12"
          cy="8.5"
          r="3.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M5 20c1.2-3.8 4-5.8 7-5.8s5.8 2 7 5.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </symbol>
      <symbol id="i-logo" viewBox="0 0 40 40">
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity=".9"
        />
        <g
          stroke="currentColor"
          strokeWidth="1.35"
          fill="none"
          strokeLinecap="round"
          opacity=".95"
        >
          <path d="M8 14c4-2 8-1 12 0s8 2 12 0" />
          <path d="M6 20c5-2.5 10-1.5 14 0s9 2.5 14 0" />
          <path d="M8 26c4-1.5 9-.5 13 0s9 1.5 13 0" />
        </g>
      </symbol>
    </svg>
  );
}