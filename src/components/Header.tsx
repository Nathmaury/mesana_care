import Image from "next/image";
import { BRAND } from "@/lib/sample-products";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-200/60 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src={BRAND.logoHorizontal}
            alt={`${BRAND.name} — ${BRAND.tagline}`}
            width={220}
            height={64}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </div>
        <div className="hidden text-right text-sm text-brand-700 sm:block">
          <p>{BRAND.phone}</p>
          <p className="text-brand-500">{BRAND.instagram}</p>
        </div>
      </div>
    </header>
  );
}
