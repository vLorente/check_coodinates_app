# Plan de Desarrollo - Aplicación de Validación de Coordenadas

## 📋 Información General

**Proyecto:** Check Coordinates App  
**Framework:** Angular 21.0.0  
**Stack Tecnológico:** TypeScript 5.9, Tailwind CSS 4.1, Google Maps API, Vitest  
**Fecha:** Diciembre 6, 2025  
**API Backend:** `http://localhost:8000/api`

---

## 🎯 Objetivo del Proyecto

Desarrollar una aplicación web Angular 21 que permita validar si unas coordenadas geográficas (latitud y longitud) corresponden a una dirección postal específica. La aplicación utilizará Google Maps para visualización, mostrará la ubicación de ambos puntos en un mapa, y calculará la ruta entre ellos.

### Casos de Uso Principales

1. **Validar Coordenadas**: Usuario ingresa dirección postal + coordenadas → Sistema valida si corresponden
2. **Visualizar en Mapa**: Mostrar marcadores de dirección y coordenadas en Google Maps
3. **Ver Ruta**: Trazar ruta entre la ubicación de la dirección y las coordenadas ingresadas
4. **Historial**: Consultar validaciones realizadas anteriormente

---

## 📐 Arquitectura del Proyecto

### Estructura de Carpetas

```
src/app/
├── core/                           # Servicios singleton, modelos, configuración
│   ├── models/
│   │   ├── coordinate.model.ts     # Interface para coordenadas (lat, lng)
│   │   ├── address.model.ts        # Interface para dirección postal
│   │   ├── validation.model.ts     # Interfaces ValidationRequest, ValidationResult
│   │   └── index.ts                # Barrel export
│   ├── services/
│   │   ├── api.service.ts          # HTTP client wrapper con base URL
│   │   ├── validation.service.ts   # Lógica de negocio de validación
│   │   ├── map.service.ts          # Gestión de Google Maps (geocoding, directions)
│   │   └── storage.service.ts      # LocalStorage para historial
│   ├── interceptors/
│   │   ├── error.interceptor.ts    # Manejo global de errores HTTP
│   │   └── logging.interceptor.ts  # Log de peticiones (opcional)
│   └── config/
│       └── environment.ts          # Re-export de environment con tipos
│
├── features/                       # Módulos funcionales
│   ├── validation/
│   │   ├── components/
│   │   │   ├── validation-form/
│   │   │   │   ├── validation-form.component.ts
│   │   │   │   ├── validation-form.component.html
│   │   │   │   ├── validation-form.component.css
│   │   │   │   └── validation-form.component.spec.ts
│   │   │   ├── validation-result/
│   │   │   │   ├── validation-result.component.ts
│   │   │   │   ├── validation-result.component.html
│   │   │   │   └── validation-result.component.spec.ts
│   │   │   └── validation-history/
│   │   │       ├── validation-history.component.ts
│   │   │       ├── validation-history.component.html
│   │   │       └── validation-history.component.spec.ts
│   │   └── pages/
│   │       ├── validation-page/
│   │       │   ├── validation-page.component.ts
│   │       │   ├── validation-page.component.html
│   │       │   └── validation-page.component.css
│   │       └── history-page/
│   │           ├── history-page.component.ts
│   │           └── history-page.component.html
│   │
│   └── map/
│       └── components/
│           ├── map-viewer/
│           │   ├── map-viewer.component.ts
│           │   ├── map-viewer.component.html
│           │   └── map-viewer.component.spec.ts
│           └── route-display/
│               ├── route-display.component.ts
│               └── route-display.component.html
│
├── shared/                         # Componentes reutilizables
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button/
│   │   │   │   ├── button.component.ts
│   │   │   │   └── button.component.spec.ts
│   │   │   ├── input/
│   │   │   │   ├── input.component.ts
│   │   │   │   └── input.component.spec.ts
│   │   │   ├── card/
│   │   │   │   └── card.component.ts
│   │   │   ├── loading-spinner/
│   │   │   │   └── loading-spinner.component.ts
│   │   │   ├── alert/
│   │   │   │   ├── alert.component.ts
│   │   │   │   └── alert.component.spec.ts
│   │   │   └── modal/
│   │   │       ├── modal.component.ts
│   │   │       └── modal.component.spec.ts
│   │   └── layout/
│   │       └── navbar/
│   │           ├── navbar.component.ts
│   │           └── navbar.component.html
│   └── pipes/
│       └── coordinate-format.pipe.ts  # Formatear coordenadas (opcional)
│
├── layouts/
│   └── main-layout/
│       ├── main-layout.component.ts
│       ├── main-layout.component.html
│       └── main-layout.component.css
│
├── app.routes.ts                   # Configuración de rutas
├── app.config.ts                   # Configuración de la aplicación
└── app.ts                          # Componente raíz

src/
├── environments/
│   ├── environment.ts              # Producción
│   └── environment.development.ts  # Desarrollo
├── index.html                      # HTML principal
├── main.ts                         # Bootstrap
└── styles.css                      # Estilos globales (Tailwind)
```

