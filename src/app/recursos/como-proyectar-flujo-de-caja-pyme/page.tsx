import type { Metadata } from "next";
import Link from "next/link";
import { ArticuloLayout } from "@/components/Articulo";
import { articulos } from "@/lib/recursos";

const articulo = articulos.find(
  (a) => a.slug === "como-proyectar-flujo-de-caja-pyme"
)!;

export const metadata: Metadata = {
  title: `${articulo.titulo} | Meliora Advisory`,
  description: articulo.bajada,
};

export default function Page() {
  return (
    <ArticuloLayout articulo={articulo}>
      <p>
        Una pyme puede ser rentable en el estado de resultados y aun así no
        tener con qué pagar los sueldos del 30. La utilidad es una opinión
        contable; <strong>la caja es un hecho</strong>. Por eso la herramienta
        financiera más valiosa para un dueño de pyme no es un balance: es una
        proyección de caja de las próximas 8 a 12 semanas, actualizada cada
        semana.
      </p>

      <h2>Por qué semanas y no meses</h2>
      <p>
        Un flujo mensual esconde el problema: puedes cerrar el mes «cuadrado»
        y aun así quedar en rojo el día 15, entre el pago de remuneraciones y
        la factura grande que se cobra el 25. La resolución semanal muestra
        los cruces peligrosos con anticipación suficiente para hacer algo:
        adelantar una cobranza, postergar una compra, negociar un plazo.
      </p>

      <h2>El método, paso a paso</h2>
      <ol>
        <li>
          <strong>Parte del saldo real de hoy</strong>: suma de todas las
          cuentas bancarias, menos cheques o pagos comprometidos no cursados.
        </li>
        <li>
          <strong>Proyecta los ingresos por semana</strong>, con fechas
          realistas de cobro — no de facturación. Si tus clientes pagan a 45
          días, la venta de hoy es caja de octubre.
        </li>
        <li>
          <strong>Proyecta los egresos fijos</strong>: remuneraciones y
          cotizaciones (con sus fechas legales), arriendo, IVA y PPM del día
          12, créditos, servicios.
        </li>
        <li>
          <strong>Agrega los egresos variables</strong>: compras a
          proveedores según los plazos pactados, y un colchón para imprevistos
          (3–5% de los egresos suele bastar).
        </li>
        <li>
          <strong>Calcula el saldo acumulado semana a semana.</strong> Toda
          semana que quede negativa es una alerta con nombre y fecha.
        </li>
        <li>
          <strong>Actualízalo cada semana</strong> comparando lo proyectado
          con lo real. La primera versión será mala; a la cuarta semana el
          modelo empieza a afinarse solo.
        </li>
      </ol>

      <h2>Las señales de alerta que este método detecta</h2>
      <ul>
        <li>
          Semanas de remuneraciones que coinciden con vencimientos de IVA — el
          cruce que más pymes sufre.
        </li>
        <li>
          Clientes grandes que concentran demasiada caja futura: si uno se
          atrasa, todo el plan cae.
        </li>
        <li>
          Crecimiento que consume caja: vender más con plazos largos de cobro
          puede dejarte con menos caja que vendiendo menos.
        </li>
      </ul>

      <h2>El error más común</h2>
      <p>
        Hacerlo una vez y abandonarlo. La proyección de caja no es un
        entregable, es un <strong>hábito semanal</strong> de 30 minutos. Las
        empresas que lo mantienen dejan de vivir apagando incendios: negocian con los problemas
        todavía lejos.
      </p>
      <p>
        ¿No sabes si tu pyme necesita esto con urgencia? Nuestro{" "}
        <Link href="/diagnostico">Diagnóstico Financiero Express</Link> te lo
        dice en 3 minutos. Y si prefieres que la proyección la construyamos y
        mantengamos nosotros junto a tu reportería mensual, mira el servicio
        de <Link href="/servicios">CFO externo</Link>.
      </p>
    </ArticuloLayout>
  );
}
