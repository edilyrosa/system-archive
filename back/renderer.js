const { ipcRenderer } = require('electron');

let currentPage = 0;
const pageSize = 10;
//const pageSize = 1000;
let filters = null;
let consecutivoUpdate;
let fechaUpdate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

let operadorUpdate = 'userSession'

let fechaRow;

function cargarDatosEnFormulario(row) {
    document.getElementById('expediente').value = row.expediente;
    document.getElementById('caballero').value = row.caballero;
    document.getElementById('dama').value = row.dama;
    document.getElementById('tomo').value = row.tomo;
    document.getElementById('folio').value = row.folio;
    document.getElementById('anio').value = row.anio;
    //document.getElementById('modo').value = 'actualizar'; // Cambiar a modo actualizar
    consecutivoUpdate = row.consecutivo;
    fechaRow = row.fecha;
    console.log( fechaUpdate);
    
    //!fechaUpdate = row.fecha;
    //!operadorUpdate = row.operador; 

    // Guardar el ID del registro para actualizarlo después
    document.getElementById('formulario').dataset.registroId = row.consecutivo;
}

//al evento clic sobre "actualizar"
function actualizarTabla(rows, offset) {
    const tbody = document.getElementById('matrimonios-body');
    const table = document.getElementById('matrimonios-table');
    const noDataMessage = document.getElementById('no-data-message');
    const formSection = document.getElementById('form-section'); // 

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
                <td class='td-table-matrimonio'>${index + 1 + offset}</td>
                <td class='td-table-matrimonio'>${row.consecutivo}</td>
                <td class='td-table-matrimonio'>${row.expediente}</td>
                <td class='td-table-matrimonio'>${row.caballero}</td>
                <td class='td-table-matrimonio'>${row.dama}</td>
                <td class='td-table-matrimonio'>${row.tomo}</td>
                <td class='td-table-matrimonio' >${row.folio}</td>
                <td class='td-table-matrimonio'>${row.anio}</td>
                 <td>
                    <button class='button-update btn-action td-table-matrimonio' data-id='${row.consecutivo}'>Actualizar</button> 
                    <button class='button-delete btn-action td-table-matrimonio' data-id='${row.consecutivo}'>Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        

        // Evento para actualizar el registro
        tr.querySelector('.button-update').addEventListener('click', () => {
            document.getElementById('modo').value = 'actualizar'; 
            document.getElementById('h3-title-form').textContent = 'Actualizando Registro';
            cargarDatosEnFormulario(row);
            formSection.style.display = 'block';
            
        });

        // Evento para eliminar el registro
        tr.querySelector('.button-delete').addEventListener('click', () => {
            eliminarRegistro(row.consecutivo);
        });
    });

        document.getElementById('prev-page').disabled = currentPage === 0;
        document.getElementById('page-number').textContent = `Página ${currentPage + 1}`;
        document.getElementById('next-page').disabled = rows.length < pageSize;
    }
}


ipcRenderer.on('actualizar-registros', (event, rows, offset) => {
    actualizarTabla(rows, offset);
    actualizarVisibilidadPaginacion(); // Mover esta línea aquí para asegurar que se llame después de actualizar la tabla
    document.getElementById('modo').value = 'crear'; //! Cambiar a modo crear
});

ipcRenderer.on('actualizar-total-registros', (event,total) => {
    actualizarTotalRegistros(total);
    // actualizarTabla(rows, offset);
    // actualizarVisibilidadPaginacion(); // Mover esta línea aquí para asegurar que se llame después de actualizar la tabla
});

function actualizarTotalRegistros(total) {
    document.getElementById('span-total').textContent = `Total de Registros encontrados: ${total}`;

}


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

// function mostrarDataMaria() {
//     filters = null;
//      currentPage = 0;
//      ipcRenderer.send('cargar-pagina-mariadb', currentPage, filters);
 
//      // Mostrar la tabla y la paginación
//      const tableContainer = document.querySelector('.table-container');
//      const pagination = document.querySelector('.pagination');
//      tableContainer.style.display = 'block'; // Asegurarse de que la tabla sea visible
//      pagination.style.display = 'flex'; // Asegurarse de que la paginación sea visible
 
//      // Actualizar la visibilidad de la paginación
//      actualizarVisibilidadPaginacion();
//  }
 