---

## 🚀 Plan de Desarrollo por Fases

### **FASE 1: Configuración de Infraestructura Base** ⚙️
**Duración estimada:** 2-3 horas  
**Prioridad:** 🔴 Crítica

#### 1.1 Instalación de Dependencias
```bash
npm install @angular/google-maps
```

#### 1.2 Configuración de Entornos
**Archivos a crear:**
- `src/environments/environment.ts`
- `src/environments/environment.development.ts`

**Contenido:**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000/api',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY_HERE'
};
```

#### 1.3 Configuración de HTTP Client
**Archivo:** `src/app/app.config.ts`

**Cambios:**
- Agregar `provideHttpClient(withInterceptors([errorInterceptor]))`
- Importar `provideZoneChangeDetection` si es necesario

#### 1.4 Carga de Google Maps Script
**Archivo:** `src/index.html`

**Agregar antes de `</head>`:**
```html
<script>
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})
    ({key: "YOUR_GOOGLE_MAPS_API_KEY_HERE", v: "weekly"});
</script>
```

#### 1.5 Documentación de API Key
**Archivo:** `README.md`

**Sección a agregar:**
```markdown
## 🔑 Configuración de Google Maps API Key

1. Obtener API Key desde [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar APIs necesarias:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
3. Copiar `.env.example` a `.env`
4. Agregar tu API key en `GOOGLE_MAPS_API_KEY`
```

**Checklist Fase 1:**
- [ ] Instalar `@angular/google-maps`
- [ ] Crear archivos de environment
- [ ] Configurar `provideHttpClient()` en app.config
- [ ] Agregar script de Google Maps a index.html
- [ ] Documentar setup de API key en README
- [ ] Crear archivo `.env.example`

---

### **FASE 2: Modelos y Servicios Core** 🏗️
**Duración estimada:** 3-4 horas  
**Prioridad:** 🔴 Crítica

#### 2.1 Modelos TypeScript
**Archivos a crear:**

**`src/app/core/models/coordinate.model.ts`**
```typescript
export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface CoordinateInput {
  lat: string | number;
  lng: string | number;
}
```

**`src/app/core/models/address.model.ts`**
```typescript
export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  fullAddress?: string;
}
```

**`src/app/core/models/validation.model.ts`**
```typescript
import { Coordinate } from './coordinate.model';
import { Address } from './address.model';

export interface ValidationRequest {
  address: Address;
  coordinates: Coordinate;
}

export interface ValidationResult {
  id: string;
  isValid: boolean;
  distance: number; // en metros
  message: string;
  addressCoordinates: Coordinate;
  inputCoordinates: Coordinate;
  timestamp: Date;
  route?: google.maps.DirectionsResult;
}

export interface ValidationHistory {
  validations: ValidationResult[];
  total: number;
}
```

**`src/app/core/models/index.ts`** (Barrel export)
```typescript
export * from './coordinate.model';
export * from './address.model';
export * from './validation.model';
```

#### 2.2 ApiService
**Archivo:** `src/app/core/services/api.service.ts`

**Responsabilidades:**
- Wrapper de HttpClient
- Gestión de base URL desde environment
- Métodos genéricos: `get<T>()`, `post<T>()`, `put<T>()`, `delete<T>()`
- Manejo de errores con signals

**Patrón de implementación:**
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  async get<T>(endpoint: string): Promise<T> {
    return firstValueFrom(
      this.http.get<T>(`${this.baseUrl}${endpoint}`)
    );
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    return firstValueFrom(
      this.http.post<T>(`${this.baseUrl}${endpoint}`, body)
    );
  }
}
```

