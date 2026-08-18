export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#9333ea" />
      <path
        d="M24 10L31 15.5L28.5 24L19.5 24L17 15.5L24 10Z"
        fill="white"
      />
      <path
        d="M12 20L17 15.5L19.5 24L14.5 30.5L8 28L12 20Z"
        fill="white"
        fillOpacity="0.85"
      />
      <path
        d="M36 20L31 15.5L28.5 24L33.5 30.5L40 28L36 20Z"
        fill="white"
        fillOpacity="0.85"
      />
      <path
        d="M14.5 30.5L19.5 24L28.5 24L33.5 30.5L29 37L19 37L14.5 30.5Z"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="text-white font-bold text-lg tracking-tight">Gaffer's Picks</span>
    </div>
  );
}
