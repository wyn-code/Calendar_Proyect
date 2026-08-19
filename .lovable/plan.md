# Menú lateral + secciones mock (Pacientes, Facturas, Finanzas, Configuración)

Todo el trabajo es frontend con datos mock en estado local. No se toca el modal "Nuevo turno", ni los hooks de datos reales del calendario.

## 1. Limpieza en el calendario

- Quitar el ícono de usuario que está junto a la leyenda "Particular / O.S Obra Social".
- Quitar los badges "A FAVOR" y "TOTAL A PAGAR" de la barra del mes; queda solo `‹ AGOSTO 2026 ›` centrado.
- Agregar un botón de menú (ícono hamburguesa) en el header para abrir el drawer.

## 2. Menú deslizante

- Panel deslizante desde la izquierda: 88% del ancho en mobile, 300px en desktop, con overlay, botón X y cierre por swipe/tap fuera.
- Estructura: título arriba, 5 items de navegación al centro (Calendario, Pacientes, Facturas, Finanzas, Configuración) con ícono y estado activo resaltado, y footer fijo con el email mock `agustina.peralta@email.com` y "Cerrar sesión" (solo `console.log`).
- Al navegar en mobile el menú se cierra solo.
- Misma paleta rosada/violeta y tipografía actuales.

## 3. Pacientes (mock)

- Buscador por nombre + filtro rápido Todos / Particular / Obra Social.
- Desktop: tabla con Nombre, DNI, Obra Social, Sesiones este mes, Última factura, acción "Subir factura".
- Mobile: una card por paciente con los mismos datos y el botón de acción a lo ancho.
- 5 pacientes mock, consultorios/obra social consistentes con lo existente (Neurovital, Infancias).
- "Subir factura" abre el mismo flujo de Facturas con el campo Paciente precargado; al confirmar se actualizan en la fila "Sesiones este mes" y "Última factura cargada".

## 4. Facturas (mock)

Máquina de estados con 5 pantallas: inicial (dropzone + "Elegir archivo" / "Tomar foto" con `capture="environment"`), procesando (loader 1,5 s con `setTimeout`), revisión (formulario editable con Paciente, DNI, Obra Social, N° Afiliado, Periodo, Fecha de emisión, N° factura, Sesiones, Monto, Porcentaje a abonar, Fecha de pago), éxito ("Cargar otra factura") y error ("No pudimos leer los datos automáticamente" + formulario vacío). El error se simula de forma ocasional para poder verlo.

## 5. Finanzas (mock)

- Resumen general arriba: Total a favor y Total a pagar.
- Un bloque por consultorio (Neurovital, Infancias) con input de porcentaje editable y recálculo instantáneo: total facturado, monto al consultorio y monto a favor.

## 6. Configuración (mock)

- Consultorios: lista editable con agregar, renombrar y eliminar con confirmación.
- Precios por tipo de consulta: Particular $20.000, Obra Social $15.000, Discapacidad $12.000, con autoguardado al perder foco.

## Mobile

Inputs de 44px mínimo, `inputMode="numeric"` en DNI/montos/porcentajes/sesiones, scroll interno en formularios y tablas, botón principal sticky abajo respetando safe-area, y scroll automático al enfocar un input.

## Detalles técnicos

- Nuevos componentes `ui/sheet.tsx` y `ui/alert-dialog.tsx` construidos sobre `@radix-ui/react-dialog`, ya instalado — no se agregan librerías.
- Nuevas rutas TanStack: `/facturas`, `/finanzas`, `/configuracion`, más un layout compartido que monta el drawer y el botón de menú.
- La ruta `/pacientes` actual usa la API real; se reemplaza su contenido por la versión mock pedida (los hooks `usePatients`/`useUpdatePatient` quedan en el proyecto, sin uso en esa vista).
- El flujo de facturas vive en un componente reutilizable, usado tanto por `/facturas` como por el botón de la tabla de pacientes.
- Los datos mock se centralizan en `src/lib/mock-data.ts`; el estado compartido de consultorios/porcentajes/pacientes vive en un contexto React en memoria (sin persistencia).
- Cada ruta nueva lleva su propio `head()` con título y descripción.
