require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Variables de entorno
const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("FATAL ERROR: MONGO_URI no está definido en el archivo .env");
  process.exit(1);
}

// Inicializar cliente de MongoDB
const client = new MongoClient(uri);
let db;

// Función para conectar a la base de datos
async function connectToDatabase() {
  try {
    await client.connect();
    // Nos conectamos a la base de datos específica "hungry_db"
    db = client.db('hungry_db');
    console.log('¡Conexión exitosa a la base de datos de HungryAnimal en MongoDB Atlas!');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    process.exit(1);
  }
}

connectToDatabase();

// Ruta GET para obtener los productos
app.get('/api/productos', async (req, res) => {
  try {
    // Nos conectamos a la colección "products"
    const collection = db.collection('products');
    
    // Obtenemos todos los documentos
    const productos = await collection.find({}).toArray();
    
    // Los devolvemos en formato JSON
    res.json(productos);
  } catch (error) {
    console.error('Error al consultar los productos:', error);
    res.status(500).json({ error: 'Hubo un error al obtener los productos.' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor de HungryAnimal escuchando en el puerto ${port}`);
});
