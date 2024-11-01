const { ipcRenderer } = require('electron');

let currentPage = 0;
const pageSize = 1000;
let filters = null;

function actualizarTabla(rows, offset) {
    const tbody = document.getElementById('matrimonios-body');
    const table = document.getElementById('matrimonios-table');
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
                <td>${row.consecutivo}</td>
                <td>${row.expediente}</td>
                <td>${row.caballero}</td>
                <td>${row.dama}</td>
                <td>${row.tomo}</td>
                <td>${row.folio}</td>
                <td>${row.anio}</td>
                <td>${row.operador}</td>
                <td>${row.fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</td>
                <td>
                    <button class='button-update'>Actualizar</button> 
                    <button class='button-delete'>Eliminar</button>
                    //!este boton debe desarrollar una funcion manejadora de eventos que: 
                    //!guardar en una variable tipo de dato objeto la informacion completa del 
                    //!row actual (cada key sera: expediente, caballero, dama, tomo, folio, anio. 
                    //!ya que consecutivo es el id del regustro y el operador y fecha no seran editables).
                    //!y luego enviarlo al formulario con id="formUpdate" para la edicion del registro y luego su envio.
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('prev-page').disabled = currentPage === 0;
        document.getElementById('page-number').textContent = `Página ${currentPage + 1}`;
        document.getElementById('next-page').disabled = rows.length < pageSize;
    }
}

function enviarFormulario(event) {
    event.preventDefault();
    const formData = {
        // consecutivo: document.getElementById('consecutivo').value,
        tomo: Number(document.getElementById('tomo').value),
        caballero: document.getElementById('caballero').value,
        dama: document.getElementById('dama').value,
        expediente: document.getElementById('expediente').value,
        folio: Number(document.getElementById('folio').value),
        anio: Number(document.getElementById('anio').value),
        operador: document.getElementById('operador').value,
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


