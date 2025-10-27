# DIPASO PWA - Microfrontends Monorepo

Este repositorio contiene la plataforma **DIPASO POS Web**, una solución modular de punto de venta (POS) basada en microfrontends (MFEs) usando React y Vite. El sistema permite gestionar usuarios, facturación, caja, inventario, clientes y auditoría, integrando cada dominio como un microfrontend independiente, orquestado por el contenedor central `shell`.

---

## Estructura del Proyecto

```
project_dipaso_pwa/
│
├── design-system/         # Paquete compartido de componentes, estilos y tokens
├── shell/                 # Contenedor principal (host) que orquesta los MFEs
├── iam-administration/    # MFE: Gestión de usuarios, roles y permisos (IAM)
├── pos-billing/           # MFE: Facturación POS
├── pos-cash/              # MFE: Caja POS (apertura/cierre)
├── pos-inventory/         # MFE: Inventario POS
├── pos-clients/           # MFE: Gestión de clientes POS
├── pos-auditory/          # MFE: Auditoría POS
├── authorizer/            # MFE: Autenticación/autorización
├── documentacion/         # Documentación y bitácoras
├── package.json           # Configuración de workspaces y scripts globales
└── README.md              # Este archivo
```

---

## Arquitectura

- **Microfrontends (MFEs):** Cada dominio funcional es un microfrontend independiente, con su propio ciclo de vida, dependencias y despliegue.
- **Shell (Host):** El contenedor central (`shell/`) carga y orquesta los MFEs usando Module Federation (Vite).
- **Design System:** Paquete compartido de componentes UI, estilos y utilidades para mantener consistencia visual y funcional.
- **Comunicación:** Los MFEs se comunican con el shell y entre sí mediante rutas, props y eventos compartidos.

---

## Tecnologías Principales

- **Frontend:** React, TypeScript, Vite, CSS/SASS
- **Microfrontends:** Module Federation (via `@originjs/vite-plugin-federation`)
- **Estilos:** CSS Modules, SASS, Design System propio
- **Ruteo:** React Router DOM
- **Gestión de estado:** Context API, hooks personalizados
- **Backend (según módulo):** Python (Flask/FastAPI/Django), PostgreSQL/SQLite
- **Control de versiones:** Git

---

## Scripts principales

Desde la raíz (`project_dipaso_pwa/`):

```sh
# Instalar todas las dependencias
npm install

# Levantar todos los MFEs y el shell en modo desarrollo
npm run dev:all

# Compilar todos los MFEs y el shell
npm run build

# Limpiar dist de todos los MFEs y shell
npm run clean
```

Cada microfrontend tiene sus propios scripts (`dev`, `build`, `start`, etc.) en su carpeta respectiva.

---

## Cómo ejecutar localmente

1. Clona el repositorio:
   ```sh
   git clone https://github.com/adricast/git-pwa.git
   cd project_dipaso_pwa
   ```

2. Instala las dependencias:
   ```sh
   npm install
   ```

3. Levanta todos los microfrontends y el shell:
   ```sh
   npm run dev
   ```
   Esto inicia cada MFE en su propio puerto y el shell en el puerto principal (por defecto, 3000).

4. Accede a la aplicación en [http://localhost:3000](http://localhost:3000).

---

## Estructura de carpetas típica de un MFE

```
iam-administration/
├── public/
├── src/
│   ├── features/         # Lógica de negocio por dominio
│   ├── components/       # Componentes reutilizables
│   ├── pages/            # Vistas y rutas principales
│   ├── services/         # Llamadas a APIs y lógica de datos
│   ├── App.tsx           # Componente raíz del MFE
│   └── main.tsx          # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Design System

El paquete [`design-system`](project_dipaso_pwa/design-system) contiene:

- Componentes React reutilizables (botones, formularios, tablas, layouts)
- Tokens de diseño (colores, tipografía, espaciado)
- Helpers y utilidades
- Estilos globales y por componente

Todos los MFEs deben consumir componentes y estilos desde este paquete para mantener la coherencia visual.

---

## Buenas prácticas

- Cada MFE debe ser autónomo y desacoplado.
- Usa el design-system para UI y estilos.
- Mantén las rutas y la lógica de negocio separadas por dominio.
- Usa scripts y configuraciones centralizadas para facilitar el mantenimiento.
- Realiza commits claros y descriptivos.
- Asegúrate de que los tests pasen antes de abrir un pull request.

---


## Créditos

Desarrollado por el equipo Hitss para Dipaso.

---