#### 2.3 ValidationService
**Archivo:** `src/app/core/services/validation.service.ts`

**Estado con signals:**
```typescript
private validationsSignal = signal<ValidationResult[]>([]);
validations = this.validationsSignal.asReadonly();

loading = signal(false);
error = signal<string | null>(null);

validationCount = computed(() => this.validations().length);
```

**Métodos principales:**
- `async validateCoordinates(request: ValidationRequest): Promise<ValidationResult>`
- `async loadValidations(): Promise<void>`
- `clearValidations(): void`

#### 2.4 MapService
**Archivo:** `src/app/core/services/map.service.ts`

**Responsabilidades:**
- Geocoding de direcciones usando Google Maps Geocoding API
- Cálculo de distancia entre dos coordenadas
- Obtención de rutas usando Directions API
- Gestión de marcadores y polylines

**Métodos principales:**
```typescript
async geocodeAddress(address: Address): Promise<Coordinate>
async getDirections(origin: Coordinate, destination: Coordinate): Promise<google.maps.DirectionsResult>
calculateDistance(coord1: Coordinate, coord2: Coordinate): number
```

#### 2.5 StorageService
**Archivo:** `src/app/core/services/storage.service.ts`

**Responsabilidades:**
- Persistencia en localStorage
- Métodos: `save()`, `load()`, `clear()`
- Serialización/deserialización de objetos

**Checklist Fase 2:**
- [ ] Crear interfaces de modelos (Coordinate, Address, ValidationRequest, ValidationResult)
- [ ] Implementar ApiService con async/await y firstValueFrom
- [ ] Implementar ValidationService con signals
- [ ] Implementar MapService con Google Maps APIs
- [ ] Implementar StorageService para localStorage
- [ ] Crear tests unitarios para servicios
- [ ] Crear barrel exports (index.ts)

---

### **FASE 3: Componentes de Validación** 📝
**Duración estimada:** 5-6 horas  
**Prioridad:** 🟡 Alta

#### 3.1 ValidationFormComponent
**Archivo:** `src/app/features/validation/components/validation-form/validation-form.component.ts`

**Características:**
- Reactive Form con `FormBuilder`
- Validadores: required, pattern para coordenadas, formato de dirección
- Signals para loading y error
- Output `onValidationComplete` con ValidationResult

**Estructura del formulario:**
```typescript
validationForm = this.fb.group({
  address: this.fb.group({
    street: ['', Validators.required],
    city: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['España', Validators.required]
  }),
  coordinates: this.fb.group({
    latitude: ['', [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]],
    longitude: ['', [Validators.required, Validators.pattern(/^-?\d+\.?\d*$/)]]
  })
});
```

**Template (validation-form.component.html):**
- Uso de `@if` para mostrar errores
- Bindings de clase directos `[class.error]`
- Botón con estado disabled basado en `formInvalid` signal

#### 3.2 ValidationResultComponent
**Archivo:** `src/app/features/validation/components/validation-result/validation-result.component.ts`

**Características:**
- Input `result` con `input.required<ValidationResult>()`
- Output `onViewMap` para navegar a visualización
- Computed values para formato de datos

**Información a mostrar:**
- ✅/❌ Estado de validación
- 📍 Coordenadas de la dirección (geocoded)
- 📍 Coordenadas ingresadas
- 📏 Distancia entre puntos
- 🕐 Timestamp de validación
- 💬 Mensaje de resultado

#### 3.3 ValidationHistoryComponent
**Archivo:** `src/app/features/validation/components/validation-history/validation-history.component.ts`

**Características:**
- Tabla con `@for` y track by id
- Signals para filtrado y ordenación
- Output `onSelectValidation` para ver detalles
- Paginación (si hay más de 10 items)

**Columnas de la tabla:**
- Fecha/Hora
- Dirección
- Coordenadas
- Resultado (✅/❌)
- Distancia
- Acciones (Ver en mapa, Eliminar)

#### 3.4 Pages Container Components
**ValidationPageComponent:** Orquesta FormComponent + ResultComponent + MapViewer  
**HistoryPageComponent:** Container para ValidationHistoryComponent

