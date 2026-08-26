import type { Metadata } from "next";
import Link from "next/link";
import { ArticuloLayout } from "@/components/Articulo";
import { articulos } from "@/lib/recursos";

const articulo = articulos.find(
  (a) => a.slug === "indicadores-que-toda-pyme-deberia-mirar"
)!;

export const metadata: Metadata = {
  title: `${articulo.titulo} | Meliora Advisory`,
  description: articulo.bajada,
};

export default function Page() {
  return (
    <ArticuloLayout articulo={articulo}>
      <p>
        La mayoría de los dueños de pyme administra mirando dos números: la
        cuenta corriente y las ventas. Son necesarios, pero no cuentan la
        historia completa, y suelen avisar tarde. Estos cinco indicadores,
        revisados una vez al mes, cubren el 80% de lo que necesitas saber para
        decidir con datos.
      </p>

      <h2>1. Margen por línea de negocio</h2>
      <p>
        No el margen global: el margen <strong>de cada línea, producto o
        servicio</strong>. Es habitual descubrir que una línea «estrella» por
        volumen en realidad subsidia su propio costo, mientras un servicio
        secundario deja el doble de margen. Sin esta apertura, decides a
        ciegas dónde crecer y dónde cortar.
      </p>

      <h2>2. DSO: días de cobro</h2>
      <p>
        El DSO (Days Sales Outstanding) mide cuántos días demoras, en
        promedio, en convertir una venta en caja: cuentas por cobrar dividido
        por venta promedio diaria. Si vendes a 30 días pero tu DSO es 55, tus
        clientes te están usando de banco, y ese financiamiento lo pagas tú.
        Mirarlo cada mes convierte la cobranza en gestión, no en emergencia.
      </p>

      <h2>3. Caja proyectada a 8–12 semanas</h2>
      <p>
        El saldo de hoy dice poco; lo que importa es el saldo de las próximas
        semanas, con los cruces de remuneraciones, IVA y proveedores a la
        vista. Es el indicador que evita las sorpresas de fin de mes; le
        dedicamos una{" "}
        <Link href="/recursos/como-proyectar-flujo-de-caja-pyme">
          guía completa con el método paso a paso
        </Link>
        .
      </p>

      <h2>4. Punto de equilibrio</h2>
      <p>
        Cuánto tienes que vender en el mes para no perder plata: costos fijos
        divididos por el margen de contribución porcentual. Conocerlo cambia
        la conversación: sabes desde qué día del mes estás «trabajando para
        ti», y qué pasa con la última línea si las ventas caen 15%.
      </p>

      <h2>5. EBITDA mensual</h2>
      <p>
        El resultado operacional antes de intereses, impuestos, depreciación y
        amortización. Es la medida más limpia de si <strong>el negocio en sí
        genera valor</strong>, separado de cómo está financiado. Es además el
        número que mirará cualquier banco o comprador, y conviene conocerlo
        antes de que te lo pregunten.
      </p>

      <h2>El requisito incómodo: contabilidad al día</h2>
      <p>
        Ninguno de estos indicadores sirve si la contabilidad va dos meses
        atrasada o si los costos están mal imputados. El orden contable no es
        un trámite tributario: es la materia prima de la información con que
        diriges. Por eso en Meliora la contabilidad, las remuneraciones y la
        reportería son un solo servicio — los números salen del mismo lugar y
        cierran entre sí.
      </p>
      <p>
        ¿Cuántos de estos cinco tienes hoy al día? Mídelo gratis en 3 minutos
        con el <Link href="/diagnostico">Diagnóstico Financiero Express</Link>.
      </p>
    </ArticuloLayout>
  );
}
