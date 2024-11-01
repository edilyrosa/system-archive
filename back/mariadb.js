// mariadb.js
const mysql = require('mysql2');

let db;

//TODO: Make this export secured by using the environment variable
let databaseConfig = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "18427137",
  DATABASE: "archivos",
};

function conectarBD  () {
    db = mysql.createConnection({
      host: databaseConfig.HOST,
      user: databaseConfig.USER,
      password: databaseConfig.PASSWORD,
      database: databaseConfig.DATABASE,
    });
  
    db.connect((error) => {
      if (error) {
        console.error("Error al conectar a la base de datos:", error.message);

        app.quit();
      } else {
        console.log('Conectado a la base de datos MariaDB matrimonios.db');
      }
    });
    return db;
  };


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

