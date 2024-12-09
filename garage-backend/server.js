const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const app = express();

// Configuration de CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Autorise les requêtes du frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
    allowedHeaders: ['Content-Type'], // En-têtes autorisés
};

app.use(cors(corsOptions)); // Applique les options CORS
app.use(express.json()); // Middleware pour parser les données JSON

// Configure Multer pour enregistrer les fichiers dans un dossier 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads'); // Dossier où les fichiers seront enregistrés
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Utilisation d'un timestamp pour éviter les conflits de noms
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Ajoute ici les types valides
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Fichier non valide'), false);
        }
        cb(null, true);
    },
});

// Exemple de route : récupérer les clients depuis une base réelle
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await db.collection('clients').find().toArray();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Exemple de route : ajouter un client avec un fichier
app.post('/api/clients', async (req, res) => {
    try {
        const newClient = req.body; // Récupère les données envoyées
        await db.collection('clients').insertOne(newClient); // Insère dans la base
        res.status(201).json(newClient); // Répond avec le nouveau client
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Route pour télécharger un fichier (par exemple, un devis ou une carte grise)
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Aucun fichier téléchargé');
    }
    res.status(200).json({
        message: 'Fichier téléchargé avec succès',
        filePath: req.file.path, // Le chemin du fichier sur le serveur
    });
});

// Serveur en écoute
const port = 5000;
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