**Checklist Fase 3:**
- [ ] Crear ValidationFormComponent con reactive forms
- [ ] Implementar validadores custom para coordenadas
- [ ] Crear ValidationResultComponent con inputs/outputs
- [ ] Crear ValidationHistoryComponent con tabla
- [ ] Implementar paginación si es necesario
- [ ] Crear ValidationPageComponent (container)
- [ ] Crear HistoryPageComponent
- [ ] Tests unitarios con fakeAsync y tick()
- [ ] Estilos con Tailwind CSS

---

### **FASE 4: Integración de Google Maps** 🗺️
**Duración estimada:** 4-5 horas  
**Prioridad:** 🟡 Alta

#### 4.1 MapViewerComponent
**Archivo:** `src/app/features/map/components/map-viewer/map-viewer.component.ts`

**Imports necesarios:**
```typescript
import { GoogleMap, MapMarker, MapPolyline } from '@angular/google-maps';
```

**Inputs:**
- `addressCoordinates: InputSignal<Coordinate | null>`
- `inputCoordinates: InputSignal<Coordinate | null>`
- `showRoute: InputSignal<boolean>`

**Configuración del mapa:**
```typescript
mapOptions = signal<google.maps.MapOptions>({
  center: { lat: 40.4168, lng: -3.7038 }, // Madrid por defecto
  zoom: 12,
  mapTypeId: 'roadmap',
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false
});
```

**Marcadores:**
- 🔵 Azul: Ubicación de la dirección (geocoded)
- 🔴 Rojo: Coordenadas ingresadas por el usuario

#### 4.2 RouteDisplayComponent
**Archivo:** `src/app/features/map/components/route-display/route-display.component.ts`

**Responsabilidades:**
- Dibujar polyline entre dos puntos
- Mostrar información de la ruta (distancia, tiempo estimado)
- Usar `MapDirectionsService` de Google Maps

**Template:**
```html
<google-map [options]="mapOptions()">
  <map-marker [position]="addressMarker()" [options]="addressMarkerOptions" />
  <map-marker [position]="inputMarker()" [options]="inputMarkerOptions" />
  
  @if (showRoute() && routePath()) {
    <map-polyline [path]="routePath()" [options]="polylineOptions" />
  }
</google-map>

@if (routeInfo()) {
  <div class="route-info">
    <p>Distancia: {{ routeInfo().distance }}</p>
    <p>Tiempo estimado: {{ routeInfo().duration }}</p>
  </div>
}
```

#### 4.3 Integración con ValidationPageComponent

**Flujo:**
1. Usuario completa formulario y envía
2. ValidationService llama a backend API
3. MapService geocodifica la dirección
4. Resultado se muestra en ValidationResultComponent
5. Mapa se actualiza mostrando ambos marcadores
6. Si user hace click en "Ver ruta", RouteDisplayComponent dibuja el camino

**Checklist Fase 4:**
- [ ] Implementar MapViewerComponent con GoogleMap
- [ ] Configurar marcadores con diferentes colores
- [ ] Implementar RouteDisplayComponent con polyline
- [ ] Integrar MapDirectionsService para rutas
- [ ] Conectar componentes de mapa con ValidationPage
- [ ] Implementar auto-centrado del mapa basado en marcadores
- [ ] Agregar controles de zoom y vista
- [ ] Tests con mocks de Google Maps APIs

---

### **FASE 5: Componentes Compartidos y Layout** 🎨
**Duración estimada:** 4-5 horas  
**Prioridad:** 🟢 Media

#### 5.1 Componentes UI Reutilizables

