# OrientaBlog - Plataforma de Orientación Profesional# React + TypeScript + Vite



Una plataforma web completa desarrollada con React, TypeScript, Firebase y Shadcn UI para gestión de contenido, citas y talleres de orientación profesional.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## CaracterísticasCurrently, two official plugins are available:



- 🔐 **Autenticación**: Sistema completo de login y registro con Firebase Auth- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh

- 👥 **Gestión de Usuarios**: Control de acceso por roles (Admin/Usuario)- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- 📝 **Blog**: Sistema de publicaciones con comentarios

- 📅 **Citas**: Sistema de agendamiento de citas## Expanding the ESLint configuration

- 🎓 **Talleres**: Gestión de talleres y eventos

- 🌙 **Tema Oscuro/Claro**: Adaptación automática al sistema del usuarioIf you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

- 📱 **Responsive**: Diseño adaptable a todos los dispositivos

```js

## Tecnologíasexport default tseslint.config([

  globalIgnores(['dist']),

- **Frontend**: React 19, TypeScript, Vite  {

- **UI**: Shadcn UI, Tailwind CSS    files: ['**/*.{ts,tsx}'],

- **Backend**: Firebase Realtime Database    extends: [

- **Autenticación**: Firebase Auth      // Other configs...

- **Routing**: React Router DOM

- **Gestión de Estado**: Context API      // Remove tseslint.configs.recommended and replace with this

      ...tseslint.configs.recommendedTypeChecked,

## Instalación      // Alternatively, use this for stricter rules

      ...tseslint.configs.strictTypeChecked,

### Prerrequisitos      // Optionally, add this for stylistic rules

      ...tseslint.configs.stylisticTypeChecked,

- Node.js (versión 18 o superior)

- pnpm (gestor de paquetes)      // Other configs...

    ],

### Configuración del proyecto    languageOptions: {

      parserOptions: {

1. **Instalar dependencias**:        project: ['./tsconfig.node.json', './tsconfig.app.json'],

   ```bash        tsconfigRootDir: import.meta.dirname,

   pnpm install      },

   ```      // other options...

    },

2. **Configurar Firebase**:  },

   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)])

   - Habilitar Authentication (Email/Password)```

   - Habilitar Realtime Database

   - Copiar la configuración de FirebaseYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



3. **Configurar variables de entorno**:```js

   ```bash// eslint.config.js

   cp .env.example .envimport reactX from 'eslint-plugin-react-x'

   ```import reactDom from 'eslint-plugin-react-dom'

   

   Editar `.env` con tus credenciales de Firebase:export default tseslint.config([

   ```env  globalIgnores(['dist']),

   VITE_FIREBASE_API_KEY=tu_api_key_aqui  {

   VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com    files: ['**/*.{ts,tsx}'],

   VITE_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.firebaseio.com/    extends: [

   VITE_FIREBASE_PROJECT_ID=tu_proyecto      // Other configs...

   VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com      // Enable lint rules for React

   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id      reactX.configs['recommended-typescript'],

   VITE_FIREBASE_APP_ID=tu_app_id      // Enable lint rules for React DOM

   ```      reactDom.configs.recommended,

    ],

4. **Iniciar el servidor de desarrollo**:    languageOptions: {

   ```bash      parserOptions: {

   pnpm run dev        project: ['./tsconfig.node.json', './tsconfig.app.json'],

   ```        tsconfigRootDir: import.meta.dirname,

      },

## Estado Actual      // other options...

    },

✅ **Completado:**  },

- Configuración base del proyecto (Vite + React + TypeScript)])

- Sistema de temas claro/oscuro adaptable al sistema```

- Configuración completa de Firebase Auth y Realtime Database
- Sistema de autenticación (login/registro) con validaciones
- Estructura de navegación con control de acceso por roles
- Dashboard de administración con estadísticas básicas
- Diseño responsive con Shadcn UI

🚧 **En desarrollo:**
- Módulo completo del Blog con gestión de publicaciones
- Sistema de comentarios
- Formularios de creación de publicaciones y talleres
- Sistema de agendamiento de citas
- Gestión completa de usuarios
- Perfil de usuario con información profesional

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── auth/           # Componentes de autenticación
│   ├── layout/         # Componentes de layout
│   ├── theme-provider.tsx
│   └── ui/             # Componentes UI de Shadcn
├── contexts/           # Contextos de React
│   └── AuthContext.tsx
├── lib/                # Utilidades y configuraciones
│   ├── firebase.ts
│   └── utils.ts
├── pages/              # Páginas principales
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   └── Blog.tsx
├── App.tsx
└── main.tsx
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build
pnpm run preview

# Linting
pnpm run lint
```

## Próximas Funcionalidades

### Módulo Blog
- [ ] Lista de publicaciones con paginación
- [ ] Vista detallada de publicaciones
- [ ] Sistema de comentarios
- [ ] Búsqueda y filtros
- [ ] Categorías

### Gestión de Contenido
- [ ] Editor de publicaciones con Markdown
- [ ] Subida de imágenes
- [ ] Programación de publicaciones
- [ ] Moderación de comentarios

### Sistema de Citas
- [ ] Calendario interactivo
- [ ] Notificaciones por email
- [ ] Gestión de disponibilidad
- [ ] Recordatorios automáticos

### Talleres
- [ ] Sistema de inscripciones
- [ ] Límites de participantes
- [ ] Certificados de participación
- [ ] Evaluaciones y feedback

### Perfil de Usuario
- [ ] CV profesional
- [ ] Portfolio de proyectos
- [ ] Seguimiento de progreso
- [ ] Historial de actividades

## Configuración de Firebase

Para usar la aplicación necesitas:

1. **Crear proyecto Firebase**
2. **Habilitar Authentication** (Email/Password)
3. **Configurar Realtime Database**
4. **Establecer reglas de seguridad**

### Reglas sugeridas para Realtime Database:
```json
{
  "rules": {
    "usuarios": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('usuarios').child(auth.uid).child('isAdmin').val() === true",
        ".write": "$uid === auth.uid || root.child('usuarios').child(auth.uid).child('isAdmin').val() === true"
      }
    },
    "publicaciones": {
      ".read": true,
      ".write": "root.child('usuarios').child(auth.uid).child('isAdmin').val() === true"
    }
  }
}
```

## Contribución

Este proyecto está en desarrollo activo. Las contribuciones son bienvenidas:

1. Fork del proyecto
2. Crear rama para tu feature
3. Commit de tus cambios
4. Push a la rama
5. Crear Pull Request

---

**Nota**: Actualmente el proyecto incluye valores de demostración en `.env`. Para uso en producción, reemplaza con tus credenciales reales de Firebase.