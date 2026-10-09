"use client";

import { useEffect, useRef } from "react";

// The phone menu: a native <details>, closed by a tap outside it or on any link inside it.
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeOutside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  return (
    <details
      ref={ref}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("a") && ref.current) ref.current.open = false;
      }}
      className="group relative md:hidden"
    >
      {children}
    </details>
  );
}
