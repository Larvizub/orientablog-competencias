---
applyTo: '**'
---
# OrientaBlog Instructions
- Utiliza unicamente pnpm como gestor de paquetes.
- Utiliza Vite con el framework de React con TypeScript.
- Utiliza unicamente Shadcn UI para los componentes de la interfaz de usuario.
- La interfaz debe tener modo claro y oscuro y debe adaptarse al sistema del usuario.
- Utiliza Firebase Auth y Realtime Database para la autenticación y el almacenamiento de datos.
- Haz que la interfaz inicie con un login y los usuarios se pueda registrar con los campos: nombre, apellido, email, contraseña.
- La plataforma debe tener los siguientes modulos: 
    - **Dasboard**: Solo visible para los administradores, debe mostrar un resumen de la actividad del blog, incluyendo el número de usuarios registrados, el número de publicaciones y comentarios recientes.
    - **Blog**: Donde los usuarios pueden ver todas las publicaciones del blog. Cada publicación debe mostrar el título, el autor, la fecha de publicación y un extracto del contenido. Los usuarios deben poder hacer clic en una publicación para ver el contenido completo y los comentarios asociados. Debe permitir comentarios en cada publicación.
    - **Crear Publicación**: Solo visible para los administradores, debe permitir a los administradores crear nuevas publicaciones del blog. El formulario debe incluir campos para el título, el contenido y la categoría de la publicación.
    - **Agendar Cita**: Donde los usuarios pueden agendar citas. El formulario debe incluir campos para seleccionar la fecha, la hora y el motivo de la sesión. Los usuarios deben poder ver una lista de sus citas agendadas.
    - **Talleres**: Donde los usuarios pueden ver una lista de talleres disponibles. Cada taller debe mostrar el título, la fecha, la descripción y un botón para inscribirse. Los usuarios deben poder hacer clic en un taller para ver más detalles. Debe permitir comentarios en cada taller.
    - **Crear Taller**: Solo visible para los administradores, debe permitir a los administradores crear nuevos talleres. El formulario debe incluir campos para el título, la fecha, la descripción y el número máximo de participantes.
    - **Usuarios**: Solo visible para los administradores, debe mostrar una lista de todos los usuarios registrados. Los administradores deben poder ver detalles del usuario, como nombre, email, fecha de registro y el número de publicaciones realizadas.
    - **Perfil**: Donde los usuarios pueden ver y editar su información personal, como nombre, apellido y contraseña, Perfil profesional, experiencia laboral, habilidades, educación, proyectos, metas profesionales.
