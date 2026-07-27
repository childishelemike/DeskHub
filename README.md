# DeskHub — Sistema de Reserva de Espacios de Oficina

Sistema multi-tenant de gestión y reserva de escritorios/espacios de oficina, pensado para que múltiples empresas clientes puedan gestionar sus propias sedes, espacios y reservas de forma completamente aislada entre sí.

## Stack Tecnológico

- **Backend:** ASP.NET Core (.NET 10) + Entity Framework Core + SQL Server
- **Frontend:** Angular 22 + Angular Material
- **Autenticación:** JWT (JSON Web Tokens) con BCrypt para hash de contraseñas
- **Arquitectura:** Multi-tenant (aislamiento de datos por empresa vía Global Query Filters de EF Core)

## Características principales

- Autenticación JWT con roles (Admin, Manager, Employee)
- Multi-tenancy: cada empresa cliente ve únicamente sus propios datos (oficinas, usuarios, reservas)
- Gestión de oficinas con horarios de operación configurables
- Reservas de espacios con validación de solapamiento de horarios
- Autorización granular por rol (ej. un Employee solo puede gestionar sus propias reservas)

## Lecciones aprendidas durante el desarrollo

Esta sección documenta problemas técnicos reales encontrados durante la construcción del proyecto y cómo se resolvieron — útil como referencia para quien quiera entender las decisiones detrás del código.

### 1. Remapeo automático de claims JWT en ASP.NET Core
Al generar un JWT con el claim estándar `sub` (`JwtRegisteredClaimNames.Sub`), el middleware de autenticación de ASP.NET Core lo remapea automáticamente a `ClaimTypes.NameIdentifier` al validarlo (comportamiento heredado de compatibilidad con WS-Federation). Esto causaba un `ArgumentNullException` al intentar leer el claim `sub` directamente desde `HttpContext.User`. **Solución:** usar `ClaimTypes.NameIdentifier` consistentemente, tanto al generar como al leer el claim del ID de usuario.

### 2. Procesos duplicados de `dotnet run` sirviendo código desactualizado
En Windows con Git Bash, `Ctrl+C` no siempre mata el proceso hijo de `dotnet run`, dejando el puerto ocupado por una versión vieja del backend mientras se prueban cambios nuevos. Esto generó horas de confusión pensando que el código no se aplicaba. **Solución:** verificar procesos activos con `tasklist | grep dotnet` y matarlos explícitamente antes de reiniciar.

### 3. Breaking changes en `Microsoft.OpenApi` v2.x
Al actualizar `Microsoft.OpenApi` para corregir una vulnerabilidad de seguridad (GHSA-v5pm-xwqc-g5wc), la v2.x introdujo cambios incompatibles en la API (el namespace `Microsoft.OpenApi.Models` y la propiedad `.Reference` en `OpenApiSecurityScheme` fueron removidos). **Solución:** usar la nueva sintaxis con `OpenApiSecuritySchemeReference` y un lambda en `AddSecurityRequirement`.

### 4. Angular 22 generado en configuración zoneless sin declarar el polyfill
El proyecto Angular se generó sin `zone.js` en `angular.json > polyfills`, pero la configuración inicial (`app.config.ts`) usaba `provideZoneChangeDetection`, que sí requiere Zone.js. Esto causaba una pantalla en blanco con el error `NG0908`. **Solución:** agregar explícitamente `"polyfills": ["zone.js"]` en `angular.json`.

### 5. Constraints de FOREIGN KEY con múltiples rutas de cascada en SQL Server
Al agregar multi-tenancy (`CompanyId` en `User` y `Office`), SQL Server rechazó la migración por detectar dos posibles rutas de cascada al borrar una `Company` (directa a `Users`, e indirecta vía `Offices`). **Solución:** configurar `DeleteBehavior.Restrict` en la relación `User → Company`, dejando `Cascade` solo en `Office → Company`.

## Instalación local

### Backend
\`\`\`bash
cd DeskHub.Api
dotnet restore
dotnet ef database update
dotnet run --launch-profile https
\`\`\`
La API corre en `https://localhost:7290` (Swagger disponible en `/swagger`).

### Frontend
\`\`\`bash
cd deskhub-client
npm install
ng serve
\`\`\`
La app corre en `http://localhost:4200`.

## Roadmap

- [x] Modelo de datos y CRUD base (Oficinas, Espacios, Reservas)
- [x] Multi-tenancy con aislamiento de datos
- [x] Autenticación JWT
- [x] Autorización por roles
- [x] Validación de horarios de operación por oficina
- [ ] Restricción de días de la semana para reservas
- [ ] Frontend: Login + Dashboard
- [ ] Frontend: Calendario de reservas
- [ ] Frontend: Panel administrativo (gestión de oficinas, espacios, usuarios)
- [ ] Despliegue en la nube (demo en vivo)