**ButtonComponent** (`shared/components/ui/button/`)
```typescript
@Component({
  selector: 'app-button',
  template: `
    <button 
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="buttonClasses()">
      @if (loading()) {
        <span class="spinner"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
  host: {
    '[class.btn]': 'true'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
  disabled = input(false);
  loading = input(false);
  
  buttonClasses = computed(() => {
    const base = 'px-4 py-2 rounded-md font-medium transition-colors';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    };
    return `${base} ${variants[this.variant()]}`;
  });
}
```

**InputComponent** (`shared/components/ui/input/`)
- Wrapper para inputs con validación visual
- Inputs: `label`, `error`, `required`, `type`
- Integración con reactive forms usando `ControlValueAccessor`

**AlertComponent** (`shared/components/ui/alert/`)
```typescript
type = input<'success' | 'error' | 'warning' | 'info'>('info');
message = input.required<string>();
dismissible = input(true);
onDismiss = output<void>();
```

**LoadingSpinnerComponent** (`shared/components/ui/loading-spinner/`)
- Simple spinner con Tailwind CSS
- Input `size`: 'sm' | 'md' | 'lg'

**ModalComponent** (`shared/components/ui/modal/`)
- Generic modal con projection de contenido
- Inputs: `isOpen`, `title`, `showCloseButton`
- Outputs: `onClose`

**CardComponent** (`shared/components/ui/card/`)
- Container con estilos consistentes
- Inputs: `title`, `subtitle`, `padding`

#### 5.2 Layout Components

**NavbarComponent** (`shared/components/layout/navbar/`)
```html
<nav class="bg-white shadow-sm">
  <div class="container mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-gray-800">
          📍 Check Coordenadas
        </h1>
      </div>
      
      <div class="flex gap-4">
        <a routerLink="/validation" 
           routerLinkActive="text-blue-600"
           class="hover:text-blue-600">
          Validar
        </a>
        <a routerLink="/history" 
           routerLinkActive="text-blue-600"
           class="hover:text-blue-600">
          Historial
        </a>
      </div>
    </div>
  </div>
</nav>
```

**MainLayoutComponent** (`layouts/main-layout/`)
```html
<div class="min-h-screen bg-gray-50">
  <app-navbar />
  
  <main class="container mx-auto px-4 py-8">
    <router-outlet />
  </main>
  
  <footer class="bg-white border-t mt-auto">
    <div class="container mx-auto px-4 py-4 text-center text-gray-600">
      <p>&copy; 2025 Check Coordenadas - Validación de ubicaciones</p>
    </div>
  </footer>
</div>
```

**Checklist Fase 5:**
- [ ] Crear ButtonComponent con variants
- [ ] Crear InputComponent con ControlValueAccessor
- [ ] Crear AlertComponent con tipos
- [ ] Crear LoadingSpinnerComponent
- [ ] Crear ModalComponent
- [ ] Crear CardComponent
- [ ] Crear NavbarComponent con routerLink
- [ ] Crear MainLayoutComponent
- [ ] Estilos Tailwind consistentes
- [ ] Tests unitarios de componentes
- [ ] Documentar componentes compartidos

---

### **FASE 6: Routing, Testing y Deployment** 🚀
**Duración estimada:** 5-6 horas  
**Prioridad:** 🟢 Media-Alta

#### 6.1 Configuración de Rutas
**Archivo:** `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'validation',
        pathMatch: 'full'
      },
      {
        path: 'validation',
        loadComponent: () => import('./features/validation/pages/validation-page/validation-page.component')
          .then(m => m.ValidationPageComponent),
        title: 'Validar Coordenadas'
      },
      {
        path: 'history',
        loadComponent: () => import('./features/validation/pages/history-page/history-page.component')
          .then(m => m.HistoryPageComponent),
        title: 'Historial de Validaciones'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'validation'
  }
];
```

**Características:**
- Lazy loading de componentes de páginas
- Layout wrapper con MainLayoutComponent
- Títulos de página dinámicos
- Redirección de rutas no encontradas

#### 6.2 Interceptors

**ErrorInterceptor** (`src/app/core/interceptors/error.interceptor.ts`)
```typescript
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';
      
      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del servidor
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
      
      console.error('HTTP Error:', errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
```

#### 6.3 Testing Strategy

**Estructura de Tests:**
```
src/app/
├── core/
│   ├── services/
│   │   ├── api.service.spec.ts
│   │   ├── validation.service.spec.ts
│   │   ├── map.service.spec.ts
│   │   └── storage.service.spec.ts
├── features/
│   └── validation/
│       └── components/
│           ├── validation-form/
│           │   └── validation-form.component.spec.ts
│           ├── validation-result/
│           │   └── validation-result.component.spec.ts
│           └── validation-history/
│               └── validation-history.component.spec.ts
└── shared/
    └── components/
        └── ui/
            ├── button/button.component.spec.ts
            ├── alert/alert.component.spec.ts
            └── modal/modal.component.spec.ts
```

**Patrón de Test con fakeAsync:**
```typescript
it('should validate coordinates successfully', fakeAsync(async () => {
  const mockResult: ValidationResult = {
    id: '1',
    isValid: true,
    distance: 50,
    message: 'Coordenadas válidas',
    addressCoordinates: { latitude: 40.4168, longitude: -3.7038 },
    inputCoordinates: { latitude: 40.4170, longitude: -3.7040 },
    timestamp: new Date()
  };
  
  apiServiceSpy.post.and.returnValue(Promise.resolve(mockResult));
  
  const promise = service.validateCoordinates(mockRequest);
  tick(); // Avanzar reloj virtual
  
  const result = await promise;
  expect(result.isValid).toBe(true);
  expect(service.loading()).toBe(false);
}));
```

**Mocks de Google Maps:**
```typescript
const mockGoogleMaps = {
  Geocoder: jasmine.createSpy().and.returnValue({
    geocode: jasmine.createSpy().and.returnValue(Promise.resolve({
      results: [{ geometry: { location: { lat: () => 40.4168, lng: () => -3.7038 } } }]
    }))
  }),
  DirectionsService: jasmine.createSpy().and.returnValue({
    route: jasmine.createSpy().and.returnValue(Promise.resolve(mockDirectionsResult))
  })
};
```

**Coverage Goals:**
- Services: 90%+ (críticos)
- Components: 75%+
- Overall: 70%+

**Comandos:**
```bash
npm run test              # Ejecutar todos los tests
npm run test:coverage     # Con reporte de cobertura
npm run test:watch        # Modo watch
```

#### 6.4 Docker Configuration

**Dockerfile**
```dockerfile
# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist/check-coordinates-app/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "4200:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: unless-stopped

  # Opcional: Backend API (si lo desarrollas)
  # backend:
  #   image: your-backend-image
  #   ports:
  #     - "8000:8000"
  #   environment:
  #     - DATABASE_URL=...
```

**nginx.conf**
```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
      try_files $uri $uri/ /index.html;
    }

    # Cachear assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
      expires 1y;
      add_header Cache-Control "public, immutable";
    }
  }
}
```

#### 6.5 Documentación

**README.md - Actualizar con:**
```markdown
# 📍 Check Coordenadas App

