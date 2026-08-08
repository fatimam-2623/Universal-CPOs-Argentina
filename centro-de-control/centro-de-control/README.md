# Centro de Control

App real de gestión de CPOs, conectada a Supabase (base de datos, login y archivos).

## 1. Probarlo en tu computadora (opcional, pero recomendado antes de publicar)

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Abrí http://localhost:3000 — te va a pedir el email/contraseña que ya creaste en Supabase.

## 2. Publicarlo en Vercel

1. Subí esta carpeta a un repositorio de GitHub (podés arrastrar los archivos directo en github.com si preferís no usar la terminal).
2. En vercel.com → **Add New → Project** → elegí ese repositorio.
3. En **Environment Variables**, cargá estas dos (son las mismas del archivo `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. En 1-2 minutos te da un link (algo como `centro-de-control.vercel.app`).

Cada vez que subas un cambio al repositorio, Vercel vuelve a publicar solo.

## Cómo se organizan los permisos

- **Responsable Bloque**: ve y edita todo dentro de su Partido/Provincia — CPOs, registros mensuales, fotos, notas, archivos.
- **Gerencia General**: ve y edita todo, en todos los Partidos/Provincias, y es el único nivel que puede trasladar un CPO de un partido/provincia a otro.

Nada de esto depende de la interfaz: está aplicado directamente en la base de datos (Row Level Security de Supabase), así que aunque alguien mire el tráfico de red no puede ver datos fuera de lo que su rol permite.

## Cómo agregar más personas

1. Supabase Dashboard → **Authentication → Users → Add user** (email + contraseña).
2. Pedime el email y te doy el comando para asignarle el rol (Responsable Bloque + partido/provincia, o Gerencia General).

## Estructura del proyecto

```
app/
  login/          página de acceso
  cpos/           lista de CPOs (página principal)
  cpos/[id]/      detalle de un CPO (fotos, registros, notas, archivos, historial)
  cpos/actions.js todas las operaciones que tocan la base de datos
components/       las piezas de la interfaz
lib/supabase/     conexión a Supabase (cliente y servidor)
middleware.js     controla que solo usuarios con sesión entren
```
