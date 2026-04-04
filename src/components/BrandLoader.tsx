import { Shield } from "lucide-react";

type BrandLoaderProps = {
  message?: string;
};

const BrandLoader = ({
  message = "Loading GigAssure...",
}: BrandLoaderProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6">
      <div className="relative flex flex-col items-center text-center">
        <div className="absolute inset-0 -z-10 h-44 w-44 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
        <div className="absolute inset-0 -z-10 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl animate-pulse [animation-delay:300ms]" />

        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500 via-cyan-400 to-emerald-500 shadow-[0_20px_60px_-15px_rgba(6,182,212,0.45)] animate-pulse">
          <div className="absolute inset-0 rounded-3xl border border-white/20" />
          <Shield className="h-11 w-11 text-white drop-shadow" />
        </div>

        <div className="mt-6 space-y-2">
          <p className="text-2xl font-black tracking-tight text-white">
            GigAssure
          </p>
          <p className="text-sm font-medium text-slate-300">{message}</p>
        </div>

        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
};

export default BrandLoader;
