// Filtrar los registros en función de los valores de los campos de filtro
function applyFilters() {
    const filterLibro = document.getElementById('filter-libro').value.toLowerCase();
    const filterTomo = document.getElementById('filter-tomo').value.toLowerCase();
    const filterNovio = document.getElementById('filter-novio').value.toLowerCase();
    const filterNovia = document.getElementById('filter-novia').value.toLowerCase();
    const filterExpediente = document.getElementById('filter-expediente').value.toLowerCase();
    const filterFolio = document.getElementById('filter-folio').value.toLowerCase();
    const filterAnio = document.getElementById('filter-anio').value.toLowerCase();
    const filterApellido = document.getElementById('filter-apellido').value.toLowerCase();
    const filterFecha = document.getElementById('filter-fecha').value;

    const rows = document.querySelectorAll('#usuarios-body tr');

    rows.forEach(row => {
        const libro = row.cells[1].textContent.toLowerCase();
        const tomo = row.cells[2].textContent.toLowerCase();
        const novio = row.cells[3].textContent.toLowerCase();
        const novia = row.cells[4].textContent.toLowerCase();
        const expediente = row.cells[5].textContent.toLowerCase();
        const folio = row.cells[6].textContent.toLowerCase();
        const anio = row.cells[7].textContent.toLowerCase();
        const apellido = row.cells[8].textContent.toLowerCase();
        const fecha = row.cells[9].textContent;

        const matches =
            (libro.includes(filterLibro)) &&
            (tomo.includes(filterTomo)) &&
            (novio.includes(filterNovio)) &&
            (novia.includes(filterNovia)) &&
            (expediente.includes(filterExpediente)) &&
            (folio.includes(filterFolio)) &&
            (anio.includes(filterAnio)) &&
            (apellido.includes(filterApellido)) &&
            (fecha.includes(filterFecha));

        row.style.display = matches ? '' : 'none';
    });
}
