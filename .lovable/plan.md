# Finanzas: porcentajes globales por tipo de consulta

El filtro por consultorio y la sección Personalización ya están implementados y no se tocan. Este plan cubre solo el rediseño de la sección Finanzas. Todo sigue siendo mock, en memoria, sin backend.

## 1. Datos mock

Cada consultorio pasa de tener un único `totalFacturado` + `porcentaje` propio a tener dos totales:

- Neurovital: Particular $50.000 · Obra Social $30.512
- Infancias: Particular $32.000 · Obra Social $20.340

Los consultorios nuevos creados desde Configuración arrancan en $0 en ambos.

Se agregan dos porcentajes globales al estado compartido, editables:

- Particular: 15%
- Obra Social: 20%

## 2. Panel de porcentajes globales

Arriba de la lista de consultorios (debajo del resumen general), una tarjeta con dos inputs numéricos: "Porcentaje Particular" y "Porcentaje Obra Social". Teclado numérico en mobile, alto mínimo 44px, valores acotados entre 0 y 100. Cualquier cambio recalcula en vivo todas las cards de abajo.

## 3. Card de cada consultorio

Se reemplaza el bloque actual por dos filas apiladas más un subtotal:

```text
Neurovital
  Particular       Facturado $50.000   15%
                   Al consultorio $7.500   A favor $42.500
  Obra Social      Facturado $30.512   20%
                   Al consultorio $6.102   A favor $24.410
  ─────────────────────────────────────────
  Subtotal         Facturado $80.512
                   Al consultorio $13.602  A favor $66.910
```

El % se muestra solo de lectura en cada fila (se edita únicamente en el panel de arriba). Fórmula: al consultorio = facturado × %, a favor = facturado × (100 − %).

En mobile las filas se apilan verticalmente con el mismo padding y tamaño de fuente actuales, sin truncar texto.

## 4. Resumen general

"Total a favor" y "Total a pagar" pasan a sumar los subtotales de los consultorios visibles: con el filtro en "Todos" suma todos; con un consultorio elegido, muestra solo ese subtotal.

## Detalles técnicos

- `mock-data.ts`: `ConsultorioMock` cambia `totalFacturado`/`porcentaje` por `facturadoParticular` y `facturadoObraSocial`; se agrega `PORCENTAJES_MOCK = { particular: 15, obraSocial: 20 }`.
- `mock-store.tsx`: se quita `setPorcentaje` por consultorio y se agrega `porcentajes` + `setPorcentajeTipo`.
- `routes/finanzas.tsx`: nuevo layout con panel global, cards desglosadas y totales recalculados; helper de cálculo local a la vista.
- No se agregan librerías ni endpoints.
