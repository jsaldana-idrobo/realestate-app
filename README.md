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
git clone https://github.com/TU-USUARIO/realestate-app.git
cd realestate-app
```

Levanta todo con un solo comando:

```bash
npm run dev:up
```

*(Este script ejecuta `docker compose -f docker/compose/docker-compose.yml up --build`)*

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

## 🛑 Apagar los contenedores

```bash
npm run dev:down
```

*(Alias para `docker compose -f docker/compose/docker-compose.yml down`)*

---

## 📖 Notas útiles

- La API se inicia con `SEED_ON_START=true`, lo que carga datos iniciales en la base de datos.
- Puedes modificar los orígenes permitidos en la API con la variable `ALLOWED_ORIGINS`.
- Next.js reescribe automáticamente las llamadas a `/api/*` hacia el servicio `api` en Docker.

---

## 🧹 Limpieza (opcional)

Si quieres borrar volúmenes (ejemplo: datos de Mongo):

```bash
docker compose -f docker/compose/docker-compose.yml down -v
```
