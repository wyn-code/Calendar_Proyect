# Rediseño mobile-first del Calendario

## Diagnóstico de lo que existe hoy

- **Ruta principal** (`src/routes/index.tsx`): concentra estado (mes/año, diálogos), carga de datos y exportación de planilla PDF vía la API.
- **Grilla** (`src/components/turnos/CalendarGrid.tsx`): grilla fija de 7 columnas x 6 semanas, celdas con altura automática que listan todos los turnos. En pantallas chicas cada columna queda de ~45px: ahí está el problema de legibilidad y de área táctil.
- **Fechas**: sin librería externa. Todo se calcula con `Date` nativo en `src/lib/turnos.ts` (`buildMonthGrid`, `toKey`, `formatFechaLarga`, nombres de meses/días en español). Se mantiene tal cual.
- **Datos**: turnos vienen de la API (`/api/v1`) con React Query (`use-appointments`, `use-patients`, `use-obra-sociales`) y se normalizan a `Turno { hora, nombre, tipo, obraSocial, observacion }`.
- **Diálogos**: `TurnoDialog` (alta/edición) y `DayDetailDialog` (detalle del día), ambos Dialog centrado de shadcn.
- **Estilo**: tokens malva/rosa en `src/styles.css`, fondo floral en `PageShell`, chips `CoberturaBadge`.
- **Sesión**: login contra un backend externo (FastAPI en `127.0.0.1:8000`), no administrado desde este proyecto.

Nota importante: el modelo actual **no tiene "servicio" ni "estado"** (confirmado/cancelado/completado). Los datos por turno son hora, paciente, cobertura (Particular / Obra Social) y observación. Las cards mostrarán esos campos; agregar estados requiere cambios de backend.

## Plan de implementación (solo capa visual/UX)

1. **Selector de vista Día / Semana / Mes**
   - Segmented control propio (botones, 44px de alto) en el header.
   - Estado `vista` en la ruta; por defecto **Día** en <768px y **Mes** en desktop, detectado con un hook `useIsMobile`.

2. **Header sticky de navegación**
   - Barra pegajosa arriba: flecha atrás, fecha/mes tocable (abre un popover con mini-calendario para saltar a una fecha), flecha adelante, botón "Hoy".
   - El paso de navegación se adapta a la vista activa (día / semana / mes).

3. **Vista Día (mobile por defecto)**
   - Agenda vertical: cards de turno con hora grande, nombre del paciente, chip de cobertura y observación truncada.
   - Cards de mínimo 44px, buen espaciado, orden por hora.
   - Estado vacío con ícono de calendario + texto "No hay turnos este día" y botón para agregar.

4. **Vista Semana (mobile)**
   - Fila horizontal de chips de días (DOM–SAB con número y punto indicador si hay turnos) + lista de turnos del día elegido debajo, reutilizando las cards de la vista Día.
   - En desktop la semana se muestra en columnas como hasta ahora.

5. **Vista Mes**
   - Se mantiene `CalendarGrid` intacta en desktop; en mobile se compacta (solo número de día + puntos/contador de turnos) y al tocar un día se salta a la vista Día.

6. **Acciones rápidas**
   - FAB fijo abajo a la derecha (con safe-area) para crear turno en la fecha seleccionada.
   - Nuevo componente `BottomSheet` (Radix Dialog con animación desde abajo, drag handle) que reemplaza al detalle centrado en mobile: muestra el turno y acciones Editar / Eliminar. En desktop sigue siendo diálogo centrado.

7. **Swipe y transiciones**
   - Swipe horizontal con handlers de puntero nativos (sin librerías) para avanzar/retroceder día o semana.
   - Transiciones suaves de opacidad/desplazamiento al cambiar de vista o fecha, usando `tw-animate-css` ya presente.

8. **Sistema de diseño**
   - Sin cambios de paleta: se reutilizan tokens y `CoberturaBadge` existentes.

## Archivos

- Nuevos: `src/hooks/use-is-mobile.ts`, `src/components/ui/sheet.tsx` (bottom sheet), `src/components/turnos/ViewSwitcher.tsx`, `CalendarHeader.tsx`, `DayAgenda.tsx`, `TurnoCard.tsx`, `WeekStrip.tsx`, `TurnoSheet.tsx`, `AddTurnoFab.tsx`.
- Modificados: `src/routes/index.tsx` (composición y estado de vista/fecha), `CalendarGrid.tsx` (densidad mobile), `DayDetailDialog.tsx` (usado solo en desktop).
- Sin cambios: hooks de datos, `src/lib/turnos.ts`, `src/lib/api.ts`, lógica de guardado y exportación PDF.

## Sobre el usuario para iniciar sesión

El login apunta a un backend propio externo (FastAPI), que no forma parte de este proyecto y al que no tengo acceso, así que no puedo crear ni entregarte credenciales. Opciones:

- Pasame un email/contraseña ya existentes en ese backend y los uso para verificar la vista.
- O activamos Lovable Cloud para tener autenticación real dentro del proyecto (usuarios, sesiones, recuperación de contraseña) y dejo de depender del backend externo.
