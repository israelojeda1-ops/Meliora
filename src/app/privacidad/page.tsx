import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — Meliora Advisory",
  description:
    "Qué datos recolecta melioraadvisory.cl, para qué se usan y cómo solicitar su eliminación.",
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  return (
    <>
      <section className="bg-navy py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Política de Privacidad
          </h1>
          <p className="mt-4 text-slate-300">
            Última actualización: agosto de 2026.
          </p>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-5 text-[15px] leading-relaxed text-slate-600 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2">
          <h2>Qué datos recolectamos</h2>
          <ul>
            <li>
              <strong className="text-navy">Formularios de contacto y de las
              herramientas</strong> (diagnóstico, calculadoras): nombre, correo
              electrónico, teléfono, empresa y el contenido que decidas enviar,
              incluyendo las respuestas o desgloses que pidas recibir.
            </li>
            <li>
              <strong className="text-navy">Estadísticas de navegación</strong>:
              usamos Google Analytics, que emplea cookies para medir visitas de
              forma agregada (páginas vistas, origen del tráfico, dispositivo).
            </li>
          </ul>
          <p>
            Las calculadoras funcionan completas en tu navegador: los montos
            que ingresas no se envían a ningún servidor, salvo que tú pidas
            recibir el desglose por correo.
          </p>

          <h2>Para qué los usamos</h2>
          <ul>
            <li>Responder tus consultas y solicitudes de reunión.</li>
            <li>Enviarte los desgloses o resultados que solicites.</li>
            <li>
              Contactarte comercialmente respecto de nuestros servicios, solo
              si nos dejaste tus datos con ese fin.
            </li>
            <li>Mejorar el sitio a partir de estadísticas agregadas.</li>
          </ul>
          <p>
            No vendemos ni cedemos tus datos a terceros. Los formularios se
            procesan a través de FormSubmit (servicio de envío de formularios)
            y llegan a nuestro correo.
          </p>

          <h2>Tus derechos</h2>
          <p>
            De acuerdo con la ley chilena de protección de datos personales,
            puedes solicitar en cualquier momento el acceso, rectificación o
            eliminación de tus datos escribiendo a{" "}
            <a
              href="mailto:contacto@melioraadvisory.cl"
              className="text-emerald font-semibold"
            >
              contacto@melioraadvisory.cl
            </a>
            . Respondemos dentro de 10 días hábiles.
          </p>

          <h2>Cookies</h2>
          <p>
            El sitio usa las cookies de Google Analytics con fines
            estadísticos. Puedes bloquearlas desde la configuración de tu
            navegador sin que el sitio deje de funcionar.
          </p>
        </div>
      </section>
    </>
  );
}
