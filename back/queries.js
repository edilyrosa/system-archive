// queries.js
const RECORDS_PER_PAGE = 1000;

function obtenerRegistros(db, page, filters = null, callback) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM usuarios`;
    let params = [];
    let whereClause = [];

    if (filters) {
        const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = filters;

        if (libro) whereClause.push("libro LIKE ?");
        if (tomo) whereClause.push("tomo LIKE ?");
        if (novio) whereClause.push("novio LIKE ?");
        if (novia) whereClause.push("novia LIKE ?");
        if (expediente) whereClause.push("expediente LIKE ?");
        if (folio) whereClause.push("folio LIKE ?");
        if (anio) whereClause.push("anio LIKE ?");
        if (apellido) whereClause.push("apellido LIKE ?");
        if (fecha) whereClause.push("fecha LIKE ?");

        params.push(...Object.values(filters).filter(Boolean).map(val => `%${val}%`));

        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND ')}`;
        }
    }

    query += ` ORDER BY novio ASC LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Error al obtener registros:", err.message);
            callback(err, null);
            return;
        }
        callback(null, rows);
    });
}

function crearRegistro(db, data, callback) {
    const { libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha } = data;

    if (libro && tomo && novio && novia && expediente && folio && anio && apellido && fecha) {
        const query = `INSERT INTO usuarios (libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(query, [libro, tomo, novio, novia, expediente, folio, anio, apellido, fecha], function (err) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, this.lastID);
        });
    } else {
        callback(new Error("Datos incompletos"), null);
    }
}

module.exports = { obtenerRegistros, crearRegistro };


