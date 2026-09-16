# Javiiland — Frontend

Frontend en React + React Router para el backend Spring Boot `javiiland` (reservas de eventos infantiles).

## Cómo correrlo

```bash
npm install
cp .env.example .env   # ajusta VITE_API_BASE_URL si tu backend no está en localhost:8080
npm run dev
```

Se abre en `http://localhost:5173`. Asegúrate de que el backend esté corriendo en `http://localhost:8080` (o el puerto que pongas en `.env`).

## ⚠️ Habilita CORS en el backend

Tu `ReservaController` y `UsuarioController` no tienen CORS configurado, y por defecto Spring Boot bloqueará las peticiones desde `http://localhost:5173`. Agrega algo así antes de probar el front (por ejemplo una clase de configuración):

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

## ⚠️ Autenticación: estado actual (importante)

Tu backend **todavía no tiene Spring Security ni JWT** (lo dice el propio `application.properties`). Ahora mismo:

- `POST /api/usuarios/login` solo valida usuario/contraseña y devuelve el `UsuarioResponseDto`, sin token.
- Ningún endpoint de `/api/reservas` verifica quién hace la petición ni su rol.

Para que la app funcionara *hoy*, el frontend guarda el usuario devuelto por login (id, username, role, etc.) en `localStorage` y con eso decide qué mostrar (rutas de admin, botón de reservar, etc.). **Esto es solo control de UI, no seguridad real**: cualquiera con las herramientas de desarrollador podría editar ese `localStorage` o llamar a la API directamente y actuar como admin, o reservar a nombre de otro `usuarioId`.

Antes de llevar esto a producción, te recomiendo:

1. Agregar Spring Security + JWT (o sesiones) al backend.
2. Hacer que `login` devuelva un token, y que el frontend lo mande en el header `Authorization: Bearer ...` (ya dejé el interceptor comentado en `src/api/axiosClient.js`, listo para activar).
3. Proteger en el backend los endpoints de creación/edición/borrado de reservas según rol (hoy cualquiera puede pegarle a `PUT/DELETE /api/reservas/{id}` sin login).
4. Usar el usuario autenticado del backend (no un `usuarioId` que manda el cliente) para crear reservas, en vez del `@RequestParam Long usuarioId` actual.

Nada de esto bloquea que uses el frontend para desarrollar y probar el flujo completo — solo ten esto en mente antes de exponerlo a usuarios reales.

## Estructura

```
src/
  api/              cliente axios + servicios (uno por controller)
  context/          AuthContext (usuario logueado en localStorage)
  components/       NavBar, Layout, CalendarioMensual, ReservaCard, ProtectedRoute
  pages/            una página por ruta
  styles/           hoja de estilos global (sin librería de UI)
```

## Rutas

| Ruta | Quién puede entrar | Qué hace |
|---|---|---|
| `/` | Todo público | Calendario mensual con días libres/ocupados |
| `/ingresar` | Todo público | Login |
| `/registro` | Todo público | Registro de usuario nuevo |
| `/reservar` | Usuarios logueados | Elegir un día libre y crear una reserva |
| `/mis-reservas` | Usuarios logueados | Ver sus propias reservas |
| `/admin` | Solo rol `ADMIN` | Ver/crear/cancelar cualquier reserva |
| `/admin/reservas/:id/editar` | Solo rol `ADMIN` | Editar fecha, evento, descripción o estado |

## Notas de comportamiento

- El calendario público solo muestra `date` + `available` (viene de `GET /api/reservas/calendario`), así que nunca expone el nombre del evento ni de quién reservó a alguien que no está logueado.
- "Cancelar" no borra la reserva: llama a `DELETE /api/reservas/{id}`, que según el comentario en `Reserva.java` deja el registro en estado `CANCELLED` y libera la fecha.
- Los usuarios normales, según lo que pediste, solo pueden **crear** reservas; modificarlas o cancelarlas es tarea de un admin desde `/admin`. Si más adelante quieres que un usuario pueda cancelar su propia reserva desde "Mis reservas", es un botón más reutilizando `reservaService.cancelar`.
