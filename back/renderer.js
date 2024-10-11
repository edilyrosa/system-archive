

const { ipcRenderer } = require('electron');

let currentPage = 0; // Página actual
const pageSize = 1000; // Tamaño de cada página
let filters = null; // Filtros aplicados

// Escuchar el evento para actualizar registros
ipcRenderer.on('actualizar-registros', (event, rows, offset) => {
    const tbody = document.getElementById('usuarios-body');
    tbody.innerHTML = ''; // Limpiar el contenido existente

    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${index + 1 + offset}</td> <!-- ID dinámico -->
            <td>${row.libro}</td>
            <td>${row.tomo}</td>
            <td>${row.novio}</td>
            <td>${row.novia}</td>
            <td>${row.expediente}</td>
            <td>${row.folio}</td>
            <td>${row.anio}</td>
            <td>${row.apellido}</td>
            <td>${row.fecha}</td>
            <td><button class='button-table'>Actualizar</button> <button class='button-table'>Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Actualizar el estado de los botones de paginación
    document.getElementById('prev-page').disabled = currentPage === 0;
    document.getElementById('page-number').textContent = `Página ${currentPage + 1}`;
    document.getElementById('next-page').disabled = rows.length < pageSize;
});

// Función para cambiar página
function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 0) {
        currentPage--;
    }

    // Enviar solicitud para cargar la página con los filtros (si existen)
    ipcRenderer.send('cargar-pagina', currentPage, filters);
}

// Función para mostrar data sin filtro
function mostrarData() {
    filters = null; // Reiniciar filtros
    currentPage = 0; // Reiniciar a la primera página
    ipcRenderer.send('cargar-pagina', currentPage);
}

// Función para aplicar filtros y mostrar la tabla filtrada
function aplicarFiltros() {
    filters = {
        libro: document.getElementById('filter-libro').value,
        tomo: document.getElementById('filter-tomo').value,
        novio: document.getElementById('filter-novio').value,
        novia: document.getElementById('filter-novia').value,
        expediente: document.getElementById('filter-expediente').value,
        folio: document.getElementById('filter-folio').value,
        anio: document.getElementById('filter-anio').value,
        apellido: document.getElementById('filter-apellido').value,
        fecha: document.getElementById('filter-fecha').value,
    };

    currentPage = 0; // Reiniciar a la primera página
    ipcRenderer.send('cargar-pagina', currentPage, filters);
}

// Inicializar la carga de la primera página cuando se cargue la ventana
window.onload = () => {
    document.getElementById('mostrar-data').addEventListener('click', mostrarData);
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
};
