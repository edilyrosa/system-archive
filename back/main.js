const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const conexion = require('./mariadb');

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
    //win.webContents.openDevTools(); // Abre las herramientas de desarrollo para depuración
}

// LOGS OF DB CONEXION
app.whenReady().then(() => {
    const dbPath = path.join('C:', 'Users', 'edily', 'Desktop', 'matrimoniosqlite.db');

    db = conexion.conectarBD();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// function obtenerRegistrosMariaDB(pagina, filtros = null){
//     // Implementación para obtener los registros de una base de datos MariaDB
//     //...   
//     const nuevaPagina = pagina * RECORDS_PER_PAGE;

//     ServicioMatrimonios.obtenerMatrimonios(nuevaPagina, filtros).then(function(result){  

//         console.log(`Registros obtenidos: ${result.length}`); // Para depuración

//         const win = BrowserWindow.getAllWindows()[0];
//         if (win) {
//             win.webContents.send('actualizar-registros', result, offset);
//         }

//     }).catch(err => {
//         console.error("Error al obtener registros:", err.message);
//     });
// }

function obtenerRegistros(page, filters = null) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM matrimonios`;
    let params = [];
    let whereClause = [];

    if (filters) {
        const filterKeys = ['consecutivo', 'expediente', 'caballero', 'dama', 'tomo', 'folio', 'anio', 'operador', 'fecha'];

        filterKeys.forEach(key => {
            if (filters[key]) {
                whereClause.push(`${key} LIKE ?`);
                params.push(`%${filters[key]}%`);
            }
        });

        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND  ')}`;
        }
    }


   // query += ` LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;
   //!registros se ordenan alfabéticamente por caballero en orden ascendente +  de 1000 en 1000.
    query += ` ORDER BY caballero ASC LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;

    console.log('Query:', query); // Para depuración
    console.log('Params:', params); // Para depuración

    //TODO: REVIEW THIS CODE WITH THE DOCUMENTATION FROM MYSQL2 https://sidorares.github.io/node-mysql2/docs
    db.execute(
        query,
        params,
        function (err, results, fields) {
            if (err) {
                console.error("Error al obtener registros:", err.message);
                return;
            }
    
            console.log(`Registros obtenidos: ${results.length}`); // Para depuración
            //console.log(`Registros obtenido [0]: ${results[0].tomo}`)
            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
                win.webContents.send('actualizar-registros', results, offset);
            } // fields contains extra meta data about results, if available
        });

}

ipcMain.on('cargar-pagina', (event, page, filters = null) => {
    console.log('Evento cargar-pagina recibido:', page, filters); // Para depuración
    obtenerRegistros(page, filters);
});

ipcMain.on('cargar-pagina-maria', (event, page, filters = null) => {
    console.log('Evento cargar-pagina-maria recibido:', page, filters); // Para depuración
    obtenerRegistrosMariaDB(page,filters);
});

ipcMain.on('crear-registro', (event, data) => {
    console.log('Evento crear-registro recibido:', data); // Para depuración
    const { consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha } = data;
    const params = [consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha];
    //TODO: Validar formulario. (consecutivo int, expediente int, caballero string, dama string, fecha data, operador session.operador == username)
    if (consecutivo && expediente && caballero && dama && tomo && folio && anio && operador && fecha) {
        const query = `INSERT INTO matrimonios (consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.execute(query, params, (err, result, fields) => {
            if (err) {
                console.error("Error al crear registro:", err.message);
                event.reply('registro-creado', { success: false, error: err.message });
                return;
            }
            console.log(`Nuevo registro creado con ID: ${result.consecutivo}`);
            event.reply('registro-creado', { success: true, id: this.consecutivo });
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
