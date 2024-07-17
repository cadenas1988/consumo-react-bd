const { Pool } = require('pg');
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: 'D:\\app\\caden\\product\\11.2.0\\client_1' }); // Cambia esta ruta según la ubicación de tu instant client

// Configuración de PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Itvh5511',
  port: 5433,
};

// Configuración de Oracle
const oracleConfig = {
  user: 'sabdere',
  password: 'bdes4bd3r3',
  connectString: '172.24.3.42:1524/bde', // Cambia esto según tu configuración
  connectTimeout: 60000 // Tiempo de espera en milisegundos (por ejemplo, 60 segundos)
};

/*const oracleConfig = {
  user: 'CADENAS',
  password: 'Itvh5511',
  connectString: 'localhost:1521/xe', // Cambia esto según tu configuración
  connectTimeout: 60000 // Tiempo de espera en milisegundos (por ejemplo, 60 segundos)
};*/

// Selección de la base de datos activa
const activeDB = 'oracle'; // Cambia esto a 'oracle' si deseas usar Oracle

let dbConfig;
if (activeDB === 'postgres') {
  dbConfig = new Pool(pgConfig);
} else if (activeDB === 'oracle') {
  dbConfig = oracleConfig;
}


module.exports = {
  dbConfig,
  activeDB,
};
