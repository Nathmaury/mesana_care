import { BRAND } from "@/lib/sample-products";
import { Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-300 to-brand-500 shadow-md shadow-brand-300/40">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-brand-800 sm:text-xl">
              {BRAND.name}
            </h1>
            <p className="text-xs text-brand-600 sm:text-sm">{BRAND.tagline}</p>
          </div>
        </div>
        <div className="hidden text-right text-sm text-brand-700 sm:block">
          <p>{BRAND.phone}</p>
          <p className="text-brand-500">{BRAND.instagram}</p>
        </div>
      </div>
    </header>
  );
}
