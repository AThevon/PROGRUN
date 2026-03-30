"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-28 h-28" style={{ filter: "hue-rotate(25deg) saturate(1.8) brightness(1.3)" }}>
        <DotLottieReact
          src="/squirrel.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <span className="text-xs font-dm text-muted tracking-wider uppercase animate-pulse">
        Chargement...
      </span>
    </div>
  );
}
