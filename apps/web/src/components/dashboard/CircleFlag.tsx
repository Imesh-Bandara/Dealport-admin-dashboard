import type { ReactElement } from "react";

const SIZE = 20;

function UsFlag() {
  return (
    <svg viewBox="0 0 20 20" width={SIZE} height={SIZE}>
      <circle cx="10" cy="10" r="10" fill="#fff" />
      <g clipPath="url(#us-circle)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x="0" y={i * (20 / 13)} width="20" height={20 / 13} fill="#B22234" />
        ))}
        <rect x="0" y="0" width="10" height="10.8" fill="#3C3B6E" />
      </g>
      <clipPath id="us-circle">
        <circle cx="10" cy="10" r="10" />
      </clipPath>
    </svg>
  );
}

function BrFlag() {
  return (
    <svg viewBox="0 0 20 20" width={SIZE} height={SIZE}>
      <defs>
        <clipPath id="br-circle">
          <circle cx="10" cy="10" r="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#br-circle)">
        <rect x="0" y="0" width="20" height="20" fill="#009739" />
        <polygon points="10,3 18,10 10,17 2,10" fill="#FEDD00" />
        <circle cx="10" cy="10" r="4" fill="#012169" />
      </g>
    </svg>
  );
}

function AuFlag() {
  return (
    <svg viewBox="0 0 20 20" width={SIZE} height={SIZE}>
      <defs>
        <clipPath id="au-circle">
          <circle cx="10" cy="10" r="10" />
        </clipPath>
      </defs>
      <g clipPath="url(#au-circle)">
        <rect x="0" y="0" width="20" height="20" fill="#012169" />
        <g transform="translate(0,0) scale(0.5)">
          <rect x="0" y="0" width="20" height="20" fill="#012169" />
          <path d="M0,0 L20,20 M20,0 L0,20" stroke="#fff" strokeWidth="3" />
          <path d="M0,0 L20,20 M20,0 L0,20" stroke="#C8102E" strokeWidth="1.4" />
          <path d="M10,0 V20 M0,10 H20" stroke="#fff" strokeWidth="5" />
          <path d="M10,0 V20 M0,10 H20" stroke="#C8102E" strokeWidth="2.4" />
        </g>
        {[
          [14, 4],
          [16, 8.5],
          [15.5, 13],
          [12.5, 15.5],
        ].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={i === 3 ? 0.7 : 1} fill="#fff" />
        ))}
      </g>
    </svg>
  );
}

const FLAGS: Record<string, () => ReactElement> = {
  US: UsFlag,
  BR: BrFlag,
  AU: AuFlag,
};

export function CircleFlag({ code }: { code: string }) {
  const Flag = FLAGS[code];
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-700">
      {Flag ? <Flag /> : <span className="h-full w-full bg-slate-200" />}
    </span>
  );
}
