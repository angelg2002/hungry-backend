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

// Ruta POST para el login de usuarios
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Por favor, proporciona email y contraseña.' });
    }

    const collection = db.collection('users');
    // Buscamos al usuario por su email
    const user = await collection.findOne({ email: email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu email y contraseña.' });
    }

    // Si es correcto, devolvemos los datos (sin enviar la contraseña de vuelta)
    res.json({ nombre: user.nombre, email: user.email, status: user.status || 'user' });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Hubo un error al procesar el login.' });
  }
});

// RUTA DE LOGIN: Verifica las credenciales de los usuarios de HungryAnimal
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body; // Recibimos lo que el usuario escribió en el formulario

    try {
        const db = client.db('hungry_db');
        const usersCollection = db.collection('users');

        // 1. Buscar si el correo existe en nuestra lista de 10 usuarios
        const user = await usersCollection.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ mensaje: "El correo no está registrado" });
        }

        // 2. Comparar la contraseña (texto plano por ahora)
        if (user.password === password) {
            // Si coincide, enviamos los datos (excepto el password por seguridad)
            const { password, ...userData } = user;
            res.json({
                mensaje: "¡Bienvenido a HungryAnimal!",
                user: userData
            });
        } else {
            res.status(401).json({ mensaje: "Contraseña incorrecta" });
        }

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor de HungryAnimal escuchando en el puerto ${port}`);
});
