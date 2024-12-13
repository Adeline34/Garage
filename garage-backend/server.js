const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');

const app = express();

// Vérifie si le dossier 'uploads' existe, sinon il le crée
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('Dossier "uploads" créé avec succès');
}

// Configuration de CORS
const corsOptions = {
    origin: 'http://localhost:3000', // Autorise les requêtes du frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
    allowedHeaders: ['Content-Type'], // En-têtes autorisés
};

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/gestion_clients', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(err => console.error('Erreur de connexion à MongoDB :', err));

// Définition du modèle "Client"
const clientSchema = new mongoose.Schema({
    nom: String,
    prenom: String,
    email: String,
    telephone: String,
    adresse: String,
    historique: Array,
    vehicule: {
        marque: String,
        modele: String,
        immatriculation: String,
        anneeFabrication: String,
        kilometrage: Number,
        dateControleTechnique: String,
    },
    devis: {
        numero: String,
        date: String,
        montantTotal: Number,
        travaux: String,
        etat: { type: String, default: 'en attente' }, // en attente, accepté, refusé
    },
    preferences: {
        contact: String, // email, téléphone, SMS
        paiement: String, // CB, chèque, espèces
    },
    fichier: String, // Stocke le chemin du fichier téléchargé
});

const Client = mongoose.model('Client', clientSchema); // Crée le modèle basé sur le schéma

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
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']; // Types de fichiers autorisés
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Fichier non valide'), false);
        }
        cb(null, true);
    },
});

// Routes Backend
app.get('/api/clients', async (req, res) => {
    try {
        const clients = await Client.find(); // Récupère tous les clients
        res.json(clients);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

app.post('/api/clients', async (req, res) => {
    try {
        const newClient = new Client(req.body); // Crée un nouveau client
        await newClient.save(); // Sauvegarde dans MongoDB
        res.status(201).json(newClient);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

app.put('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedClient = await Client.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }
        res.json(updatedClient);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

app.delete('/api/clients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Client.findByIdAndDelete(id);
        res.status(200).json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

app.post('/api/upload/:id', upload.single('file'), async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    try {
        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({ message: 'Client non trouvé' });
        }

        // Ajoute le chemin du fichier au client
        client.fichier = req.file.filename;
        await client.save();

        res.status(200).json({ message: 'Fichier téléchargé avec succès', fichier: req.file.filename });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error });
    }
});

// Démarrage du serveur
const port = 5000;
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
