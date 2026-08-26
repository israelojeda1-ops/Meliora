import type { Metadata } from "next";
import Link from "next/link";
import { ArticuloLayout } from "@/components/Articulo";
import { articulos } from "@/lib/recursos";

const articulo = articulos.find(
  (a) => a.slug === "cuanto-cuesta-contratar-trabajador-chile"
)!;

export const metadata: Metadata = {
  title: `${articulo.titulo} | Meliora Advisory`,
  description: articulo.bajada,
};

export default function Page() {
  return (
    <ArticuloLayout articulo={articulo}>
      <p>
        Cuando un dueño de pyme piensa en contratar, suele pensar en el sueldo.
        Pero el sueldo bruto es solo una parte del costo real: sobre la
        remuneración imponible el empleador paga una serie de cotizaciones que
        hoy suman <strong>cerca de un 7% adicional</strong>, y que seguirán
        subiendo con la reforma previsional.
      </p>

      <h2>Lo que paga el empleador, además del sueldo</h2>
      <p>
        Con los valores vigentes desde las remuneraciones de agosto de 2026,
        sobre la base imponible (con sus topes legales) el empleador aporta:
      </p>
      <ul>
        <li>
          <strong>Seguro de cesantía:</strong> 2,4% en contrato indefinido, o
          3,0% completo en contrato a plazo fijo.
        </li>
        <li>
          <strong>Seguro de accidentes del trabajo (ISL o mutual):</strong>{" "}
          0,93% base, más un recargo variable según el riesgo de la actividad.
        </li>
        <li>
          <strong>Aporte al Seguro Social Previsional (reforma):</strong> 3,5%,
          compuesto por el SIS más la compensación por expectativa de vida
          (que juntos suman 2,5%), un 0,1% a la cuenta individual del
          trabajador y un 0,9% de rentabilidad protegida.
        </li>
      </ul>
      <p>
        En total, para un contrato indefinido de riesgo bajo:{" "}
        <strong>6,83% sobre la remuneración imponible topeada</strong>. Para un
        sueldo imponible de $1.000.000, son unos $68.300 al mes que no ve el
        trabajador, aunque sí salen de tu caja.
      </p>

      <h2>No olvides la gratificación legal</h2>
      <p>
        Si pagas gratificación con tope legal (25% de lo devengado con tope de
        4,75 ingresos mínimos mensuales al año), a un sueldo base hay que
        sumarle hasta <strong>$219.115 mensuales</strong> de gratificación
        imponible (valor 2026). Muchos presupuestos de contratación la omiten y
        el costo real termina sorprendiendo.
      </p>

      <h2>Un ejemplo completo</h2>
      <p>
        Trabajador con contrato indefinido, sueldo imponible de $1.000.000:
      </p>
      <ul>
        <li>Cesantía empleador (2,4%): $24.000</li>
        <li>ISL/mutual (0,93%): $9.300</li>
        <li>Seguro Social Previsional (3,5%): $35.000</li>
        <li>
          <strong>Costo adicional total: $68.300 → costo empresa: $1.068.300</strong>
        </li>
      </ul>
      <p>
        Y de ese costo, al bolsillo del trabajador llega bastante menos una vez
        descontadas sus propias cotizaciones e impuesto. Puedes ver el desglose
        exacto para cualquier sueldo, incluido el líquido que recibe el
        trabajador, en nuestra{" "}
        <Link href="/calculadora">Calculadora Salarial</Link>.
      </p>

      <h2>Va a seguir subiendo</h2>
      <p>
        La Ley 21.735 contempla que el aporte del empleador siga aumentando
        gradualmente desde el 3,5% actual hasta <strong>8,5%</strong> en los
        próximos años. Si tu dotación es relevante en tu estructura de costos,
        conviene proyectar ese aumento en tu presupuesto anual desde ya, en
        vez de descubrirlo en la liquidación de cada agosto.
      </p>

      <h2>La conclusión práctica</h2>
      <p>
        Antes de contratar, calcula el <strong>costo empresa</strong>, no el
        sueldo. Y si tu pyme ya tiene equipo, revisa que tu presupuesto refleje
        las tasas vigentes: entre la reforma y los reajustes del ingreso
        mínimo, el costo laboral chileno cambia todos los años.
      </p>
    </ArticuloLayout>
  );
}
