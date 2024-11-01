const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const conexion = require('./mariadb');

let db;
const RECORDS_PER_PAGE = 10;
//const RECORDS_PER_PAGE = 1000;


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

//! set conexion -> call createWindow() -> load index.html
app.whenReady().then(() => {
    db = conexion.conectarBD();
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});


//! modular estas funciones en archivos respectivos ejemplo matriminio/insert.js. 
//!crear archivo para login, 1. lo de perpexsi, 2, 
//! crear una tabla de usuarios, hacer una funcion como la de abajo, cuyo param seran user y password, usando AND dado que ambos deben coinsi
//! dir, y el query es la consulta a esa tabla. consulta directa con lso parametros, analizar el resultado, si el objeto resultado me trae
//!al registro de usuario, ya se quien es y uso sus datos para sesionar, y controlar con un setTimeout el tiempo de sesion segun hayan evntos 
//!debo ejecutr esta funcion que ne trae el usuario, antes de:
  //!Crear o acceder a una sesión persistente
  //!const ses = session.fromPartition('persist:miSesion');

function obtenerRegistrosTotales(whereClause, params) {
   
    const query = 'SELECT COUNT(*) as total FROM matrimonios' + (whereClause.length > 0 ? ` WHERE ${whereClause.join(' AND ')}` : '');
    console.log('Running query for total');
    console.log(query);
    console.log(params);

    db.execute(
        query,
        params,
        function (err, results, fields) {//manejo del error
            if (err) {
                console.error("Error al obtener total de registros:", err.message);
                return;
            }
            console.log(`[TOTAL] Registros obtenidos: ${results}`)
 
            const total = results[0].total;
            console.log(`[TOTAL] Total de registros obtenidos: ${total}`); // Para depuración
            const win = BrowserWindow.getAllWindows()[0];
            if (win) {
                win.webContents.send('actualizar-total-registros', total);
            } // fields contains extra meta data about results, if available
        });
}

function obtenerRegistros(page, filters = null) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM matrimonios`;
    let params = [];
    let whereClause = [];

    if (filters) {
        const filterKeys = ['expediente', 'caballero', 'dama', 'fecha'];
        const filterKeysNum = ['consecutivo', 'tomo', 'folio', 'anio'];

        filterKeys.forEach(key => {
            if (filters[key]) {
                whereClause.push(`${key} LIKE ?`);
                params.push(`%${filters[key]}%`);
            }
        });
        filterKeysNum.forEach(key => {
            if (filters[key]) {
                whereClause.push(`${key} = ?`);
                params.push(filters[key]);
            }
        });

        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND  ')}`;
        }
    }

    query += ` ORDER BY caballero ASC LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;

    obtenerRegistrosTotales(whereClause, params);
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

const fechaActual = new Date();
const dia = String(fechaActual.getDate()).padStart(2, '0'); // Obtiene el día y lo formatea con ceros a la izquierda
const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Obtiene el mes (0-11) y lo formatea
const anio = fechaActual.getFullYear(); // Obtiene el año

const fechaFormateada = `${dia}/${mes}/${anio}`; // Combina los valores en el formato deseado
console.log(fechaFormateada.toString()); // Muestra la fecha en formato dd/mm/yyyy



ipcMain.on('crear-registro', (event, data) => {
    console.log('Evento crear-registro recibido:', data); // Para depuración
    const {expediente, caballero, dama, tomo, folio, anio} = data;
    const params = [expediente, caballero, dama, tomo, folio, anio];
    //TODO: Validar formulario. (consecutivo int, expediente int, caballero string, dama string, fecha data, operador session.operador == username)
    // if (consecutivo && expediente && caballero && dama && tomo && folio && anio && operador && fecha) {
    if (expediente && caballero && dama && tomo && folio && anio) {
        const query = `INSERT INTO matrimonios  (expediente, caballero, dama, tomo, folio, anio, operador, fecha) 
                        VALUES (?, ?, ?, ?, ?, ?, 'armijo', ${fechaFormateada.toString()})`;
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



ipcMain.on('actualizar-registro', (event, data) => {
    console.log('Evento actualizar-registro recibido:', data); // Para depuración
    const { consecutivo, expediente, caballero, dama, tomo, folio, anio, fecha, operador } = data;

    // Verificar que los datos requeridos no estén vacíos
    if (consecutivo && expediente && caballero && dama && tomo && folio && anio) {
        // Suponiendo que 'fechaFormateada' es la fecha actual formateada correctamente
       
        const params = [expediente, caballero, dama, tomo, folio, anio, fecha, operador, consecutivo];

        const query = `UPDATE matrimonios 
                       SET expediente = ?, 
                           caballero = ?, 
                           dama = ?, 
                           tomo = ?, 
                           folio = ?, 
                           anio = ?, 
                           fecha = ?, 
                           operador = ? 
                       WHERE consecutivo = ?`; 

        db.execute(query, params, (err, result, fields) => {
            if (err) {
                console.error("Error al actualizar registro en main:", err.message);
                event.reply('registro-actualizado', { success: false, error: err.message });
                return;
            }
            console.log(`Registro actualizado con ID: ${consecutivo}`);
            event.reply('registro-actualizado', { success: true, id: consecutivo });
            obtenerRegistros(0); // Actualiza los registros mostrados si es necesario
        });
    } else {
        console.error("Datos incompletos al actualizar registro:", data);
        event.reply('registro-actualizado', { success: false, error: "Datos incompletos" });
    }
});



app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Agregar console.log para depuración
console.log('main.js cargado');
