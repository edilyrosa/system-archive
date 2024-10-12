const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;
const RECORDS_PER_PAGE = 1000;

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
    win.webContents.openDevTools(); // Abre las herramientas de desarrollo para depuración
}

app.whenReady().then(() => {
    const dbPath = path.join('C:', 'Users', 'edily', 'Desktop', 'matrimoniosqlite.db');

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Error al conectar a la base de datos:", err.message);
            return;
        }
        console.log('Conectado a la base de datos SQLite matrimoniosqlite.db.');
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

function obtenerRegistros(page, filters = null) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM usuarios`;
    let params = [];
    let whereClause = [];

    if (filters) {
        const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = filters;

        if (libro) {
            whereClause.push("libro LIKE ?");
            params.push(`%${libro}%`);
        }
        if (tomo) {
            whereClause.push("tomo LIKE ?");
            params.push(`%${tomo}%`);
        }
        if (novio) {
            whereClause.push("novio LIKE ?");
            params.push(`%${novio}%`);
        }
        if (novia) {
            whereClause.push("novia LIKE ?");
            params.push(`%${novia}%`);
        }
        if (expediente) {
            whereClause.push("expediente LIKE ?");
            params.push(`%${expediente}%`);
        }
        if (folio) {
            whereClause.push("folio LIKE ?");
            params.push(`%${folio}%`);
        }
        if (anio) {
            whereClause.push("anio LIKE ?");
            params.push(`%${anio}%`);
        }
        if (apellido) {
            whereClause.push("apellido LIKE ?");
            params.push(`%${apellido}%`);
        }
        if (fecha) {
            whereClause.push("fecha LIKE ?");
            params.push(`%${fecha}%`);
        }

        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND  ')}`;
        }
    }

    query += ` LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;

    console.log('Query:', query); // Para depuración
    console.log('Params:', params); // Para depuración

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Error al obtener registros:", err.message);
            return;
        }

        console.log(`Registros obtenidos: ${rows.length}`); // Para depuración

        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
            win.webContents.send('actualizar-registros', rows, offset);
        }
    });
}

ipcMain.on('cargar-pagina', (event, page, filters = null) => {
    console.log('Evento cargar-pagina recibido:', page, filters); // Para depuración
    obtenerRegistros(page, filters);
});

ipcMain.on('crear-registro', (event, data) => {
    console.log('Evento crear-registro recibido:', data); // Para depuración
    const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = data;

    if (libro && tomo && novio && novia && expediente && folio && anio && apellido && fecha) {
        const query = `INSERT INTO usuarios (libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(query, [libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha], function (err) {
            if (err) {
                console.error("Error al crear registro:", err.message);
                event.reply('registro-creado', { success: false, error: err.message });
                return;
            }
            console.log(`Nuevo registro creado con ID: ${this.lastID}`);
            event.reply('registro-creado', { success: true, id: this.lastID });
            obtenerRegistros(0);
        });
    } else {
        console.error("Datos incompletos al crear registro:", data);
        event.reply('registro-creado', { success: false, error: "Datos incompletos" });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Agregar console.log para depuración
console.log('main.js cargado');