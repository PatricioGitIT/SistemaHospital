require("dotenv").config(); // carga de variables de entorno
//librerias, modulos, etc
const express = require("express");
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const nodemailer = require('nodemailer')

//variables de entorno
const PORT = process.env.PORT || 3000;
const JWT_SECRET_KEY = process.env.JSW_SECRET_KEY;
const mySalt = process.env.mySalt;

const app = express();
//Cors
const corsConfig = {
    origin: '*',
    methods: ["GET", "POST", "PATCH", "DELETE"]
}
app.use(cors(corsConfig));
//Base de datos
const { Pool } = require("pg");
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
})
pool.connect((err) => {
    if (err) {
        console.log('Hubo un error al conectar la base de datos')
        throw err
    }
    console.log('Conectado a la base de datos')
})

app.use(express.json());

// Sirve archivos estáticos desde la carpeta dist
app.use(express.static(path.join(__dirname, '../Frontend/dist')));

// Ruta principal para servir el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/dist', 'index.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

/*
    Configuracion del Multer
*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Directorio donde se va a guardar los documentos
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now(); // Obtener timestamp actual
        const fileName = `${timestamp}-${file.originalname}`; // Concatenar timestamp con el nombre original del archivo
        cb(null, fileName) // nuevo nombre del archivo para evitar sobreescritura
    }
});
const upload = multer({
    storage: storage, limits: {
        fileSize: 1000 * 1024 * 1024 // 1 GB en bytes, en caso de un archivo superar esta cantidad arroja error 413
    }
})
/*
    Configuracion de transporter para el servicio de correo electrónico
*/
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
});
/*
    Funciones
*/
// Función asincrónica para eliminar usuarios caducados
async function eliminarUsuarioCaducados() {
    try {
        const diaActual = new Date(); // Obtener la fecha y hora actual
        // Actualizar el estado de los usuarios cuya fecha de expiración es anterior a la fecha actual
        await pool.query('UPDATE usuario SET estado = false WHERE expiracion < $1', [diaActual]);
        console.log('Usuarios Actualizados Correctamente');
    } catch (error) {
        console.log('No se pudo actualizar los usuarios', error);
    }
}

// Función asincrónica para enviar un correo de bienvenida
async function enviarCorreoBienvenida(email, nombre, apellido, expiracion) {
    try {
        // Configuración del mensaje de correo
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: '¡Bienvenido a la plataforma!',
            text: `Hola ${nombre} ${apellido}, \n\n¡Bienvenido a la plataforma! Recuerda que puedes acceder a ella hasta la fecha: ${expiracion}. \n\nSaludos,\nHospital Psiquiátrico de Putaendo`
        };
        // Envío del correo utilizando el transportador (transporter)
        const mail = await transporter.sendMail(mailOptions);
        console.log('Correo enviado a nuevo usuario', mail.response);
    } catch (error) {
        console.log('No se pudo enviar el correo', error);
    }
}

// Función para convertir una cadena de fecha en un objeto Date
function cadenaToDate(fecha) {
    let partesFecha = fecha.split("/");
    let dia = parseInt(partesFecha[0], 10); // Obtener día
    let mes = parseInt(partesFecha[1], 10) - 1; // JavaScript usa los meses de 0 a 11
    let anyo = parseInt(partesFecha[2], 10); // Obtener año
    let newFecha = new Date(anyo, mes, dia); // Crear objeto Date con la fecha
    return newFecha;
}

// Función para verificar la caducidad del token
function verifyToken(token) {
    try {
        const decodeToken = jwt.verify(token, JWT_SECRET_KEY); // Decodificar el token
        const currentTime = Math.floor(Date.now() / 1000); // Obtener el tiempo actual en segundos
        if (decodeToken && decodeToken < currentTime) { // Verificar si el token ha caducado
            return false;
        } else {
            return true;
        }
    } catch (error) {
        return false; // Devolver falso en caso de error
    }
}

// Función para obtener el rol del usuario desde el token
function GetRol(token) {
    try {
        const decodeToken = jwt.verify(token, JWT_SECRET_KEY); // Decodificar el token
        if (decodeToken) {
            const rol = decodeToken.rol; // Obtener el rol del token decodificado
            return rol;
        }
    } catch (error) {
        console.log('Error al decodificar el token', error);
    }
}

