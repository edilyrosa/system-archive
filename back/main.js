const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;
const RECORDS_PER_PAGE = 1000; // Límite de registros por consulta

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 1000,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    win.loadFile('front/index.html');
}

app.whenReady().then(() => {
    const dbPath = path.join('C:', 'Users', 'edily', 'Desktop', 'matri.db'); // Ruta directa a la base de datos

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            sendErrorToFrontend("Error al conectar a la base de datos: " + err.message);
            return;
        }
        console.log('Conectado a la base de datos SQLite matri.db.');
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Función para obtener registros con paginación
function obtenerRegistros(page, filters = null) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM usuarios LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;
    let params = [];

    if (filters) {
        const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = filters;
        const filterConditions = [];

        if (libro) {
            filterConditions.push("libro LIKE ?");
            params.push(`%${libro}%`);
        }
        if (tomo) {
            filterConditions.push("tomo LIKE ?");
            params.push(`%${tomo}%`);
        }
        if (novio) {
            filterConditions.push("novio LIKE ?");
            params.push(`%${novio}%`);
        }
        if (novia) {
            filterConditions.push("novia LIKE ?");
            params.push(`%${novia}%`);
        }
        if (expediente) {
            filterConditions.push("expediente LIKE ?");
            params.push(`%${expediente}%`);
        }
        if (folio) {
            filterConditions.push("folio LIKE ?");
            params.push(`%${folio}%`);
        }
        if (anio) {
            filterConditions.push("anio LIKE ?");
            params.push(`%${anio}%`);
        }
        if (apellido) {
            filterConditions.push("apellido LIKE ?");
            params.push(`%${apellido}%`);
        }
        if (fecha) {
            filterConditions.push("fecha LIKE ?");
            params.push(`%${fecha}%`);
        }

        if (filterConditions.length > 0) {
            query = `SELECT * FROM usuarios WHERE ${filterConditions.join(' AND ')} LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;
        }
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            sendErrorToFrontend("Error al obtener registros: " + err.message);
            return;
        }

        const win = BrowserWindow.getAllWindows()[0];
        win.webContents.send('actualizar-registros', rows, offset); // Pasar offset para el contador
    });
}

// Manejar solicitudes de paginación y filtrado
ipcMain.on('cargar-pagina', (event, page, filters = null) => {
    obtenerRegistros(page, filters);
});

// Crear un nuevo registro en la tabla usuarios
ipcMain.on('crear-registro', (event, data) => {
    const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = data;

    if (libro && tomo && novio && novia && expediente && folio && anio && apellido && fecha) {
        db.run(`INSERT INTO usuarios (libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha], function (err) {
                if (err) {
                    sendErrorToFrontend("Error al crear registro: " + err.message);
                    return;
                }
                event.reply('registro-creado', this.lastID);
                obtenerRegistros(0); // Refrescar a la primera página
            });
    } else {
        sendErrorToFrontend("Datos incompletos al crear registro: " + JSON.stringify(data));
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Función para enviar errores al frontend
function sendErrorToFrontend(errorMessage) {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
        win.webContents.send('mostrar-error', errorMessage);
    }
}
