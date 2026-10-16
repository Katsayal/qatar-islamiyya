"use client";

import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// A password box with an eye button that shows or hides what is typed. Hidden by default and
// hidden again whenever its form is submitted. Stays uncontrolled (forms read it with FormData):
// only the input type changes.
export function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [shown, setShown] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const form = ref.current?.form;
    const hide = () => setShown(false);
    form?.addEventListener("submit", hide);
    return () => form?.removeEventListener("submit", hide);
  }, []);

  return (
    <div className="relative">
      <input {...props} ref={ref} type={shown ? "text" : "password"} className={cn(className, "w-full pe-12")} />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {shown ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}
