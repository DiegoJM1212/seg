const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const app = express();

// Configuración de la base de datos
const config = {
  user: 'diego', // Usuario de SQL en Azure
  password: 'Paramore.1997', // Asegúrate de poner la contraseña correcta
  server: 'diegojm.database.windows.net', // Nombre del servidor de Azure SQL
  database: 'kawaipet', // Nombre de la base de datos en Azure
  options: {
    encrypt: true, // Habilita la encriptación para la conexión segura
    trustServerCertificate: false, // No confiar en certificados no firmados
  },
};

// Middleware para aceptar solicitudes JSON
app.use(express.json());

// Habilitar CORS
app.use(cors());

// Middleware para loggear y limpiar todas las solicitudes
app.use((req, res, next) => {
  const decodedUrl = decodeURIComponent(req.url);
  const cleanUrl = decodedUrl.replace(/\s+/g, '');
  console.log(`${new Date().toISOString()} - ${req.method} ${cleanUrl}`);
  req.url = cleanUrl;
  next();
});

// Ruta de prueba simple
app.get('/test', (req, res) => {
  console.log('Ruta de prueba accedida');
  res.json({ message: 'Ruta de prueba funcionando' });
});

// Ruta para obtener todos los seguros
app.get('/seguros', async (req, res) => {
  console.log('Ruta /seguros accedida');
  try {
    console.log('Conectando a la base de datos...');
    await sql.connect(config);
    console.log('Conexión exitosa a la base de datos');

    const result = await sql.query('SELECT * FROM seguros');
    console.log('Datos obtenidos:', result.recordset);

    if (result.recordset.length === 0) {
      console.log('No se encontraron seguros');
      return res.status(404).json({ message: 'No se encontraron seguros' });
    }

    console.log('Enviando datos de seguros');
    return res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener seguros:', err);
    res.status(500).json({ message: 'Error al obtener seguros', error: err.message });
  } finally {
    // Asegurarse de cerrar la conexión siempre
    await sql.close();
    console.log('Conexión a la base de datos cerrada');
  }
});

// Ruta para manejar errores de rutas no definidas
app.use((req, res) => {
  console.log('Ruta no encontrada:', req.url);
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar el servidor en el puerto 3003
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