// Función para obtener el usuario desde el token
function getUser(token) {
    try {
        const decodeToken = jwt.verify(token, JWT_SECRET_KEY); // Decodificar el token
        if (decodeToken) {
            const user = decodeToken.user; // Obtener el usuario del token decodificado
            return user;
        }
    } catch (error) {
        console.log('Error al decodificar el token', error);
    }
}

// Función asincrónica para obtener el correlativo
async function getCorrelativo() {
    try {
        // Insertar un nuevo registro en la tabla Correlativo
        await pool.query('INSERT INTO Correlativo DEFAULT VALUES');
        // Obtener el último ID insertado en la tabla Correlativo
        const result = await pool.query('SELECT id FROM Correlativo ORDER BY id DESC LIMIT 1');
        if (result.rows.length > 0) {
            return result.rows[0].id; // Devolver el ID del último registro
        } else {
            throw new Error('No se pudo crear un correlativo');
        }
    } catch (error) {
        throw error; // Lanzar un error en caso de fallo
    }
}

// Función para obtener la hora formateada
function getHoraFormateada(fecha) {
    const hora = fecha.getHours(); // Obtener la hora
    const minutos = fecha.getMinutes(); // Obtener los minutos
    const segundos = fecha.getSeconds(); // Obtener los segundos

    // Formatear la hora como una cadena en formato 'hh:mm:ss'
    return `${hora}:${minutos}:${segundos}`;
}

/*
    PATCH
*/
// Ruta PATCH para actualizar los campos de un usuario
app.patch('/usuarios/:id', async (req, res) => {
    const id = req.params.id; // Obtener el ID del usuario de los parámetros de la solicitud
    const updates = req.body; // Obtener los campos a actualizar del cuerpo de la solicitud
    const token = req.headers.authorization; // Obtener el token de autorización de los encabezados de la solicitud

    // Verificar si el token es válido
    if (verifyToken(token)) {
        try {
            let queryText = 'UPDATE usuario SET '; // Inicializar la consulta SQL para actualizar
            const queryValues = []; // Array para almacenar los valores de los parámetros de la consulta
            let paramCounter = 1; // Contador para asignar índices a los parámetros

            // Iterar sobre los campos proporcionados en 'updates'
            for (const key in updates) {
                // Verificar si la propiedad es propia del objeto (no heredada)
                if (updates.hasOwnProperty(key)) {
                    // Procesar la actualización según el tipo de campo
                    if (key === "contrasenya") { // Si se está actualizando la contraseña
                        const hashContrasenya = await bcrypt.hash(updates[key], mySalt); // Hashear la nueva contraseña
                        queryText += `contrasenya = $${paramCounter}, `; // Agregar el campo a la consulta
                        queryValues.push(hashContrasenya); // Agregar el valor hasheado al array de valores
                    } else if (key === "expiracion") { // Si se está actualizando la fecha de expiración
                        const expiracionDate = cadenaToDate(updates[key]); // Convertir la cadena a objeto Date
                        queryText += `expiracion = $${paramCounter}, `; // Agregar el campo a la consulta
                        queryValues.push(expiracionDate); // Agregar la fecha convertida al array de valores
                    } else { // Para otros campos
                        queryText += `${key} = $${paramCounter}, `; // Agregar el campo a la consulta
                        queryValues.push(updates[key]); // Agregar el valor al array de valores
                    }
                    paramCounter++; // Incrementar el contador de parámetros
                }
            }

            // Eliminar la coma y el espacio adicionales al final de la consulta
            queryText = queryText.slice(0, -2);

            // Agregar la cláusula WHERE para identificar al usuario a actualizar
            queryText += ` WHERE id = $${paramCounter} RETURNING *`;
            queryValues.push(id); // Agregar el ID del usuario al array de valores

            // Ejecutar la consulta SQL con los valores proporcionados
            const result = await pool.query(queryText, queryValues);

            // Verificar si se encontró el usuario y se actualizó correctamente
            if (result.rows.length === 0) {
                return res.status(404).send('No se pudo actualizar los datos, intentarlo nuevamente');
            } else {
                res.status(200).json(result.rows[0]); // Devolver el usuario actualizado como respuesta
            }
        } catch (error) {
            console.error('Error al actualizar recurso:', error);
            res.status(500).send('Error interno del servidor');
        }
    } else {
        res.status(401).send('Token inválido'); // Devolver un error si el token no es válido
    }
});

