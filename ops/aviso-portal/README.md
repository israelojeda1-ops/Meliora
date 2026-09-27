# Aviso de mudanza para portal.melioraadvisory.cl

Respaldo para servir el cartel **sin la app del portal**. Sirve mientras
`portal.melioraadvisory.cl` apunte al VPS y el portal todavía no esté publicado
ahí: hoy ese nombre no tiene ningún sitio en Caddy, así que Cloudflare responde
**520** y ni el cartel ni el login se ven.

No reemplaza al portal: es el piso mínimo para que la dirección vieja de Nüprotec
diga adónde ir en vez de dar un error.

## Ponerlo en pie (en el servidor, con sudo)

    install -d -o root -g root /srv/aviso-portal
    install -m 644 ops/aviso-portal/index.html /srv/aviso-portal/index.html

Y el bloque de sitio en el Caddyfile:

    portal.melioraadvisory.cl {
      encode zstd gzip

      # Solo la dirección vieja de Nüprotec muestra el cartel; el resto del
      # portal se irá agregando cuando la app esté publicada acá.
      handle /nuprotecV2* {
        rewrite * /index.html
        root * /srv/aviso-portal
        file_server
      }

      handle {
        redir https://nuprotec.melioraadvisory.cl/Nuprotecv3 302
      }
    }

Después `caddy validate --config /etc/caddy/Caddyfile` y `systemctl reload caddy`.

## Si solo cambia el HTML

Una vez que el bloque de Caddy está puesto, cambiar el cartel es reemplazar el
archivo: **no hace falta recargar Caddy**, `file_server` lo lee de disco en cada
pedido.

    sudo tee /srv/aviso-portal/index.html > /dev/null <<'HTML'
    …el contenido de ops/aviso-portal/index.html…
    HTML
    sudo chmod 644 /srv/aviso-portal/index.html

## Para comprobarlo

    curl -s -o /dev/null -w '%{http_code}\n' https://portal.melioraadvisory.cl/nuprotecV2

Tiene que dar `200`. Hoy da `520`.

## Cuando el portal se publique en el VPS

Lo reemplaza `.github/workflows/publicar-portal-vps.yml`: ahí `/nuprotecV2` lo
sirve la app (`portal/src/app/nuprotecV2/[[...path]]/page.tsx`), que es el mismo
cartel pero dentro del portal. Este bloque se saca entero.
