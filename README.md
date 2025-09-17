# RealEstate Monorepo

Monorepo de ejemplo para la prueba técnica (API .NET + MongoDB + placeholder Next.js).  
Este repo está listo para levantarse con **Docker Compose** y ya incluye un **seed** con propiedades de ejemplo.

## Estructura
```
/
├─ apps/
│  ├─ api/                 # .NET 9 Web API + MongoDB
│  └─ web/                 # Placeholder Next.js (siguiente paso)
├─ docker/
│  └─ compose/
│     └─ docker-compose.yml
├─ packages/
│  └─ contracts/           # DTOs compartidos (TS) - opcional, placeholder
└─ README.md
```

## Requisitos
- Docker y Docker Compose

## Arranque rápido
```bash
# desde la raíz
docker compose -f docker/compose/docker-compose.yml up --build -d
# API disponible en: http://localhost:8080 (Swagger en /swagger)
# Mongo en: mongodb://localhost:27017
```

> La API crea índices y hace **seed automático** al arrancar (solo si `SEED_ON_START=true`).

## Variables de entorno (API)
- `MONGODB_URI` (por defecto: `mongodb://mongo:27017` en docker)
- `MONGODB_DB` (por defecto: `realestate`)
- `MONGODB_COLLECTION_PROPERTIES` (por defecto: `properties`)
- `SEED_ON_START` (true|false, por defecto: true en compose dev)

## Endpoints principales
- `GET /health` → healthcheck
- `GET /api/v1/properties` → listado con filtros y paginación
- `GET /api/v1/properties/{id}` → detalle

### Ejemplos
```
GET /api/v1/properties?name=park&minPrice=150000&maxPrice=800000&page=1&pageSize=10&sortBy=price&sortDir=asc
```

## Próximos pasos
1. Añadir la app de **Next.js** en `apps/web` (con filtros y SSR).
2. Crear CI (lint + tests).
3. Documentación extra en `/docs`.