Aplicación Angular 21 para validar si coordenadas geográficas corresponden a una dirección postal.

## 🚀 Quick Start

### Prerequisitos
- Node.js 20+
- npm 10+
- Google Maps API Key

### Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd check_coodinates_app
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env y agregar tu GOOGLE_MAPS_API_KEY
```

4. Ejecutar en desarrollo:
```bash
npm start
# Navegar a http://localhost:4200
```

## 🔑 Configurar Google Maps API Key

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Crear credenciales → API Key
5. Copiar key a `src/environments/environment.development.ts`

## 🧪 Tests

```bash
npm run test              # Ejecutar tests
npm run test:coverage     # Con cobertura
```

## 🐳 Docker

```bash
docker-compose up --build
# App disponible en http://localhost:4200
```

## 📦 Build para Producción

```bash
npm run build
# Output en dist/
```

## 🏗️ Arquitectura

- **Angular 21** con standalone components
- **Signals** para estado reactivo
- **Google Maps** para visualización
- **Tailwind CSS** para estilos
- **Vitest** para testing

## 📚 Estructura del Proyecto

Ver `docs/PLAN-DESARROLLO.md` para detalles completos.
```

**Checklist Fase 6:**
- [ ] Configurar rutas con lazy loading
- [ ] Implementar errorInterceptor
- [ ] Crear tests unitarios (>70% coverage)
- [ ] Configurar mocks de Google Maps para tests
- [ ] Crear Dockerfile
- [ ] Crear docker-compose.yml
- [ ] Crear nginx.conf
- [ ] Actualizar README.md
- [ ] Crear .env.example
- [ ] Documentar APIs y componentes

---

## 📊 Estimación de Esfuerzo Total

| Fase | Duración | Complejidad |
|------|----------|-------------|
| Fase 1: Infraestructura | 2-3h | Media |
| Fase 2: Modelos y Servicios | 3-4h | Alta |
| Fase 3: Componentes Validación | 5-6h | Alta |
| Fase 4: Google Maps | 4-5h | Alta |
| Fase 5: UI y Layout | 4-5h | Media |
| Fase 6: Testing y Deploy | 5-6h | Media |
| **TOTAL** | **23-29 horas** | - |

