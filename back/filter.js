// Filtrar los registros en función de los valores de los campos de filtro
function applyFilters() {
    const filterconsecutivo = document.getElementById('filter-consecutivo').value.toLowerCase();
    const filterTomo = document.getElementById('filter-tomo').value.toLowerCase();
    const filtercaballero = document.getElementById('filter-caballero').value.toLowerCase();
    const filterdama = document.getElementById('filter-dama').value.toLowerCase();
    const filterExpediente = document.getElementById('filter-expediente').value.toLowerCase();
    const filterFolio = document.getElementById('filter-folio').value.toLowerCase();
    const filterAnio = document.getElementById('filter-anio').value.toLowerCase();
    const filteroperador = document.getElementById('filter-operador').value.toLowerCase();
    const filterFecha = document.getElementById('filter-fecha').value;

    const rows = document.querySelectorAll('#matrimonios-body tr');

    rows.forEach(row => {
        const consecutivo = row.cells[1].textContent.toLowerCase();
        const tomo = row.cells[2].textContent.toLowerCase();
        const caballero = row.cells[3].textContent.toLowerCase();
        const dama = row.cells[4].textContent.toLowerCase();
        const expediente = row.cells[5].textContent.toLowerCase();
        const folio = row.cells[6].textContent.toLowerCase();
        const anio = row.cells[7].textContent.toLowerCase();
        const operador = row.cells[8].textContent.toLowerCase();
        const fecha = row.cells[9].textContent;

        const matches =
            (consecutivo.includes(filterconsecutivo)) &&
            (tomo.includes(filterTomo)) &&
            (caballero.includes(filtercaballero)) &&
            (dama.includes(filterdama)) &&
            (expediente.includes(filterExpediente)) &&
            (folio.includes(filterFolio)) &&
            (anio.includes(filterAnio)) &&
            (operador.includes(filteroperador)) &&
            (fecha.includes(filterFecha));

        row.style.display = matches ? '' : 'none';
    });
}
