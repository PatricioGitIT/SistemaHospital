-- Crear tabla Usuario
CREATE TABLE Usuario (
    id CHAR(8) PRIMARY KEY CHECK (LENGTH(id) BETWEEN 7 AND 8),
    nombre VARCHAR(15) NOT NULL,
    apellidoPaterno VARCHAR(15) NOT NULL,
    apellidoMaterno VARCHAR(15) NOT NULL,
    email VARCHAR(40) NOT NULL,
    contrasenya VARCHAR(2000) NOT NULL,
    FecCreacion DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiracion DATE NOT NULL,
    rol INTEGER NOT NULL,
    estado BOOLEAN NOT NULL,
    creador CHAR(8) REFERENCES Usuario(id)
    CONSTRAINT check_fechas CHECK (FecCreacion <= expiracion) -- Asegura que la fecha de creación sea antes que la fecha de expiración
);

-- Crear tabla Documento
CREATE TABLE Documento (
    id VARCHAR(20) PRIMARY KEY,
    correlativo_id INTEGER UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    Ruta VARCHAR(255) NOT NULL,
    Permisos INTEGER NOT NULL,
    ambito INTEGER NOT NULL, -- Agregar la columna ambito
    autor_id CHAR(8) REFERENCES Usuario(id)
);

-- Crear tabla Correlativo
CREATE TABLE Correlativo (
    id SERIAL PRIMARY KEY,
    documento_id VARCHAR(20) UNIQUE REFERENCES Documento(id)
);

-- Crear tabla Video
CREATE TABLE Video (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    Permisos INTEGER NOT NULL,
    url VARCHAR(255) ,
    ruta VARCHAR(255) NOT NULL,
    autor_id CHAR(8) REFERENCES Usuario(id)
);

-- Crear tabla Actividad
CREATE TABLE Actividad (
    id SERIAL PRIMARY KEY,
    hora TIME NOT NULL,
    fecha DATE NOT NULL,
    tipoActividad VARCHAR(100) NOT NULL,
    usuario_id CHAR(8) REFERENCES Usuario(id),
    documento_id VARCHAR(20) REFERENCES Documento(id),
    video_id INTEGER REFERENCES Video(id)
);
INSERT INTO Usuario (id, nombre, apellidoPaterno, apellidoMaterno, email, contrasenya, FecCreacion, expiracion, rol, estado, creador)
VALUES ('11111111', 'Usuario', 'Inicial', 'Admin', 'usuario@admin.com', '$2b$10$ABCDEFGHIJKLMNOPQRSTUOCWk9KGv22I2SBBdwJ9cjLh5JMvbl2MG', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 1, true, '11111111');