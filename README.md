# RealEstate App 🏡

Proyecto de ejemplo con **API (.NET Core)**, **Web (Next.js)** y **MongoDB**, todo orquestado con **Docker Compose**.

---

## 🚀 Requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 📦 Estructura del proyecto

```
.
├── apps/
│   ├── api/   # Backend en .NET Core
│   └── web/   # Frontend en Next.js
├── docker/
│   └── compose/docker-compose.yml
└── README.md
```

---

## ▶️ Arranque rápido

Clona el repo y entra en la carpeta:

```bash
git clone https://github.com/jsaldana-idrobo/realestate-app.git
cd realestate-app
```

Levanta todo con un solo comando (ejecuta pruebas antes de levantar Docker):

```bash
npm run dev:up
```

_(Este script ejecuta `docker compose -f docker/compose/docker-compose.yml up --build`)_

### Endpoints & ejemplos

- **Listar propiedades**

  ```bash
  curl "http://localhost:8080/api/v1/properties?page=1&pageSize=12&minPrice=100000"
  ```

- **Detalle de propiedad**

  ```bash
  curl "http://localhost:8080/api/v1/properties/68cc5c3a1b42fd4e5878eaf8"
  ```

> En modo Docker, la API expone los datos bajo `http://localhost:8080/api/v1`. El frontend consume la misma API desde `/backend/*` gracias al proxy de Next.js.

---

## 🌐 Servicios disponibles

- **Web (Next.js)** → [http://localhost:3000](http://localhost:3000)
- **API (.NET Core)** → [http://localhost:8080](http://localhost:8080)
- **MongoDB** → `mongodb://localhost:27017`

---

## ⚙️ Variables de entorno

Las principales variables ya están definidas en `docker-compose.yml`:

- `MONGODB_URI=mongodb://mongo:27017`
- `MONGODB_DB=realestate`
- `API_URL=http://api:8080`

👉 Nota: si necesitas exponer `API_URL` en el cliente de Next.js, usa la variable `NEXT_PUBLIC_API_URL`.

---

## ✅ Features Implementados

- **Backend (.NET 8, C#)**

  - API REST con endpoints para listar propiedades.
  - Filtros: nombre, dirección y rango de precios.
  - DTO con: `IdOwner`, `Name`, `AddressProperty`, `PriceProperty`, `Image`.
  - Conexión con MongoDB, seeding inicial y migración automática que normaliza `price` a `Decimal128`.
  - Índices creados automáticamente en arranque (`price`, `createdAt+_id`, `name`, `address`) para acelerar filtros y ordenamientos.
  - Tests unitarios en NUnit ejercitando el repositorio contra una instancia temporal de Mongo (Mongo2Go).

- **Frontend (Next.js)**

  - Listado de propiedades consumiendo la API.
  - Filtros dinámicos (nombre, dirección, rango de precios).
  - Vista de detalle de propiedad.
  - Responsive design.
  - Inputs de precio tolerantes a `.` o `,` (se normalizan antes de aplicar filtros).

- **Infraestructura**
  - Proyecto orquestado con Docker Compose (API, Web, Mongo).
  - Variables de entorno centralizadas.
  - Scripts de arranque rápido.

---

## 🧪 Testing

### Backend (NUnit)

```bash
cd apps/api
dotnet test ./tests/Api.Tests/Api.Tests.csproj
```

> Los tests usan [Mongo2Go](https://github.com/Mongo2Go/Mongo2Go) para levantar un MongoDB efímero y verificar filtros, ordenamientos y paginación del repositorio. Se requiere tener el SDK de .NET 8 instalado y acceso a nuget.org para restaurar paquetes.

### Frontend (Vitest + Testing Library)

```bash
cd apps/web
npm install
npm test -- --run
```

Para correr E2E con Playwright:

```bash
npm run e2e
```

> `npm run dev:up` ejecuta `npm run test:all` como paso previo, así que asegúrate de tener dependencias instaladas (`npm install` en `apps/web`) y acceso a NuGet antes de levantar los contenedores.

---

## 🏗️ Arquitectura y buenas prácticas

- **Clean Architecture**: separación clara de capas en API y frontend.
- **Error Handling**: respuestas estandarizadas en la API.
- **Optimización**:
  - Índices en MongoDB para búsquedas rápidas.
  - Hooks y componentes optimizados en frontend.
- **Código limpio**: tipado estricto (C#, TypeScript), nombres claros, sin lógica duplicada.

### Datos y migraciones

- El contenedor de Mongo guarda los datos en el volumen `mongo_data`.
- Si vienes de una versión donde `price` se guardaba como string, la API normaliza esos registros a `Decimal128` durante el arranque (`EnsureSchemaAsync`).
- Para un reseteo total (vaciar datos y volver a sembrar):

  ```bash
  docker compose -f docker/compose/docker-compose.yml down -v
  npm run dev:up
  ```

---

## 🛑 Apagar los contenedores

```bash
npm run dev:down
```

_(Alias para `docker compose -f docker/compose/docker-compose.yml down`)_

---

## 🧹 Limpieza (opcional)

Si quieres borrar volúmenes (ejemplo: datos de Mongo):

```bash
docker compose -f docker/compose/docker-compose.yml down -v
```
