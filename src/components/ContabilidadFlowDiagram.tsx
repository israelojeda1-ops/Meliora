type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  num: string;
  title: string;
  caption: string;
  variant?: "default" | "output" | "portal";
};

const NAVY = "#1B2A4A";
const EMERALD = "#0E7C66";

const boxes: Box[] = [
  { x: 10, y: 78, w: 160, h: 68, num: "01 · SII", title: "Libro Compras", caption: "" },
  { x: 10, y: 186, w: 160, h: 68, num: "02 · SII", title: "Libro Ventas", caption: "" },
  { x: 236, y: 132, w: 160, h: 68, num: "03", title: "Libro Diario", caption: "Conciliado y validado" },
  { x: 462, y: 132, w: 160, h: 68, num: "04", title: "Libro Mayor", caption: "Saldos por cuenta" },
  { x: 688, y: 132, w: 160, h: 68, num: "05", title: "Balance 8 Columnas", caption: "Ajustes de cierre" },
  { x: 950, y: 8, w: 190, h: 68, num: "06", title: "Balance General", caption: "Activos · Pasivos · Patrimonio", variant: "output" },
  { x: 950, y: 108, w: 190, h: 68, num: "07", title: "Estado de Resultados", caption: "Ingresos · Costos · EBITDA", variant: "output" },
  { x: 950, y: 208, w: 190, h: 68, num: "08", title: "Flujo de Caja", caption: "Operativo · Inversión · Financ.", variant: "output" },
  { x: 688, y: 330, w: 160, h: 68, num: "09", title: "12+ Ratios", caption: "Liquidez · Margen · EBITDA" },
  { x: 900, y: 330, w: 190, h: 68, num: "10 · PORTAL", title: "Dashboard Web", caption: "Actualizado cada cierre", variant: "portal" },
  { x: 1142, y: 330, w: 160, h: 68, num: "11", title: "Informe PDF", caption: "Portal de cliente" },
];

function center(b: Box) {
  return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
}
function rightMid(b: Box) {
  return { x: b.x + b.w, y: b.y + b.h / 2 };
}
function leftMid(b: Box) {
  return { x: b.x, y: b.y + b.h / 2 };
}

const CORNER = 16;

/** Smooth orthogonal connector: horizontal out, rounded corner, vertical, rounded corner, horizontal in. */
function elbowPath(x1: number, y1: number, x2: number, y2: number, trunkX: number) {
  const dirY = y2 > y1 ? 1 : y2 < y1 ? -1 : 0;
  if (dirY === 0) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  const dirX1 = trunkX >= x1 ? 1 : -1;
  const dirX2 = x2 >= trunkX ? 1 : -1;
  const r = Math.min(CORNER, Math.abs(y2 - y1) / 2, Math.abs(trunkX - x1), Math.abs(x2 - trunkX));
  return [
    `M ${x1} ${y1}`,
    `H ${trunkX - r * dirX1}`,
    `Q ${trunkX} ${y1} ${trunkX} ${y1 + r * dirY}`,
    `V ${y2 - r * dirY}`,
    `Q ${trunkX} ${y2} ${trunkX + r * dirX2} ${y2}`,
    `H ${x2}`,
  ].join(" ");
}

const b = Object.fromEntries(boxes.map((box) => [box.num.replace(/\D/g, "").padStart(2, "0").slice(0, 2), box])) as Record<string, Box>;

const connections: [Box, Box][] = [
  [b["01"], b["03"]],
  [b["02"], b["03"]],
  [b["03"], b["04"]],
  [b["04"], b["05"]],
  [b["05"], b["06"]],
  [b["05"], b["07"]],
  [b["05"], b["08"]],
  [b["06"], b["09"]],
  [b["07"], b["09"]],
  [b["08"], b["09"]],
  [b["09"], b["10"]],
  [b["10"], b["11"]],
];

export function ContabilidadFlowDiagram({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1330 420"
      className={className}
      role="img"
      aria-label="Flujo del proceso contable Meliora: del Libro de Compras y Ventas del SII al informe ejecutivo en el portal de cliente."
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="8.5"
          refY="5"
          orient="auto-start-reverse"
        >
          <path d="M0.5,1 L9,5 L0.5,9 L2.8,5 Z" fill="#7C8AA0" />
        </marker>
      </defs>

      {connections.map(([from, to], i) => {
        const forward = from.x + from.w <= to.x;
        const p1 = forward ? rightMid(from) : leftMid(from);
        const p2 = forward ? leftMid(to) : rightMid(to);
        const midX = (p1.x + p2.x) / 2;
        return (
          <path
            key={i}
            d={elbowPath(p1.x, p1.y, p2.x, p2.y, midX)}
            fill="none"
            stroke="#B7C0CE"
            strokeWidth={2}
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
          />
        );
      })}

      {boxes.map((box) => {
        const isPortal = box.variant === "portal";
        const isOutput = box.variant === "output";
        const c = center(box);
        return (
          <g key={box.num}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx={12}
              fill={isPortal ? NAVY : "#ffffff"}
              stroke={isOutput ? EMERALD : isPortal ? NAVY : "#E2E8F0"}
              strokeWidth={isOutput ? 1.75 : 1}
            />
            <text
              x={box.x + 14}
              y={box.y + 20}
              fontSize={10}
              fontWeight={700}
              letterSpacing={0.5}
              fill={isPortal ? EMERALD : "#94A3B8"}
            >
              {box.num}
            </text>
            <text
              x={c.x}
              y={box.caption ? c.y + 4 : c.y + 10}
              fontSize={14.5}
              fontWeight={700}
              textAnchor="middle"
              fill={isPortal ? "#ffffff" : NAVY}
            >
              {box.title}
            </text>
            {box.caption && (
              <text
                x={c.x}
                y={c.y + 22}
                fontSize={10}
                textAnchor="middle"
                fill={isPortal ? "#CBD5E1" : "#94A3B8"}
              >
                {box.caption}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