---

## ✅ Convenciones de Código (Angular 21)

### Siempre Usar ✅
- ✅ Standalone components (default, no especificar)
- ✅ Signals: `signal()`, `computed()`, `set()`, `update()`
- ✅ `inject()` en lugar de constructor DI
- ✅ `input()` y `output()` en lugar de decoradores
- ✅ `ChangeDetectionStrategy.OnPush` en todos los componentes
- ✅ Control flow nativo: `@if`, `@for`, `@switch`
- ✅ Bindings directos de class/style
- ✅ Reactive Forms
- ✅ async/await con `firstValueFrom()`
- ✅ Host bindings en objeto `host`

### Nunca Usar ❌
- ❌ `standalone: true` explícito
- ❌ `@Input()` / `@Output()` decoradores
- ❌ Constructor injection
- ❌ `.subscribe()` directamente
- ❌ `mutate()` en signals
- ❌ `*ngIf`, `*ngFor`, `*ngSwitch`
- ❌ `ngClass`, `ngStyle`
- ❌ `@HostBinding`, `@HostListener`

---

## 🎯 Criterios de Aceptación

### Funcionalidad
- [ ] Usuario puede ingresar dirección y coordenadas
- [ ] Sistema valida si coordenadas corresponden a dirección
- [ ] Mapa muestra ambas ubicaciones con marcadores diferentes
- [ ] Se puede visualizar ruta entre ubicación de dirección y coordenadas
- [ ] Historial guarda validaciones anteriores
- [ ] Interfaz responsive (mobile, tablet, desktop)

### Calidad de Código
- [ ] TypeScript strict mode sin errores
- [ ] Todos los componentes usan OnPush
- [ ] Estado manejado con signals
- [ ] Sin uso de `any` type
- [ ] Código sigue convenciones de Angular 21

### Testing
- [ ] Cobertura general >70%
- [ ] Cobertura servicios críticos >90%
- [ ] Tests con fakeAsync y tick()
- [ ] Mocks de Google Maps funcionando

### UI/UX
- [ ] Diseño limpio con Tailwind CSS
- [ ] Loading states en todas las operaciones async
- [ ] Error handling con mensajes claros
- [ ] Accesibilidad básica (contraste, ARIA labels)
- [ ] Responsive en 3 breakpoints

### Deployment
- [ ] Dockerfile funcional
- [ ] docker-compose.yml configurado
- [ ] README.md completo con instrucciones
- [ ] Variables de entorno documentadas
- [ ] Build de producción optimizado

---

## 🔄 Flujo de Trabajo Git

```bash
# Feature branches
git checkout -b feature/validation-form
git checkout -b feature/google-maps-integration
git checkout -b feature/validation-history

# Commits convencionales
git commit -m "feat: add validation form component"
git commit -m "fix: correct coordinate validation logic"
git commit -m "test: add validation service tests"
git commit -m "docs: update README with API setup"
```

---

## 📝 Notas Importantes

### Google Maps API
- Requiere facturación habilitada en Google Cloud (cuenta de tarjeta)
- APIs gratuitas hasta cierto límite de requests
- Geocoding: $5 por 1000 requests después de los primeros 40,000/mes
- Directions: $5 por 1000 requests después de los primeros 40,000/mes
- **Recomendación:** Implementar rate limiting y caché

### Backend API
- El plan asume que existe un backend en `http://localhost:8000/api`
- Si no existe, considerar:
  - Mock Service Worker (MSW) para desarrollo
  - JSON Server como mock backend
  - Implementar backend real (Node.js, Python, etc.)

### Persistencia
- Historial se puede guardar en:
  - **Opción 1:** localStorage (solo cliente, no persiste entre dispositivos)
  - **Opción 2:** Backend API (requiere endpoints adicionales)
  - **Recomendado:** Combinación (localStorage como caché + API sync)

---

## 🎓 Recursos de Referencia

- [Angular 21 Documentation](https://angular.dev/)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [@angular/google-maps](https://github.com/angular/components/tree/main/src/google-maps)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)

---

**Última actualización:** Diciembre 6, 2025  
**Versión:** 1.0  
**Estado:** Plan Completo - Listo para Implementación
