// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

function conectarBD() {
    const dbPath = path.join('C:', 'Users', 'edily', 'Desktop', 'matrimoniosqlite.db');
    
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Error al conectar a la base de datos:", err.message);
            return;
        }
        console.log('Conectado a la base de datos SQLite matrimoniosqlite.db.');
    });
    
    return db;
}

function cerrarBD() {
    db.close((err) => {
        if (err) {
            console.error("Error al cerrar la base de datos:", err.message);
        } else {
            console.log("Conexión a la base de datos cerrada.");
        }
    });
}

module.exports = { conectarBD, cerrarBD };



