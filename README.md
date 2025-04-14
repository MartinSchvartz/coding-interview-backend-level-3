# Bienvenido al coding-interview-backend-level-3 - Parte I

## Descripción
Eres el Senior Developer de tu equipo en El Dorado, y te han dado la responsabilidad de desarrollar un nuevo feature que nos pide el equipo de producto:

> API REST que permita realizar operaciones CRUD sobre una entidad de tipo `Item`.
>
> La entidad tiene 3 campos: `id`, `name` y `price`.
>
>

# Requisitos:
- Si el servicio se reinicia, los datos no se pueden perder.
- Tienes que implementar tu codigo como si estuvieses haciendo un servicio para El Dorado listo para produccion.
- Completar la implementación de toda la funcionalidad de forma tal de que los tests e2e pasen exitosamente.


### Que puedes hacer: 
- ✅ Modificar el código fuente y agregar nuevas clases, métodos, campos, etc.
- ✅ Cambiar dependencias, agregar nuevas, etc.
- ✅ Modificar la estructura del proyecto (/src/** es todo tuyo)
- ✅ Elegir una base de datos
- ✅ Elegir un framework web
- ✅ Crear tests
- ✅ Cambiar la definición del .devContainer


### Que **no** puedes hacer:
- ❌ No puedes modificar el archivo original /e2e/index.test.ts (pero puedes crear otros test si lo deseas)
- ❌ El proyecto debe usar Typescript 
- ❌ Estresarte 🤗

## Implementación

Esta implementación utiliza:
- Hapi.js como framework web
- PostgreSQL como base de datos
- TypeORM como ORM
- Una arquitectura en capas (modelos, repositorios, servicios, handlers)

### Estructura del proyecto

```
src/
  ├── config/            # Configuración de la aplicación
  ├── models/            # Definición de entidades
  ├── repositories/      # Acceso a datos
  ├── services/          # Lógica de negocio
  ├── handlers/          # Controladores para las rutas
  ├── routes.ts          # Definición de rutas
  ├── server.ts          # Configuración del servidor
  └── index.ts           # Punto de entrada
```

## Instalación y Ejecución

### Requisitos previos
- Node.js (v16+)
- Docker y Docker Compose

### Pasos para ejecutar

1. Instalar dependencias:
```bash
npm install
```

2. Iniciar la base de datos PostgreSQL con Docker:
```bash
docker-compose up
```

3. Ejecutar la aplicación:
```bash
npm run dev
```

4. Ejecutar los tests:
```bash
npm test
```

## API Endpoints

- `GET /items` - Obtener todos los items
- `GET /items/{id}` - Obtener un item por ID
- `POST /items` - Crear un nuevo item
- `PUT /items/{id}` - Actualizar un item existente
- `DELETE /items/{id}` - Eliminar un item

## Documentación API

La API incluye documentación Swagger en la ruta `/docs`. Después de iniciar la aplicación, puedes acceder a:

```
http://localhost:3000/docs
```

## Testing

El proyecto incluye un conjunto completo de pruebas para garantizar la calidad del codigo

### Pruebas E2E
- Verifican el funcionamiento completo de la API
- Prueban los endpoints CRUD básicos
- Incluyen pruebas de validación para campos requeridos y precios negativos

### Unit tests
- **Repositorios**: Pruebas de operaciones CRUD y manejo de datos
- **Servicios**: Pruebas de lógica de negocio y validaciones
- **Handlers**: Pruebas de respuestas HTTP y manejo de errores
- **Rutas**: Pruebas de configuración de rutas, esquemas de validación y respuestas

### Para correr las pruebas

```bash
# Ejecutar pruebas e2e
npm test

# Ejecutar unit testing
npm run test:unit

# Ejecutar todas las pruebas
npm run test:all
```

## Pasos para comenzar
1. Haz un fork usando este repositorio como template
2. Clona el repositorio en tu máquina
3. Realiza los cambios necesarios para que los tests pasen
4. Sube tus cambios a tu repositorio
5. Avísanos que has terminado
6. ???
7. PROFIT

### Cualquier duda contactarme a https://www.linkedin.com/in/andreujuan/
