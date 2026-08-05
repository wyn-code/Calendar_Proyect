# Calendar Pro

Necesito una aplicación web mobile-first con React + TypeScript + Tailwind, usando shadcn/ui para los componentes.

## Vista principal: Calendario mensual

- Grilla de calendario estilo agenda, con encabezado de días de la semana en español abreviado: DOM, LUN, MAR, MIE, JUE, VIE, SAB.

- Encima de la grilla, un header con el nombre del mes y año actual, y flechas (< >) para navegar entre meses.

- Cada celda del día debe mostrar el número de día en la esquina superior, y debajo un espacio para listar los turnos agendados ese día.

- Diseño limpio con bordes finos tipo tabla, como una hoja de calendario para imprimir.

- Debe ser completamente responsive: en mobile, la grilla se adapta a pantalla angosta (los textos se acortan, las celdas se apilan bien, mantiene el scroll vertical si hace falta).

## Interacción: click en una fecha

- Al hacer click/tap sobre una celda de día, se abre una modal (usar Dialog de shadcn/ui) con un formulario para cargar un turno:

  1. Horario de inicio (input tipo time)

  2. Nombre y apellido (input de texto)

  3. Tipo de consulta: un select o radio group con dos opciones: "Particular" y "Obra Social"

- Botón "Guardar" que agrega el turno a esa fecha, y botón "Cancelar" para cerrar sin guardar.

- Se pueden agregar múltiples turnos en el mismo día (mostrar todos, ordenados por horario).

## Visualización de turnos en el calendario

- Cada turno cargado se muestra dentro de la celda del día como una línea compacta con el formato: "HH:MM - Nombre Apellido (P)" si es Particular, o "HH:MM - Nombre Apellido (O.S)" si es Obra Social.

- Usar algún color o badge distinto para diferenciar rápidamente "P" de "O.S" (por ejemplo, un chip de color).

- Si hay muchos turnos en un día y no entran, mostrar los primeros 2-3 y un "+N más" que al clickear expande el detalle completo del día.

## Exportar a PDF

- Botón visible "Descargar PDF" que genere y descargue la vista del calendario del mes actual tal cual se ve en pantalla (usar html2canvas + jsPDF, o una librería similar), respetando el diseño de grilla y los turnos cargados.

- El PDF debe verse igual de prolijo que la vista web, en formato A4 apaisado si es necesario para que entre toda la grilla.

## Estilo general

- Paleta neutra (blancos, grises, un color de acento para los botones y el header del mes).

- Tipografía clara y legible, encabezados de días en negrita.

- Todo el flujo debe sentirse simple y rápido de usar desde el celular, ya que el usuario principal va a cargar turnos desde el teléfono.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f43a95bd-9920-452a-86be-ae101cc50fe9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
