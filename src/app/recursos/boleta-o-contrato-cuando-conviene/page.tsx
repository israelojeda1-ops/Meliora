import type { Metadata } from "next";
import Link from "next/link";
import { ArticuloLayout } from "@/components/Articulo";
import { articulos } from "@/lib/recursos";

const articulo = articulos.find(
  (a) => a.slug === "boleta-o-contrato-cuando-conviene"
)!;

export const metadata: Metadata = {
  title: `${articulo.titulo} | Meliora Advisory`,
  description: articulo.bajada,
};

export default function Page() {
  return (
    <ArticuloLayout articulo={articulo}>
      <p>
        Es una de las preguntas más frecuentes en las pymes chilenas: ¿pago
        estos servicios con boleta de honorarios o hago contrato? La respuesta
        cambió bastante en los últimos años, y sigue cambiando: la retención de
        honorarios ya va en <strong>15,25%</strong> y llegará a 17% en 2028.
      </p>

      <h2>Qué significa boletear hoy</h2>
      <p>
        Quien emite una boleta de honorarios en 2026 recibe el monto bruto
        menos la retención de 15,25%. Por una boleta de $1.000.000, recibe
        $847.500 líquidos. Esa retención no se pierde: financia las
        cotizaciones previsionales obligatorias del independiente (salud, AFP,
        SIS, seguro de accidentes) y el saldo se ajusta contra su impuesto en
        la Operación Renta de abril. Puedes simular cualquier monto, en pesos
        o en UF, con nuestra{" "}
        <Link href="/calculadora-honorarios">
          calculadora de boleta de honorarios
        </Link>
        .
      </p>

      <h2>El riesgo que nadie mira: la subordinación</h2>
      <p>
        El criterio legal no es el que más convenga, sino la realidad de la
        relación. Si la persona cumple horario, recibe instrucciones directas y
        trabaja con tus herramientas, hay <strong>subordinación y
        dependencia</strong>: corresponde contrato de trabajo, aunque ambas
        partes prefieran la boleta. Una fiscalización o una demanda posterior
        puede transformar años de boletas en deuda previsional con recargos.
        El riesgo lo asume la empresa, no el trabajador.
      </p>

      <h2>Los números, lado a lado</h2>
      <ul>
        <li>
          <strong>Boleta:</strong> retención 15,25% (17% en 2028). Sin
          gratificación, sin vacaciones pagadas, sin indemnización por término.
          Flexibilidad total para ambas partes.
        </li>
        <li>
          <strong>Contrato:</strong> costo empresa de ~6,8% adicional sobre el
          imponible, más gratificación legal. A cambio: estabilidad,
          fidelización y cero riesgo de recalificación laboral.
        </li>
      </ul>
      <p>
        Con la retención subiendo cada año, la brecha de costo entre ambas
        modalidades se sigue achicando. En servicios permanentes y de jornada
        completa, el contrato suele terminar siendo más eficiente, y siempre
        es más seguro.
      </p>

      <h2>Cuándo tiene sentido cada uno</h2>
      <ul>
        <li>
          <strong>Boleta:</strong> servicios profesionales acotados, por
          proyecto o resultado, sin horario ni exclusividad: un diseño, una
          asesoría puntual, un informe.
        </li>
        <li>
          <strong>Contrato:</strong> funciones permanentes del giro, con
          horario, supervisión directa o presencia continua, aunque sea
          part-time.
        </li>
      </ul>

      <h2>La conclusión práctica</h2>
      <p>
        Si el rol es permanente, contrata: el ahorro de la boleta es menor de
        lo que parece y el riesgo legal es tuyo. Si el servicio es realmente
        independiente, la boleta está bien — pero presupuesta el bruto
        correcto para que el líquido de tu prestador no se coma la diferencia.
        Puedes comparar ambos escenarios con la{" "}
        <Link href="/calculadora">Calculadora Salarial</Link> y la de{" "}
        <Link href="/calculadora-honorarios">honorarios</Link>.
      </p>
    </ArticuloLayout>
  );
}
