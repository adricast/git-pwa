# DIPASO PWA

Este repositorio contiene la aplicación **DIPASO POS Web**, una plataforma modular de punto de venta (POS) con gestión de usuarios (IAM), facturación, inventario, caja, clientes, auditoría y reportes.  
El proyecto combina **React** para el frontend y **Python** para servicios backend.

---

## Estructura principal del proyecto

/apps  
├─ shell/ # Contenedor host que integra los módulos  
├─ iam-management/ # Módulo remoto de gestión de usuarios y permisos (IAM)  
├─ pos-billing/ # Módulo remoto de facturación POS  
├─ pos-cash/ # Módulo remoto de caja POS  
├─ pos-inventory/ # Módulo remoto de inventario POS  
├─ pos-customers/ # Módulo remoto de gestión de clientes POS  
├─ pos-audit/ # Módulo remoto de auditoría POS  
└─ pos-reports/ # Módulo remoto de reportes POS

### Detalles por módulo

- **shell/**: Contenedor principal que orquesta todos los módulos remotos y carga la aplicación frontend.  
- **iam-management/**: Maneja autenticación, autorización y gestión de roles de usuarios.  
- **pos-billing/**: Control de facturación y emisión de comprobantes.  
- **pos-cash/**: Registro de movimientos de caja, apertura y cierre.  
- **pos-inventory/**: Gestión de inventario, entradas y salidas de productos.  
- **pos-customers/**: Administración de información de clientes y fidelización.  
- **pos-audit/**: Auditoría de transacciones y operaciones.  
- **pos-reports/**: Generación de reportes financieros, ventas y estadísticas.

---

## Tecnologías

- **Frontend:** React, TypeScript, CSS/SCSS  
- **Backend:** Python (Flask/FastAPI o Django según implementación)  
- **Control de versiones:** Git  
- **Base de datos:** PostgreSQL / SQLite (según módulo)  

---

## Archivos importantes

- `.gitignore` → Configuración de archivos ignorados por Git (Node, Python, IDE, OS).  
- `README.md` → Documentación del proyecto.  
- `package.json` → Dependencias del frontend.  
- `requirements.txt` → Dependencias del backend Python.  

---

## Cómo ejecutar

1. Clona el repositorio:  
   
   ```bash
   git clone https://github.com/adricast/git-pwa.git
   ```

2. Instala dependencias frontend (React):
   
       cd apps/shell
       npm install
       npm start

3. Instala dependencias backend (Python):
   
   
   
   
       cd apps/pos-billing  # o cualquier módulo backend
       python -m venv venv
       venv\Scripts\activate    # Windows
       pip install -r requirements.txt
       python app.py           # o el script principal

Contribuir
----------

* Sigue la rama `main` para producción y crea ramas de desarrollo para nuevas funcionalidades.

* Realiza commits claros y descriptivos.

* Asegúrate de que los tests pasen antes de abrir un pull request.
