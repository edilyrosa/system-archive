const { ipcRenderer } = require('electron');

let currentPage = 0;
const pageSize = 1000;
let filters = null;

function actualizarTabla(rows, offset) {
    const tbody = document.getElementById('usuarios-body');
    const table = document.getElementById('usuarios-table');
    const noDataMessage = document.getElementById('no-data-message');

    if (rows.length === 0) {
        table.style.display = 'none'; 
        noDataMessage.style.display = 'block';
        noDataMessage.textContent = 'No existe registro con ese criterio de búsqueda';
    } else {
        table.style.display = 'table';
        noDataMessage.style.display = 'none';
        tbody.innerHTML = '';

        rows.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${index + 1 + offset}</td>
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

        document.getElementById('prev-page').disabled = currentPage === 0;
        document.getElementById('page-number').textContent = `Página ${currentPage + 1}`;
        document.getElementById('next-page').disabled = rows.length < pageSize;
    }
}

ipcRenderer.on('actualizar-registros', (event, rows, offset) => {
    actualizarTabla(rows, offset);
    actualizarVisibilidadPaginacion(); // Mover esta línea aquí para asegurar que se llame después de actualizar la tabla
});

function changePage(direction) {
    if (direction === 'next') {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 0) {
        currentPage--;
    }

    ipcRenderer.send('cargar-pagina', currentPage, filters);
}

function mostrarData() {
   filters = null;
    currentPage = 0;
    ipcRenderer.send('cargar-pagina', currentPage, filters);

    // Mostrar la tabla y la paginación
    const tableContainer = document.querySelector('.table-container');
    const pagination = document.querySelector('.pagination');
    tableContainer.style.display = 'block'; // Asegurarse de que la tabla sea visible
    pagination.style.display = 'flex'; // Asegurarse de que la paginación sea visible

    // Actualizar la visibilidad de la paginación
    actualizarVisibilidadPaginacion();
}

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

    // Eliminar propiedades con valores vacíos
    Object.keys(filters).forEach(key => {
        if (filters[key] === '') {
            delete filters[key];
        }
    });

    currentPage = 0;
    ipcRenderer.send('cargar-pagina', currentPage, filters);

    // Mostrar la tabla y la paginación
    const tableContainer = document.querySelector('.table-container');
    const pagination = document.querySelector('.pagination');
    tableContainer.style.display = 'block'; // Asegurarse de que la tabla sea visible
    pagination.style.display = 'flex'; // Asegurarse de que la paginación sea visible

    // Actualizar la visibilidad de la paginación
    actualizarVisibilidadPaginacion();
}

function enviarFormulario(event) {
    event.preventDefault();
    const formData = {
        libro: document.getElementById('libro').value,
        tomo: document.getElementById('tomo').value,
        novio: document.getElementById('novio').value,
        novia: document.getElementById('novia').value,
        expediente: document.getElementById('expediente').value,
        folio: document.getElementById('folio').value,
        anio: document.getElementById('anio').value,
        apellido: document.getElementById('apellido').value,
        fecha: document.getElementById('fecha').value,
    };

    ipcRenderer.send('crear-registro', formData);
}

function showModal(message) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    const content = document.createElement('div');
    content.style.backgroundColor = 'white';
    content.style.padding = '20px';
    content.style.borderRadius = '5px';
    content.style.textAlign = 'center';

    const text = document.createElement('p');
    text.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Cerrar';
    closeButton.onclick = () => document.body.removeChild(modal);

    content.appendChild(text);
    content.appendChild(closeButton);
    modal.appendChild(content);

    document.body.appendChild(modal);
}

ipcRenderer.on('registro-creado', (event, result) => {
    if (result.success) {
        console.log(`Nuevo registro creado con ID: ${result.id}`);
        showModal('La inserción se realizó correctamente');
        mostrarData(); // Actualizar la tabla después de la inserción
        // Limpiar el formulario después de una inserción exitosa
        document.getElementById('formulario').reset();
    } else {
        console.error(`Error al crear registro: ${result.error}`);
        showModal(`Error al crear registro: ${result.error}`);
    }
});

function actualizarVisibilidadPaginacion() {
    const tableBody = document.getElementById('usuarios-body');
    const pagination = document.querySelector('.pagination');

    // Capturar el número de filas en la tabla
    const rowCount = tableBody.getElementsByTagName('tr').length;
    console.log('Número de filas en la tabla:', rowCount);

    // Aplicar lógica de paginación
    if (rowCount >= 1000) {
        pagination.style.display = 'flex'; // Mostrar paginación
    } else {
        pagination.style.display = 'none'; // Ocultar paginación
    }
}

function limpiarData() {
    const tableContainer = document.querySelector('.table-container');
    const pagination = document.querySelector('.pagination');

    // Ocultar la tabla y la paginación
    tableContainer.style.display = 'none';
    pagination.style.display = 'none';

    // Limpiar el cuerpo de la tabla
    const tableBody = document.getElementById('usuarios-body');
    tableBody.innerHTML = ''; // Limpiar contenido dinámico
}

window.onload = () => {
    document.getElementById('mostrar-data').addEventListener('click', mostrarData);
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('formulario').addEventListener('submit', enviarFormulario);
    document.getElementById('prev-page').addEventListener('click', () => changePage('prev'));
    document.getElementById('next-page').addEventListener('click', () => changePage('next'));
    document.getElementById('limpiar-filtros').addEventListener('click', limpiaFiltro);
    document.getElementById('limpiar-data').addEventListener('click', limpiarData); // Agregar evento al botón
    // Ocultar la tabla inicialmente
    document.getElementById('usuarios-table').style.display = 'none';
    
    // Crear el elemento para mostrar el mensaje cuando no hay datos
    const noDataMessage = document.createElement('div');
    noDataMessage.id = 'no-data-message';
    noDataMessage.style.display = 'none';
    noDataMessage.style.textAlign = 'center';
    noDataMessage.style.marginTop = '20px';
    noDataMessage.style.fontSize = '18px';
    document.querySelector('.container').appendChild(noDataMessage); // Corrected selector

    // No cargar datos inicialmente
    // mostrarData();

    // Verificar visibilidad al cargar
    actualizarVisibilidadPaginacion();
};




function limpiaFiltro() {
    // Limpiar los inputs de los filtros
    document.getElementById('filter-libro').value = '';
    document.getElementById('filter-tomo').value = '';
    document.getElementById('filter-novio').value = '';
    document.getElementById('filter-novia').value = '';
    document.getElementById('filter-expediente').value = '';
    document.getElementById('filter-folio').value = '';
    document.getElementById('filter-anio').value = '';
    document.getElementById('filter-apellido').value = '';
    document.getElementById('filter-fecha').value = '';

    // Limpiar los filtros y mostrar todos los datos
    //aplicarFiltros();
}


// Nueva función para alternar la visibilidad del formulario
function toggleForm() {
    const formSection = document.getElementById('form-section');
    const toggleButton = document.getElementById('toggle-form'); // Obtener el botón

    if (formSection.style.display === 'none') {
        formSection.style.display = 'block'; // Muestra el formulario
        toggleButton.innerText = 'Descartar Nueva Insercion de Registro'; // Cambiar el texto del botón
    } else {
        formSection.style.display = 'none'; // Oculta el formulario
        toggleButton.innerText = 'Insertar Registro'; // Cambiar el texto del botón
    }
}
// Conectar la función al botón
document.getElementById('toggle-form').addEventListener('click', toggleForm);


// Agregar console.log para depuración
console.log('renderer.js cargado');
