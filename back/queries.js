// queries.js
const RECORDS_PER_PAGE = 1000;

function obtenerRegistros(db, page, filters = null, callback) {
    const offset = page * RECORDS_PER_PAGE;
    let query = `SELECT * FROM matrimonios`;
    let params = [];
    let whereClause = [];

    if (filters) {
        const { consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha } = filters;

        if (consecutivo) whereClause.push("consecutivo LIKE ?");
        if (tomo) whereClause.push("expediente LIKE ?");
        if (caballero) whereClause.push("caballero LIKE ?");
        if (dama) whereClause.push("dama LIKE ?");
        if (expediente) whereClause.push("tomo LIKE ?");
        if (folio) whereClause.push("folio LIKE ?");
        if (anio) whereClause.push("anio LIKE ?");
        if (operador) whereClause.push("operador LIKE ?");
        if (fecha) whereClause.push("fecha LIKE ?");

        params.push(...Object.values(filters).filter(Boolean).map(val => `%${val}%`));

        if (whereClause.length > 0) {
            query += ` WHERE ${whereClause.join(' AND ')}`;
        }
    }

    query += ` ORDER BY caballero ASC LIMIT ${RECORDS_PER_PAGE} OFFSET ${offset}`;

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
    const { consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha } = data;

    if (consecutivo && expediente && caballero && dama && tomo && folio && anio && operador && fecha) {
        // const query = `INSERT INTO matrimonios (consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const query = `INSERT INTO matrimonios (expediente, caballero, dama, tomo, folio, anio, operador, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.run(query, [consecutivo, expediente, caballero, dama, tomo, folio, anio, operador, fecha], function (err) {
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
