# 🏨 QuickStay Hotel Manager – Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Chakra%20UI-319795?style=for-the-badge&logo=chakraui&logoColor=white" alt="Chakra UI" />
  <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white" alt="Axios" />
  <img src="https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router" />
</p>

## 📌 Descripción del Proyecto

Interfaz web moderna, reactiva y elegante para la plataforma de gestión hotelera **QuickStay**. Proporciona una experiencia de usuario fluida inspirada en plataformas como Booking y Trivago, permitiendo explorar hoteles, consultar disponibilidad en tiempo real, reservar habitaciones, programar eventos y administrar sucursales a través de dashboards especializados por rol.

> 👥 **Proyecto Colaborativo / En Equipo**  
> Repositorio base original: [CristiannLimaR/Hotel-Manager-Frontend](https://github.com/CristiannLimaR/Hotel-Manager-Frontend).

---

## ✨ Funcionalidades Principales

### 🌐 Para Clientes y Usuarios Generales
- **Explorador de Hoteles:** Catálogo interactivo con filtros avanzados (ubicación, precio, amenidades).
- **Detalle de Hotel:** Información fotográfica, servicios incluidos, reseñas y eventos disponibles.
- **Motor de Reservas:** Selección interactiva de habitaciones por fechas con cálculo automático de costos.
- **Portal de Usuario:** Historial de reservas activas y pasadas, descarga de facturas y gestión de perfil.
- **Eventos:** Visualización de conferencias, celebraciones y eventos organizados en cada hotel.

### 💼 Para Administradores y Managers
- **Platform Admin Dashboard:** Métricas globales, gestión de hoteles en toda la plataforma y asignación de administradores.
- **Hotel Admin Dashboard:** Control total del inventario de habitaciones (creación, edición, precios y estado).
- **Gestión de Servicios y Amenidades:** Catálogo dinámico de servicios ofrecidos por cada hotel.
- **Gestión de Eventos:** Programación y asignación de salones.

---

## 🛠️ Tecnologías Utilizadas

- **Framework:** React.js con Vite
- **Diseño & UI:** Chakra UI + Lucide Icons + React Icons
- **Enrutamiento:** React Router DOM (v6) con rutas protegidas (`ProtectedRoute`)
- **Peticiones HTTP:** Axios con interceptores para autenticación JWT
- **Gestión de Estado:** Hooks personalizados modulares (`useReservation`, `useEvent`, `useHotelEvents`, `useLogin`)
- **Notificaciones & Feedback:** Chakra UI Toast notifications

---

## 🚀 Instalación y Puesta en Marcha

### Prerrequisitos
- Node.js (v18 o superior)
- Backend en ejecución ([Hotel-manager-Backend](https://github.com/RafaelCastroRR/Hotel-manager-Backend))

### 1. Clonar el repositorio
```bash
git clone git@github.com:RafaelCastroRR/Hotel-Manager-Frontend.git
cd Hotel-Manager-Frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_API_URL=http://localhost:3000/hotelManager/v1
```

### 4. Iniciar el entorno de desarrollo
```bash
npm run dev
```

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── assets/              # Imágenes y recursos estáticos
│   ├── components/          # Componentes reutilizables
│   │   ├── admin/           # Dashboards, modales y formularios de administración
│   │   ├── common/          # Barras de búsqueda, loaders y tarjetas
│   │   ├── events/          # Componentes relacionados a eventos
│   │   ├── hotels/          # Tarjetas y listados de hoteles
│   │   ├── layout/          # Navbar, Footer y contenedores principales
│   │   └── routes/          # Rutas protegidas y guardias de navegación
│   ├── pages/               # Páginas principales (Home, Hotels, Booking, Dashboard, etc.)
│   ├── services/            # Clientes de API y endpoints Axios
│   ├── shared/hooks/        # Custom hooks de lógica de negocio y estado
│   └── App.jsx              # Configuración principal de rutas y proveedores
├── package.json
└── README.md
```

---

## 🔗 Backend Asociado
Este frontend se conecta con la API RESTful:  
👉 **[Hotel-manager-Backend](https://github.com/RafaelCastroRR/Hotel-manager-Backend)**

---

## 📄 Licencia
Este proyecto es desarrollado con fines educativos y de demostración técnica.
