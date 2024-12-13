import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    vehicule: { marque: '', modele: '', immatriculation: '', anneeFabrication: '', kilometrage: '', dateControleTechnique: '' },
    devis: { numero: '', date: '', montantTotal: '', travaux: '', etat: 'en attente' },
    preferences: { contact: 'email', paiement: 'CB' },
  });
  const [editingClient, setEditingClient] = useState(null);

  // Récupérer la liste des clients
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/clients')
      .then((response) => setClients(response.data))
      .catch((error) => console.error('Erreur de chargement :', error));
  }, []);

  // Gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Vérifier si le champ est imbriqué (par exemple "vehicule.marque")
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Gérer l'envoi du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingClient) {
        // Mise à jour d'un client existant
        await axios.put(`http://localhost:5000/api/clients/${editingClient._id}`, formData);
      } else {
        // Création d'un nouveau client
        await axios.post('http://localhost:5000/api/clients', formData);
      }

      // Recharger la liste des clients
      const updatedClients = await axios.get('http://localhost:5000/api/clients');
      setClients(updatedClients.data);

      // Réinitialiser le formulaire
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        adresse: '',
        vehicule: { marque: '', modele: '', immatriculation: '', anneeFabrication: '', kilometrage: '', dateControleTechnique: '' },
        devis: { numero: '', date: '', montantTotal: '', travaux: '', etat: 'en attente' },
        preferences: { contact: 'email', paiement: 'CB' },
      });
      setEditingClient(null);
    } catch (error) {
      console.error('Erreur lors de l\'ajout ou de la mise à jour :', error);
    }
  };

  // Sélectionner un client à modifier
  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
  };

  // Supprimer un client
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`);
      setClients(clients.filter((client) => client._id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression :', error);
    }
  };

  return (
    <div>
      <h1>Gestion des Clients</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Téléphone</label>
          <input
            type="text"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Adresse</label>
          <textarea
            type="text"
            name="adresse"
            rows="4" // Ajustez le nombre de lignes par défaut
            style={{ resize: 'both', overflow: 'auto' }} // Permet à l'utilisateur de redimensionner le champ
            value={formData.adresse}
            onChange={handleChange}
          />
        </div>

        <div>
          <h3>Informations du véhicule</h3>
          <label>Marque</label>
          <input
            type="text"
            name="vehicule.marque"
            value={formData.vehicule.marque}
            onChange={handleChange}
          />
          <label>Modèle</label>
          <input
            type="text"
            name="vehicule.modele"
            value={formData.vehicule.modele}
            onChange={handleChange}
          />
          <label>Immatriculation</label>
          <input
            type="text"
            name="vehicule.immatriculation"
            value={formData.vehicule.immatriculation}
            onChange={handleChange}
          />
          <label>Année de fabrication</label>
          <input
            type="text"
            name="vehicule.anneeFabrication"
            value={formData.vehicule.anneeFabrication}
            onChange={handleChange}
          />
          <label>Kilométrage</label>
          <input
            type="number"
            name="vehicule.kilometrage"
            value={formData.vehicule.kilometrage}
            onChange={handleChange}
          />
          <label>Date du dernier contrôle technique</label>
          <input
            type="date"
            name="vehicule.dateControleTechnique"
            value={formData.vehicule.dateControleTechnique}
            onChange={handleChange}
          />
        </div>

        <div>
          <h3>Devis</h3>
          <label>Numéro</label>
          <input
            type="text"
            name="devis.numero"
            value={formData.devis.numero}
            onChange={handleChange}
          />
          <label>Date</label>
          <input
            type="date"
            name="devis.date"
            value={formData.devis.date}
            onChange={handleChange}
          />
          <label>Montant total</label>
          <input
            type="number"
            name="devis.montantTotal"
            value={formData.devis.montantTotal}
            onChange={handleChange}
          />
          <label>Détails des travaux</label>
          <textarea
            name="devis.travaux"
            value={formData.devis.travaux}
            onChange={handleChange}
            rows="4" // Ajustez le nombre de lignes par défaut
            style={{ resize: 'both', overflow: 'auto' }} // Permet à l'utilisateur de redimensionner le champ
          />
          <label>État</label>
          <select
            name="devis.etat"
            value={formData.devis.etat}
            onChange={handleChange}
          >
            <option value="en attente">En attente</option>
            <option value="accepté">Accepté</option>
            <option value="refusé">Refusé</option>
          </select>
        </div>

        <div>
          <h3>Préférences</h3>
          <label>Contact</label>
          <select
            name="preferences.contact"
            value={formData.preferences.contact}
            onChange={handleChange}
          >
            <option value="email">Email</option>
            <option value="telephone">Téléphone</option>
            <option value="sms">SMS</option>
          </select>
          <label>Mode de paiement</label>
          <select
            name="preferences.paiement"
            value={formData.preferences.paiement}
            onChange={handleChange}
          >
            <option value="CB">CB</option>
            <option value="cheque">Chèque</option>
            <option value="especes">Espèces</option>
          </select>
        </div>

        <button type="submit">{editingClient ? 'Mettre à jour' : 'Ajouter Client'}</button>
      </form>

      <h2>Liste des Clients</h2>
      <ul>
        {clients.map((client) => (
          <li key={client._id}>
            <h3>{client.nom} {client.prenom}</h3>
            <p>Email: {client.email}</p>
            <p>Téléphone: {client.telephone}</p>
            <p>Adresse: {client.adresse}</p>
            <button onClick={() => handleEdit(client)}>Modifier</button>
            <button onClick={() => handleDelete(client._id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
