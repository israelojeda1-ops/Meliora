const FORM_ENDPOINT = "https://formsubmit.co/israelojeda1@gmail.com";

export function ContactForm() {
  return (
    <form
      action={FORM_ENDPOINT}
      method="POST"
      className="space-y-5"
    >
      <input type="hidden" name="_subject" value="Nueva consulta desde melioraadvisory.cl" />
      <input type="hidden" name="_template" value="table" />
      <input type="hidden" name="_next" value="https://melioraadvisory.cl/contacto/gracias/" />
      <input type="text" name="_honey" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Nombre
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Empresa
          </label>
          <input
            id="company"
            name="company"
            type="text"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="Nombre de tu empresa"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="tucorreo@empresa.cl"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald"
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Cuéntanos sobre tu empresa
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald focus:border-emerald resize-none"
          placeholder="Ventas anuales aproximadas, sistema que usan actualmente, principal desafío financiero..."
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-emerald px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-dark transition-colors"
      >
        Enviar mensaje
      </button>
    </form>
  );
}
