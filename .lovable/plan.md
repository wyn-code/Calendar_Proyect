# Filtro por consultorio + sección Personalización

Todo frontend, con datos mock en memoria. No se toca el calendario ni el modal "Nuevo turno".

## 1. Filtro de consultorio reutilizable

- Nuevo componente único `ConsultorioFilter`, montado arriba del contenido en Pacientes, Facturas, Finanzas, Personalización y Configuración (nunca en Calendario).
- Opciones: "Todos" + un ítem por consultorio existente ("Neurovital", "Infancias" y los que se agreguen en Configuración).
- Una sola fila siempre: en desktop se ven como chips/tabs; en mobile (o cuando hay más de 3 consultorios) colapsa a un dropdown compacto de una línea, sin scroll horizontal.
- El valor elegido vive en el contexto mock compartido, así que se mantiene al navegar entre secciones.
- Efecto por sección:
  - Pacientes: muestra solo los pacientes de ese consultorio (y el contador del encabezado se ajusta).
  - Finanzas: muestra solo ese bloque y los totales generales se recalculan sobre lo filtrado.
  - Facturas: el formulario de revisión precarga ese consultorio; con "Todos" queda libre para elegirlo.
  - Configuración: la lista de consultorios se acota al elegido (la administración sigue igual: agregar, renombrar, eliminar).
  - Personalización: el filtro se muestra por consistencia; los ajustes visuales son globales.

## 2. Nueva sección "Personalización"

Nuevo ítem en el menú entre Finanzas y Configuración, con su propia ruta y su propio título/descripción.

Contenido:

- **Color principal**: 6 swatches (rosa, violeta, verde, azul, coral, gris) más un color picker libre. Botones de al menos 44px, en grilla de 3 columnas en mobile.
- **Fondo de pantalla**: 4 opciones predefinidas (el floral actual + tres degradés suaves en rosa, lila y crema) más "Subir imagen" con vista previa local mediante `URL.createObjectURL`, sin subir nada a ningún servidor.
- **Vista previa en vivo**: recuadro chico tipo mini pantalla con el fondo elegido, un botón y un par de acentos en el color elegido, antes de aplicar.
- **Aplicar cambios**: recién ahí el color y el fondo se propagan a toda la app (botones, acentos, fondo de todas las vistas).
- **Restablecer valores por defecto**: vuelve al rosa original y al fondo floral.
- Todo en estado local: se pierde al recargar, sin persistencia.

## Detalles técnicos

- El color se aplica escribiendo las variables CSS del tema (`--primary`, `--primary-foreground`, `--ring`) en el elemento raíz; el texto sobre el color se elige automático (claro u oscuro) según el brillo.
- El fondo se aplica desde `PageShell`, que pasa a leer el fondo activo del contexto en lugar de tener la imagen fija.
- El contexto mock (`mock-store`) suma: filtro de consultorio activo, tema "borrador" para la vista previa y tema aplicado.
- Se agrega un componente `select`/dropdown reutilizable sobre las piezas de shadcn ya instaladas (Radix dropdown), sin librerías nuevas.
- Nueva ruta `/personalizacion` con su `head()` propio.
