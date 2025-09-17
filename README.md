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

Levanta todo con un solo comando:

```bash
npm run dev:up
```

_(Este script ejecuta `docker compose -f docker/compose/docker-compose.yml up --build`)_

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
  - Conexión con MongoDB y seeding inicial.

- **Frontend (Next.js)**

  - Listado de propiedades consumiendo la API.
  - Filtros dinámicos (nombre, dirección, rango de precios).
  - Vista de detalle de propiedad.
  - Responsive design.

- **Infraestructura**
  - Proyecto orquestado con Docker Compose (API, Web, Mongo).
  - Variables de entorno centralizadas.
  - Scripts de arranque rápido.

---

## 🧪 Testing

### Backend (NUnit)

Desde la carpeta `apps/api`:

```bash
dotnet test
```

### Frontend (Jest + React Testing Library)

Desde la carpeta `apps/web`:

```bash
npm test
```

---

## 🏗️ Arquitectura y buenas prácticas

- **Clean Architecture**: separación clara de capas en API y frontend.
- **Error Handling**: respuestas estandarizadas en la API.
- **Optimización**:
  - Índices en MongoDB para búsquedas rápidas.
  - Hooks y componentes optimizados en frontend.
- **Código limpio**: tipado estricto (C#, TypeScript), nombres claros, sin lógica duplicada.

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
