"use client";

type Props = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  notes: string;
  onClientNameChange: (value: string) => void;
  onClientPhoneChange: (value: string) => void;
  onClientEmailChange: (value: string) => void;
  onNotesChange: (value: string) => void;
};

export function ClientForm({
  clientName,
  clientPhone,
  clientEmail,
  notes,
  onClientNameChange,
  onClientPhoneChange,
  onClientEmailChange,
  onNotesChange,
}: Props) {
  return (
    <section className="rounded-3xl border border-brand-200/70 bg-white/90 p-4 shadow-lg shadow-brand-200/30 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-brand-800">
        Datos del cliente
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-brand-600">
            Nombre completo *
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={(e) => onClientNameChange(e.target.value)}
            placeholder="Ej: María González"
            className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-600">
            Teléfono / WhatsApp
          </label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => onClientPhoneChange(e.target.value)}
            placeholder="+57 300 123 4567"
            className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-brand-600">
            Correo electrónico
          </label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => onClientEmailChange(e.target.value)}
            placeholder="cliente@email.com"
            className="w-full rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-brand-600">
            Notas adicionales
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
            placeholder="Tonos preferidos, fecha de entrega, etc."
            className="w-full resize-none rounded-xl border border-brand-200 bg-brand-50/50 px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
          />
        </div>
      </div>
    </section>
  );
}
