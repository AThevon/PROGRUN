"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-bg">
      <div
        className="w-32 h-32"
        style={{
          filter: "brightness(0) saturate(100%) invert(93%) sepia(60%) saturate(600%) hue-rotate(15deg) brightness(1.05)",
        }}
      >
        <DotLottieReact
          src="/squirrel.lottie"
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <span className="text-xs font-dm text-accent tracking-wider uppercase mt-3 animate-pulse">
        Chargement...
      </span>
    </div>
  );
}