function aplicarFiltros() {
    filters = {
        consecutivo: document.getElementById('filter-consecutivo').value,
        tomo: document.getElementById('filter-tomo').value,
        caballero: document.getElementById('filter-caballero').value,
        dama: document.getElementById('filter-dama').value,
        expediente: document.getElementById('filter-expediente').value,
        folio: document.getElementById('filter-folio').value,
        anio: document.getElementById('filter-anio').value,
        // operador: document.getElementById('filter-operador').value,
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



// function enviarFormulario(event) {
//     event.preventDefault();
//     const formData = {
//         // consecutivo: es un autoincrement que la db
//         tomo: Number(document.getElementById('tomo').value),
//         caballero: document.getElementById('caballero').value,
//         dama: document.getElementById('dama').value,
//         expediente: document.getElementById('expediente').value,
//         folio: Number(document.getElementById('folio').value),
//         anio: Number(document.getElementById('anio').value),
//         // operador: sera tomado de session.operador == userName
//         // fecha: dera un Date.now() formato dd/mm/yyyy
//     };

//     ipcRenderer.send('crear-registro', formData);
// }



function limpiaVarModoFormulario() {
    document.getElementById('modo').value = 'crear'; // Cambiar a modo actualizar
    document.getElementById('h3-title-form').textContent = 'Creando Registro';
}

function enviarFormulario(event) {
    
    event.preventDefault();
    const modo = document.getElementById('modo').value; // Obtener el modo del formulario
    const formData = {
        consecutivo: consecutivoUpdate ? consecutivoUpdate : null,
        tomo: Number(document.getElementById('tomo').value),
        caballero: document.getElementById('caballero').value,
        dama: document.getElementById('dama').value,
        expediente: document.getElementById('expediente').value,
        folio: Number(document.getElementById('folio').value),
        anio: Number(document.getElementById('anio').value),
        fecha: fechaRow,
        operador: operadorUpdate
        // fecha: dera un Date.now() formato dd/mm/yyyy
        // consecutivo: es un autoincrement que la db
        // operador: sera tomado de session.operador == userName.
    };

    if (modo === 'actualizar') {
        
        ipcRenderer.send('actualizar-registro', formData);
        
    } else {
        // Enviar el formulario al backend para crear un nuevo registro
        ipcRenderer.send('crear-registro',formData);

    }

    const formSection = document.getElementById('form-section');
    const tableContainer = document.querySelector('.table-container');
    formSection.style.display = 'none'
    tableContainer.classList.add('full-width'); // Asegurarse de que la tabla ocupe el 100%
    document.querySelectorAll('.td-table-matrimonio').style.fontSize = '12px'
}

// Función para formatear la fecha a dd/mm/yyyy
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexados
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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

ipcRenderer.on('registro-actualizado', (event, result) => {
    if (result.success) {
        console.log(`Registro actualizado con ID: ${result.id}`);
        showModal('El registro se actualizó correctamente.');
        // Aquí puedes llamar a una función para refrescar la tabla de registros
        mostrarData(); // Asegúrate de que esta función esté definida y actualice la vista.
            // Limpiar el formulario después de una inserción exitosa
            document.getElementById('formulario').reset();
            
    } else {
        console.error(`Error al actualizar registro en renderer 1: ${result.error}`);
        showModal(`Error al actualizar registro  en renderer 2: ${result.error}`);
    }
});










function actualizarVisibilidadPaginacion() {
    const tableBody = document.getElementById('matrimonios-body');
    const pagination = document.querySelector('.pagination');

    // Capturar el número de filas en la tabla
    const rowCount = tableBody.getElementsByTagName('tr').length;
    console.log('Número de filas en la tabla:', rowCount);

    // Aplicar lógica de paginación
   // if (rowCount >= 1000) {
    if (rowCount >= 10) {
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
    const tableBody = document.getElementById('matrimonios-body');
    tableBody.innerHTML = ''; // Limpiar contenido dinámico
}

window.onload = () => {
    document.getElementById('btn-reset-form').addEventListener('click', limpiaVarModoFormulario);



    document.getElementById('mostrar-data').addEventListener('click', mostrarData);
    document.getElementById('aplicar-filtros').addEventListener('click', aplicarFiltros);
    document.getElementById('formulario').addEventListener('submit', enviarFormulario);
    document.getElementById('prev-page').addEventListener('click', () => changePage('prev'));
    document.getElementById('next-page').addEventListener('click', () => changePage('next'));
    document.getElementById('limpiar-filtros').addEventListener('click', limpiaFiltro);
    document.getElementById('limpiar-data').addEventListener('click', limpiarData); // Agregar evento al botón
    // Ocultar la tabla inicialmente
    document.getElementById('matrimonios-table').style.display = 'none';
    
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
    document.getElementById('filter-consecutivo').value = '';
    document.getElementById('filter-tomo').value = '';
    document.getElementById('filter-caballero').value = '';
    document.getElementById('filter-dama').value = '';
    document.getElementById('filter-expediente').value = '';
    document.getElementById('filter-folio').value = '';
    document.getElementById('filter-anio').value = '';
    // document.getElementById('filter-operador').value = '';
    document.getElementById('filter-fecha').value = '';

    // Limpiar los filtros y mostrar todos los datos
    //aplicarFiltros();
}

// Conectar la función al botón
document.getElementById('toggle-form').addEventListener('click', toggleForm);


// Agregar console.log para depuración
console.log('renderer.js cargado');
