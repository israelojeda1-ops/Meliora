import type { Metadata } from "next";
import Link from "next/link";
import { ArticuloLayout } from "@/components/Articulo";
import { articulos } from "@/lib/recursos";

const articulo = articulos.find(
  (a) => a.slug === "reforma-previsional-2026-empleadores"
)!;

export const metadata: Metadata = {
  title: `${articulo.titulo} | Meliora Advisory`,
  description: articulo.bajada,
};

export default function Page() {
  return (
    <ArticuloLayout articulo={articulo}>
      <p>
        La Ley 21.735 creó, por primera vez en décadas, una cotización
        previsional relevante <strong>de cargo del empleador</strong>. Partió
        con un 1% adicional en agosto de 2025, y desde las remuneraciones de{" "}
        <strong>agosto de 2026 el aporte al Seguro Social Previsional es de
        3,5%</strong>. Ojo con la cifra: ese 3,5% ahora incluye el SIS que el
        empleador ya pagaba por separado vía AFP, así que{" "}
        <strong>el aumento efectivo de agosto es de cerca de 0,9 puntos</strong>{" "}
        (la nueva cotización de rentabilidad protegida). Aun así, el calendario
        lleva el aporte gradualmente hasta 8,5%: para muchas pymes será el
        aumento de costo laboral más importante de la década.
      </p>

      <h2>Qué se paga exactamente desde agosto 2026</h2>
      <p>El 3,5% sobre la remuneración imponible (tope 90 UF) se compone de:</p>
      <ul>
        <li>
          <strong>SIS + compensación por expectativa de vida: 2,5%.</strong> El
          Seguro de Invalidez y Sobrevivencia dejó de recaudarse vía AFP y
          pasó al nuevo Seguro Social Previsional; su tasa varía (hoy 1,78%) y
          la compensación por expectativa de vida se ajusta para que juntos
          sumen siempre 2,5%. El SIS no es costo nuevo: el empleador ya lo
          pagaba, solo cambió de planilla.
        </li>
        <li>
          <strong>Capitalización individual: 0,1%</strong>, que va directo a la
          cuenta del trabajador.
        </li>
        <li>
          <strong>Rentabilidad protegida: 0,9%</strong>, que sube a 1,5% en
          agosto de 2027.
        </li>
      </ul>
      <p>
        Importante: este aporte <strong>no se descuenta al trabajador</strong>.
        Es costo empresa puro, que se suma a la cesantía y al seguro de
        accidentes que ya pagabas.
      </p>

      <h2>Cuánto significa en plata</h2>
      <p>
        Tomemos una pyme con 10 trabajadores y remuneración imponible promedio
        de $900.000 (nómina de $9 millones). En julio de 2026 su costo
        previsional de cargo del empleador era de unos $236.000 mensuales (SIS
        1,62% vía AFP más el 1% de la reforma). Desde agosto paga{" "}
        <strong>$315.000 mensuales</strong> (el 3,5% completo): unos{" "}
        <strong>$79.000 más al mes</strong>, cerca de $950.000 al año. Y el
        calendario sigue subiendo: la rentabilidad protegida pasa a 1,5% en
        agosto de 2027, y cuando el aporte total llegue a 8,5%, esa misma
        nómina significará $765.000 mensuales. Puedes ver el impacto exacto en
        tu caso con el modo empleador de la{" "}
        <Link href="/calculadora">Calculadora Salarial</Link>.
      </p>

      <h2>Detalles operativos que generan errores</h2>
      <ul>
        <li>
          El aporte se declara en la planilla del{" "}
          <strong>Seguro Social Previsional</strong>, no en la de AFP; el SIS
          cambió de planilla en agosto 2026.
        </li>
        <li>
          Con licencias médicas, la capitalización individual y la
          rentabilidad protegida se calculan solo por los días trabajados; el
          SIS y la expectativa de vida consideran también la renta del
          subsidio.
        </li>
        <li>
          Las tasas se aplican por período de remuneración: un retroactivo de
          julio se paga con las tasas de julio, no con las actuales.
        </li>
      </ul>

      <h2>Qué hacer ahora</h2>
      <ol>
        <li>
          <strong>Actualiza tu presupuesto anual</strong> con el 3,5% vigente y
          proyecta los escalones siguientes del calendario.
        </li>
        <li>
          <strong>Revisa tus liquidaciones de agosto</strong>: si tu proveedor
          de remuneraciones siguió pagando el SIS vía AFP o mantuvo el 1%,
          tienes diferencias que regularizar.
        </li>
        <li>
          <strong>Recalcula el costo de tus próximas contrataciones</strong>:
          el costo empresa ya no es el de 2024.
        </li>
      </ol>
      <p>
        Si nadie en tu empresa está siguiendo estos cambios mes a mes, ese es
        exactamente el tipo de cosas que un servicio integrado de contabilidad
        y remuneraciones resuelve por ti.
      </p>
    </ArticuloLayout>
  );
}
