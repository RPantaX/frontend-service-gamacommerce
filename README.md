# GamaCommerce

## Proyecto Angular 18

Este proyecto fue desarrollado con Angular 18.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js** (versión 18.19 o superior recomendada)
- **npm** (viene incluido con Node.js)
- **Angular CLI** versión 18

### Verificar versiones instaladas

```bash
node --version
npm --version
ng version
```

### Instalar Angular CLI

Si aún no tienes Angular CLI instalado globalmente, ejecuta:

```bash
npm install -g @angular/cli@18
```

Esto instalará Angular CLI versión 18 de forma global en tu sistema, permitiéndote usar el comando `ng`.

## Instalación

1. Clona el repositorio (si aún no lo has hecho):

```bash
git clone https://github.com/RPantaX/frontend-service-gamacommerce.git
cd frontend-service-gamacommerce
```

2. Instala las dependencias del proyecto:

```bash
npm install
```

Este comando descargará e instalará todas las dependencias necesarias especificadas en el archivo `package.json`.

## Ejecución del Proyecto

Para ejecutar el servidor de desarrollo, utiliza el siguiente comando:

```bash
ng serve -o
```

O alternativamente:

```bash
npm start
```

La aplicación se abrirá automáticamente en tu navegador predeterminado en `http://localhost:4200/`.

El servidor de desarrollo se recargará automáticamente si realizas cambios en los archivos fuente.

## Comandos Adicionales

### Compilar el proyecto

Para compilar el proyecto para producción:

```bash
ng build
```

Los archivos compilados se almacenarán en el directorio `dist/`.

### Ejecutar pruebas unitarias

```bash
ng test
```

### Ejecutar pruebas end-to-end

```bash
ng e2e
```

### Linting

```bash
ng lint
```

## Estructura del Proyecto

```
proyecto/
├── src/
│   ├── app/           # Componentes y módulos de la aplicación
│   ├── assets/        # Recursos estáticos
│   ├── environments/  # Configuraciones de entorno
│   └── index.html     # Página principal
├── angular.json       # Configuración de Angular
├── package.json       # Dependencias y scripts
└── tsconfig.json      # Configuración de TypeScript
```

## Solución de Problemas

Si encuentras problemas durante la instalación o ejecución:

1. Elimina la carpeta `node_modules` y el archivo `package-lock.json`:
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. Vuelve a instalar las dependencias:
   ```bash
   npm install
   ```

3. Si persisten los problemas, limpia la caché de npm:
   ```bash
   npm cache clean --force
   ```

## Soporte

Para más información sobre Angular CLI, consulta la [documentación oficial](https://angular.io/cli).
