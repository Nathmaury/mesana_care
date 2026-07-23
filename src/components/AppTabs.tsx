"use client";

type Tab = "cotizador" | "historial" | "inventario";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "cotizador", label: "Cotizador" },
  { id: "historial", label: "Historial" },
  { id: "inventario", label: "Inventario" },
];

export function AppTabs({ active, onChange }: Props) {
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-brand-200/70 bg-white/90 p-1.5 shadow-sm">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={
              isActive
                ? "flex-1 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md"
                : "flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
            }
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}

export type { Tab };
