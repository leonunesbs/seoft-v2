"use client";
interface RippleLoaderProps {
  size?: number; // Size of the loader in pixels
}

export function RippleLoader({ size = 35 }: RippleLoaderProps) {
  const borderWidth = size / 20; // Dynamic border width based on size

  return (
    <div
      className="relative inline-block"
      style={{
        width: size,
        height: size,
      }}
      role="presentation"
    >
      <div
        className="animate-ripple absolute rounded-full border-current"
        style={{
          borderWidth: borderWidth,
          top: size / 2 - borderWidth * 2,
          left: size / 2 - borderWidth * 2,
        }}
      ></div>
      <div
        className="animate-ripple absolute rounded-full border-current"
        style={{
          borderWidth: borderWidth,
          top: size / 2 - borderWidth * 2,
          left: size / 2 - borderWidth * 2,
          animationDelay: "-0.5s",
        }}
      ></div>
      <style jsx>{`
        @keyframes ripple {
          0% {
            top: ${size / 2}px;
            left: ${size / 2}px;
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            top: 0;
            left: 0;
            width: ${size}px;
            height: ${size}px;
            opacity: 0;
          }
        }
        .animate-ripple {
          position: absolute;
          border-style: solid;
          animation: ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
        }
      `}</style>
    </div>
  );
}