/*
    DELETE
*/
// Ruta DELETE para eliminar un video por su ID
app.delete('/videos/:id', async (req, res) => {
    const id = req.params.id; // Obtener el ID del video de los parámetros de la solicitud
    const token = req.headers.authorization; // Obtener el token de autorización de los encabezados de la solicitud

    // Verificar si el token es válido
    if (verifyToken(token)) {
        try {
            // Consultar la ruta del archivo de video en la base de datos
            const file = await pool.query('SELECT ruta FROM video WHERE id = $1', [id]);
            if (!file) {
                res.status(404).send('No se encontró el video');
            }

            // Obtener la ruta del archivo de video
            const filePath = path.join(file.rows[0].ruta);

            try {
                // Eliminar el archivo de video del sistema de archivos
                fs.unlinkSync(filePath);

                // Actualizar las referencias a este video en la tabla de actividades
                await pool.query('UPDATE actividad SET video_id = NULL WHERE video_id = $1', [id]);

                // Eliminar el registro de video de la base de datos
                await pool.query('DELETE FROM video WHERE id = $1', [id]);

                res.status(200).send('Video eliminado correctamente');
            } catch (error) {
                if (error.code === 'ENOENT') { // Manejar el caso de archivo no encontrado
                    await pool.query('UPDATE actividad SET video_id = NULL WHERE video_id = $1', [id]);
                    await pool.query('DELETE FROM video WHERE id = $1', [id]);
                    res.status(200).send('Video eliminado correctamente');
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('No se pudo eliminar correctamente');
        }
    } else {
        res.status(500).send('Error en la verificación del token');
    }
});

// Ruta DELETE para eliminar un documento por su ID
app.delete('/documentos/:id', async (req, res) => {
    const id = req.params.id; // Obtener el ID del documento de los parámetros de la solicitud
    const token = req.headers.authorization; // Obtener el token de autorización de los encabezados de la solicitud

    // Verificar si el token es válido
    if (verifyToken(token)) {
        try {
            // Consultar la ruta del archivo de documento en la base de datos
            const file = await pool.query('SELECT ruta FROM documento WHERE id = $1', [id]);
            if (!file) {
                res.status(404).send('No se encontró el documento');
            }

            // Obtener la ruta del archivo de documento
            const filePath = path.join(file.rows[0].ruta);

            try {
                // Eliminar el archivo de documento del sistema de archivos
                fs.unlinkSync(filePath);

                // Actualizar las referencias a este documento en la tabla de actividades
                await pool.query('UPDATE actividad SET documento_id = NULL WHERE documento_id = $1', [id]);

                // Eliminar el registro de documento de la base de datos
                await pool.query('DELETE FROM documento WHERE id = $1', [id]);

                res.status(200).send('Documento eliminado correctamente');
            } catch (error) {
                if (error.code === 'ENOENT') { // Manejar el caso de archivo no encontrado
                    await pool.query('UPDATE actividad SET documento_id = NULL WHERE documento_id = $1', [id]);
                    await pool.query('DELETE FROM documento WHERE id = $1', [id]);
                    res.status(200).send('Documento eliminado correctamente');
                } else {
                    throw error;
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Hubo un error en el servidor');
        }
    } else {
        res.status(401).send('Token no válido');
    }
});
/*
    POST
*/
// Ruta POST '/register': Registra un nuevo usuario en la base de datos
app.post('/register', async (req, res) => { 
    // Extracción de datos del cuerpo de la solicitud
    const rut = req.body.rut;
    const name = req.body.name;
    const firstSurname = req.body.firstSurname;
    const secondSurname = req.body.secondSurname;
    const email = req.body.email;
    const contrasenya = req.body.password;
    const rol = req.body.rol;
    const expiracionString = req.body.expiracionString; // Cadena de expiración desde el frontend
    const fecCreacion = new Date();
    try {
        // Verificación del token de autorización
        if (verifyToken(req.body.token)) {
            // Conversión de la cadena de expiración a objeto Date
            const expiracion = cadenaToDate(expiracionString);
            // Encriptación de la contraseña
            // const encodePwd = await bcrypt.hash(password, mySalt); problema encriptado
            // Obtención del creador desde el token
            console.log('constraseña')
            const creador = getUser(req.body.token);
            const estado = true;
            // Inserción de los datos del usuario en la base de datos
            const result = await pool.query('INSERT INTO usuario(id, nombre, apellidopaterno, apellidomaterno, email, feccreacion, expiracion, contrasenya, rol, estado, creador) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [rut, name, firstSurname, secondSurname, email, fecCreacion, expiracion, contrasenya, rol, estado, creador]);
            // Registro de la actividad de registro del usuario
    
            const fechaActual = new Date();
            const fecha = getHoraFormateada(fechaActual);
            const actividad = `Registro de nuevo usuario con el rut ${rut}`;
            const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id) VALUES($1, $2, $3, $4)', [fecha, fechaActual, actividad, creador]);
            // Envío de correo de bienvenida al usuario registrado
            enviarCorreoBienvenida(email, name, firstSurname, expiracion);
            // Envío de respuesta exitosa
            res.send(result.rows);
        }
    } catch (error) {
        // Manejo de errores
        console.error(error);
        res.status(401).send('Hubo un error al registrar al usuario en la base de datos');
    }
});

// Ruta POST '/login': Inicia sesión de un usuario y genera un token de acceso
app.post('/login', async (req, res) => {
    // Extracción de datos del cuerpo de la solicitud
    const rut = req.body.rut; // ID del usuario
    console.log(rut);
    const pwd = req.body.password; // Contraseña proporcionada
    console.log(pwd);
    try {
        // Consulta en la base de datos para obtener el usuario
        const result = await pool.query("SELECT * FROM Usuario WHERE id = $1 AND estado = true", [rut]);

        if (result.rows.length > 0) {
            const user = result.rows[0]; // Obtener el usuario

            // Comparar la contraseña proporcionada con la almacenada
            if (pwd === user.contrasenya) { // Comparación directa
                // Generar el token de acceso si las credenciales son correctas
                const token = jwt.sign({ user: rut, rol: user.rol }, JWT_SECRET_KEY, { expiresIn: '2h' });

                // Registro de la actividad de inicio de sesión
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = 'Inicio de sesion';
                await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id) VALUES($1, $2, $3, $4)', [fecha, fechaActual, actividad, rut]);

                // Envío del token como respuesta
                res.status(200).send(token);
            } else {
                res.status(401).send('Credenciales incorrectas');
            }
        } else {
            res.status(401).send('Credenciales incorrectas');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta POST '/video': Sube un video a la aplicación
app.post('/video', upload.single('file'), async (req, res) => {
    // Verificación del token de autorización
    if (verifyToken(req.headers.authorization)) {
        // Extracción de datos del cuerpo de la solicitud
        const name = req.body.name;
        const descripcion = req.body.descripcion;
        const url = req.body.url;
        const permisos = req.body.selectedRol;
        const pathVid = req.file.path;
        const user = getUser(req.headers.authorization);

        try {
            // Inserción de los datos del video en la base de datos
            const result = pool.query('INSERT INTO video(nombre, descripcion, permisos, url, autor_id, ruta) VALUES($1, $2, $3, $4, $5, $6)', [name, descripcion, permisos, url, user, pathVid]);
            // Respuesta exitosa
            res.status(200).send('Se subió con éxito el video');
        } catch (error) {
            // Manejo de errores
            console.log(error);
            res.status(500).send('No se subió con éxito el video');
        }

    } else {
        // Respuesta en caso de token inválido
        res.status(401).send('Token inválido');
    }
});

// Ruta POST '/documento': Sube un documento a la aplicación
app.post('/documento', upload.single('file'), async (req, res) => {
    // Extracción de datos del cuerpo de la solicitud
    const id = req.body.id;
    const name = req.body.name;
    const ambito = req.body.ambito;
    const permisos = req.body.permisos;
    const pathDoc = req.file.path;
    const user = getUser(req.body.token);

    // Verificación del token de autorización
    if (verifyToken(req.body.token)) {
        try {
            if (id === '') {
                // Si el ID está vacío, se genera un correlativo
                console.log('El ID está vacío');
                const correlativo = await getCorrelativo();
                console.log(correlativo);
                // Inserción de los datos del documento en la base de datos
                const result = await pool.query('INSERT INTO documento(id, correlativo_id, nombre, ruta, permisos, ambito, autor_id) VALUES($1, $2, $3, $4, $5, $6, $7)', [correlativo, correlativo, name, pathDoc, permisos, ambito, user]);
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = 'Subió un documento sin ID';
                try {
                    // Registro de la actividad
                    const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id, documento_id) VALUES($1, $2, $3, $4, $5)', [fecha, fechaActual, actividad, user, correlativo]);
                    res.status(200).send('Datos guardados correctamente');
                } catch (error) {
                    res.status(500).send('Ha ocurrido un error');
                }
            } else {
                // Si el ID no está vacío, se utiliza el ID proporcionado
                console.log('El ID no está vacío');
                const result = await pool.query('INSERT INTO documento(id, nombre, ruta, permisos, ambito, autor_id) VALUES($1, $2, $3, $4, $5, $6)', [id, name, pathDoc, permisos, ambito, user]);
                const rut = getUser(req.body.token);
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = 'Subió un documento sin ID';
                try {
                    // Registro de la actividad
                    const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id, documento_id) VALUES($1, $2, $3, $4, $5)', [fecha, fechaActual, actividad, rut, id]);
                    res.status(200).send('Datos guardados correctamente');
                } catch (error) {
                    res.status(500).send('Ha ocurrido un error');
                }
            }
        } catch (error) {
            // Manejo de errores
            console.log(error);
            res.status(500).send('Los datos no se pudieron guardar');
        }
    } else {
        // Respuesta en caso de token inválido
        res.status(401).send('Token inválido');
    }
});
/*
    Metodos GET 
*/
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/', 'index.html'));
});
// Ruta GET '/usuario': Devuelve un solo usuario
app.get('/usuario', async (req, res) => {
    // Extracción del ID del usuario de la consulta
    const id = req.query.id;
    // Extracción del token de autorización de la cabecera
    const token = req.headers.authorization;

    // Verificación del token de autorización
    if (verifyToken(token)) {
        try {
            if (id) {
                // Consulta del usuario por su ID en la base de datos
                const response = await pool.query('SELECT id, nombre, apellidopaterno, apellidomaterno, email, feccreacion, expiracion, rol, creador FROM usuario WHERE id = $1', [id]);
                const rut = getUser(req.headers.authorization);
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = `Seleccionó al usuario con rut ${id}`;

                try {
                    // Registro de la actividad del usuario
                    const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id) VALUES($1, $2, $3, $4)', [fecha, fechaActual, actividad, rut]);
                    res.status(200).send(response.rows);
                } catch (error) {
                    res.status(500).send('Ha ocurrido un error');
                }
            } else {
                // Respuesta en caso de que no se proporcione un ID en la consulta
                res.sendStatus(404);
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(500);
        }
    } else {
        // Respuesta en caso de token inválido
        res.status(401).send('Token inválido');
    }
});

// Ruta GET '/usuarios': Devuelve una lista de usuarios
app.get('/usuarios', async (req, res) => {
    // Extracción del nombre del usuario de la consulta
    const name = req.query.name;
    // Extracción del token de autorización de la cabecera
    const token = req.headers.authorization;

    // Verificación del token de autorización
    if (verifyToken(token)) {
        try {
            if (!name) {
                // Si no se proporciona un nombre en la consulta, se obtienen todos los usuarios activos
                const response = await pool.query('SELECT nombre, id FROM usuario WHERE estado = true');
                const rut = getUser(req.headers.authorization);
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = 'Realizó búsqueda de usuarios';

                try {
                    // Registro de la actividad del usuario
                    const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id) VALUES($1, $2, $3, $4)', [fecha, fechaActual, actividad, rut]);
                    res.status(200).send(response.rows);
                } catch (error) {
                    res.status(500).send('Ha ocurrido un error en el servidor');
                }
            } else {
                // Si se proporciona un nombre en la consulta, se buscan usuarios que coincidan con ese nombre
                const response = await pool.query('SELECT nombre, id FROM usuario WHERE nombre LIKE $1', [`%${name}%`]);
                const rut = getUser(req.headers.authorization);
                const fechaActual = new Date();
                const fecha = getHoraFormateada(fechaActual);
                const actividad = `Realizó búsqueda de usuarios con el nombre de ${name}`;

                try {
                    // Registro de la actividad del usuario
                    const act = await pool.query('INSERT INTO actividad(hora, fecha, tipoActividad, usuario_id) VALUES($1, $2, $3, $4)', [fecha, fechaActual, actividad, rut]);
                    res.status(200).send(response.rows);
                } catch (error) {
                    res.status(500).send('Ha ocurrido un error');
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('No se pudo realizar consulta en la base de datos');
        }
    }
});
// Ruta GET '/checkDocumento/:id': devuelve un booleano
app.get('/checkDocumento/:id', async (req, res) => {
    try {
        // Obtener el ID del documento desde los parámetros de la solicitud
        const id = req.params.id;
        // Realizar una consulta a la base de datos para verificar si el documento existe
        const result = await pool.query('SELECT * FROM documento WHERE id = $1', [id]);
        // Verificar si se encontró algún documento con el ID especificado
        if (result.rows.length > 0) {
            // Si se encontró el documento, enviar una respuesta indicando que el documento existe
            res.status(200).send(true);
        } else {
            // Si no se encontró el documento, enviar una respuesta indicando que el documento no existe
            res.status(200).send(false);
        }
    } catch (error) {
        // Manejar cualquier error que pueda ocurrir durante la ejecución de la consulta
        console.error(error);
        res.status(500).send('Error en el servidor');
    }
});

// Ruta GET '/getRol': Para obtener el rol del usuario cuando el front-end lo necesita
app.get('/getRol', (req, res) => {
    // Extracción del token de autorización de la cabecera
    const token = req.headers.authorization;

    // Verificación de que se proporcionó un token
    if (token) {
        // Obtención del rol del usuario utilizando el token
        const rol = GetRol(token);

        // Verificación de que se obtuvo el rol correctamente
        if (rol) {
            // Envío del rol como respuesta al cliente
            res.send(rol.toString());
        } else {
            // Respuesta en caso de que no se pueda obtener el rol
            res.status(500).send('No se pudo obtener el rol');
        }
    } else {
        // Respuesta en caso de que no se proporcione un token
        res.sendStatus(400);
    }
});
// Ruta GET '/documentos/:id': Para ver un documento
app.get('/documentos/:id', async (req, res) => {
    // Obtener el ID del documento de los parámetros de la URL
    const id = req.params.id;
    // Obtener el token de autorización de la cabecera
    const token = req.headers.authorization;
    try {
        // Consulta a la base de datos por el ID del documento
        const result = await pool.query('SELECT * FROM documento WHERE id = $1', [id]);
        // Verificar si se encontró el documento
        if (result.rows.length > 0) {
            // Obtener la ruta del documento
            const pathDoc = result.rows[0].ruta;
            // Obtener el nombre del archivo del path
            const name = path.basename(pathDoc);
            // Configurar el nombre del archivo en el encabezado de la respuesta
            res.setHeader('Content-Disposition', `inline; filename="${name}"`);
            // Leer el archivo del disco
            fs.readFile(pathDoc, async (err, data) => {
                if (err) {
                    res.status(404).send('Error al obtener el documento');
                } else {
                    // Establecer el tipo de contenido como aplicación/pdf
                    res.contentType("application/pdf");
                    // Enviar el documento como respuesta
                    const rut = getUser(token);
                    const fechaActual = new Date();
                    const fecha = getHoraFormateada(fechaActual);
                    const actividad = 'vió un documento';
                    try {
                        // Registrar la actividad en la base de datos
                        const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id,documento_id) VALUES($1,$2,$3,$4,$5)', [fecha, fechaActual, actividad, rut, id]);
                        res.send(data);
                    } catch (error) {
                        res.status(500).send('Ha ocurrido un error en el servidor');
                    }
                }
            });
        } else {
            res.status(404).send('No se encontró el documento');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Hubo un error en el servidor');
    }
});
app.get('/documentos', async (req, res) => { // Ruta GET para obtener una lista de documentos
    const ambito = req.query.ambito; // Obtener el parámetro de ámbito de la consulta URL
    const name = req.query.name; // Obtener el parámetro de nombre de la consulta URL
    const rol = GetRol(req.headers.authorization); // Obtener el rol del usuario del token de autorización

    // Verificar si se ha proporcionado un rol válido
    if (rol) {
        try {
            // Verificar si el ámbito es "undefined" o "0", lo que significa cualquier ámbito
            if (ambito === 'undefined' || ambito === '0') {
                // Verificar si el nombre del documento está vacío
                if (!name) {
                    // Consultar la base de datos para obtener todos los documentos con permisos mayores o iguales al rol del usuario
                    const result = await pool.query('SELECT * FROM documento WHERE permisos >= $1', [rol]);
                    const rut = getUser(req.headers.authorization);
                    const fechaActual = new Date();
                    const fecha = getHoraFormateada(fechaActual);
                    const actividad = 'realizó busqueda de documentos';
                    try {
                        const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id) VALUES($1,$2,$3,$4)', [fecha, fechaActual, actividad, rut]);
                        res.status(200).send(result.rows);
                    } catch (error) {
                        res.status(500).send('Ha ocurrido un error');
                    }
                } else {
                    // Consultar la base de datos para obtener documentos por nombre y con permisos mayores o iguales al rol del usuario
                    const result = await pool.query('SELECT * FROM documento WHERE nombre LIKE $1 AND permisos >= $2', [`%${name}%`, rol]);
                    const rut = getUser(req.headers.authorization);
                    const fechaActual = new Date();
                    const fecha = getHoraFormateada(fechaActual);
                    const actividad = `Buscó Documento por el nombre ${name}`;
                    try {
                        const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id) VALUES($1,$2,$3,$4)', [fecha, fechaActual, actividad, rut]);
                        res.status(200).send(result.rows);
                    } catch (error) {
                        res.status(500).send('Ha ocurrido un error');
                    }
                }
            } else {
                // Verificar si el nombre del documento está vacío
                if (!name) {
                    // Consultar la base de datos para obtener documentos por ámbito y con permisos mayores o iguales al rol del usuario
                    const result = await pool.query('SELECT * FROM documento WHERE ambito = $1 AND permisos >= $2', [ambito, rol]);
                    const rut = getUser(req.headers.authorization);
                    const fechaActual = new Date();
                    const fecha = getHoraFormateada(fechaActual);
                    const actividad = `Buscó Documentos en ambito:${ambito}`;
                    try {
                        const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id) VALUES($1,$2,$3,$4)', [fecha, fechaActual, actividad, rut]);
                        res.status(200).send(result.rows);
                    } catch (error) {
                        res.status(500).send('Ha ocurrido un error');
                    }
                } else {
                    // Consultar la base de datos para obtener documentos por ámbito, nombre y con permisos mayores o iguales al rol del usuario
                    const result = await pool.query('SELECT * FROM documento WHERE nombre LIKE $1 AND ambito = $2 AND permisos >= $3', [`%${name}%`, ambito, rol]);
                    const rut = getUser(req.headers.authorization);
                    const fechaActual = new Date();
                    const fecha = getHoraFormateada(fechaActual);
                    const actividad = `Buscó en ambito:${ambito} con el nombre:${name}`;
                    try {
                        const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id) VALUES($1,$2,$3,$4)', [fecha, fechaActual, actividad, rut]);
                        res.status(200).send(result.rows);
                    } catch (error) {
                        res.status(500).send('Ha ocurrido un error');
                    }
                }
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Error en el servidor');
        }
    } else {
        res.status(401).send('Hubo un problema con el token');
    }
});
app.get('/videos/:id', async (req, res) => { // Ruta GET para obtener un video por su ID
    const id = req.params.id; // Obtener el ID del video de los parámetros de la URL
    const token = req.headers.authorization; // Obtener el token de autorización de la cabecera de la solicitud
    // Verificar si el token es válido
    if (verifyToken(token)) {
        try {
            // Consultar la base de datos para obtener el video por su ID
            const result = await pool.query('SELECT * FROM video WHERE id = $1', [id]);
            // Verificar si se encontró el video en la base de datos
            if (result.rows.length > 0) {
                const pathVid = result.rows[0].ruta; // Obtener la ruta del video desde la base de datos
                const name = path.basename(pathVid); // Obtener el nombre del archivo de la ruta
                res.setHeader('Content-Disposition', `inline; filename="${name}"`); // Configurar el nombre del archivo en el encabezado de la respuesta
                fs.readFile(pathVid, async (err, data) => {
                    if (err) {
                        res.status(404).send('Error en obtener video'); // Enviar un mensaje de error si hay un problema al leer el video
                    } else {
                        res.contentType("video/mp4"); // Establecer el tipo de contenido del archivo a video/mp4
                        const rut = getUser(token); // Obtener el ID del usuario del token
                        const fechaActual = new Date();
                        const fecha = getHoraFormateada(fechaActual); // Obtener la fecha actual formateada
                        const actividad = 'vió un video'; // Definir la actividad del usuario
                        try {
                            // Registrar la actividad del usuario en la base de datos
                            const act = await pool.query('INSERT INTO actividad(hora,fecha,tipoActividad,usuario_id,video_id) VALUES($1,$2,$3,$4,$5)', [fecha, fechaActual, actividad, rut, id]);
                            console.log('enviando video');
                            res.send(data); // Enviar el contenido del video como respuesta
                        } catch (error) {
                            res.status(500).send('Ha ocurrido un error en el servidor'); // Enviar un mensaje de error si hay un problema al registrar la actividad
                        }
                    }
                });
            } else {
                res.status(404).send('Video no encontrado'); // Enviar un mensaje de error si el video no se encuentra en la base de datos
            }
        } catch (error) {
            console.log(error);
            res.status(500).send('Error en el servidor'); // Enviar un mensaje de error si hay un problema al consultar la base de datos
        }
    } else {
        res.status(401).send('Token invalido'); // Enviar un mensaje de error si el token no es válido
    }
});
app.get('/videos', async (req, res) => { // Ruta GET para obtener una lista de videos
    const name = req.query.name; // Obtener el parámetro de consulta "name" de la URL
    const rol = GetRol(req.headers.authorization); // Obtener el rol del usuario del token de autorización

    try {
        if (!name) { // Si el parámetro "name" no está presente en la solicitud
            // Consultar la base de datos para obtener todos los videos cuyos permisos sean mayores o iguales al rol del usuario
            const result = await pool.query('SELECT * FROM video WHERE permisos >= $1', [rol]);
            res.send(result.rows); // Enviar la lista de videos como respuesta
        } else { // Si el parámetro "name" está presente en la solicitud
            // Consultar la base de datos para obtener los videos cuyos nombres coincidan parcialmente con el valor de "name"
            // y cuyos permisos sean mayores o iguales al rol del usuario
            const result = await pool.query('SELECT * FROM video WHERE nombre LIKE $1 AND permisos >= $2', [`%${name}%`, rol]);
            res.send(result.rows); // Enviar la lista de videos filtrada por nombre como respuesta
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor'); // Enviar un mensaje de error si hay un problema en el servidor al consultar la base de datos
    }
});
app.get('/bitacora/:id', async (req, res) => { // Ruta GET para obtener la bitácora de actividades de un usuario por su ID
    const id = req.params.id; // Obtener el ID del usuario de los parámetros de la URL
    const token = req.headers.authorization; // Obtener el token de autorización de los encabezados de la solicitud

    if (verifyToken(token)) { // Verificar si el token es válido
        if (id) { // Verificar si se proporcionó un ID válido
            try {
                // Consultar la base de datos para obtener todas las actividades registradas para el usuario con el ID especificado
                const result = await pool.query('SELECT * FROM actividad WHERE usuario_id = $1', [id]);

                // Formatear los resultados para mostrar solo la fecha en formato ISO sin la parte de la hora
                const formattedResult = result.rows.map(entry => ({
                    ...entry,
                    fecha: new Date(entry.fecha).toISOString().split('T')[0] // Obtener solo la parte de la fecha antes de la 'T'
                }));

                res.status(200).send(formattedResult); // Enviar la lista de actividades formateadas como respuesta
            } catch (error) {
                res.status(404).send('Bitácora no encontrada'); // Enviar un mensaje de error si no se encuentra la bitácora de actividades
            }
        }
    }
});

// Establecer un intervalo para ejecutar la función eliminarUsuarioCaducados cada 24 horas
setInterval(eliminarUsuarioCaducados, 24 * 60 * 60 * 1000);

// Iniciar el servidor
app.listen(PORT, () => {
    // Imprimir mensaje en la consola indicando que el servidor está escuchando en el puerto PORT
    console.log(`Escuchando en ${PORT}`);

    // Llamar a la función eliminarUsuarioCaducados una vez al iniciar el servidor
    eliminarUsuarioCaducados();
});