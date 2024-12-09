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
    historique: [],
    vehicule: {
      marque: '',
      modele: '',
      immatriculation: '',
      anneeFabrication: '',
      kilometrage: '',
      dateControleTechnique: '',
    },
    devis: {
      numero: '',
      date: '',
      montantTotal: '',
      travaux: '',
      etat: 'en attente', // en attente, accepté, refusé
    },
    preferences: {
      contact: 'email', // email, téléphone, SMS
      paiement: 'CB', // CB, chèque, espèces
    },
  });

  const [editingClient, setEditingClient] = useState(null);
  const [file, setFile] = useState(null); // Ajouter l'état pour le fichier

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/clients')
      .then((response) => setClients(response.data))
      .catch((error) => console.error('Erreur de chargement :', error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [main, sub] = name.split('.');
      setFormData({
        ...formData,
        [main]: {
          ...formData[main],
          [sub]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload du fichier si sélectionné
    if (file) {
      const formDataFile = new FormData();
      formDataFile.append('file', file);

      try {
        const response = await axios.post('http://localhost:5000/api/upload', formDataFile, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Fichier téléchargé avec succès', response.data);
      } catch (error) {
        console.error('Erreur lors du téléchargement du fichier', error);
      }
    }

    // Ajout ou modification du client
    if (editingClient) {
      axios
        .put(`http://localhost:5000/api/clients/${editingClient.id}`, formData)
        .then((response) => {
          setClients(clients.map((client) =>
            client.id === editingClient.id ? response.data : client
          ));
          setEditingClient(null);
          setFormData({
            nom: '', prenom: '', email: '', telephone: '', adresse: '', historique: [],
            vehicule: { marque: '', modele: '', immatriculation: '', anneeFabrication: '', kilometrage: '', dateControleTechnique: '' },
            devis: { numero: '', date: '', montantTotal: '', travaux: '', etat: 'en attente' },
            preferences: { contact: 'email', paiement: 'CB' },
          });
        })
        .catch((error) => alert('Erreur lors de la modification :', error));
    } else {
      axios
        .post('http://localhost:5000/api/clients', formData)
        .then((response) => {
          setClients([...clients, { ...formData, id: response.data.id || Date.now() }]);
          setFormData({
            nom: '', prenom: '', email: '', telephone: '', adresse: '', historique: [],
            vehicule: { marque: '', modele: '', immatriculation: '', anneeFabrication: '', kilometrage: '', dateControleTechnique: '' },
            devis: { numero: '', date: '', montantTotal: '', travaux: '', etat: 'en attente' },
            preferences: { contact: 'email', paiement: 'CB' },
          });
        })
        .catch((error) => alert('Erreur lors de l’ajout :', error));
    }
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:5000/api/clients/${id}`)
      .then(() => setClients(clients.filter((client) => client.id !== id)))
      .catch((error) => alert('Erreur lors de la suppression :', error));
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setFormData(client);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestion des Clients</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <label>Nom :</label>
          <input type="text" name="nom" value={formData.nom} onChange={handleChange} required />
        </div>
        <div>
          <label>Prénom :</label>
          <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required />
        </div>
        <div>
          <label>Email :</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label>Téléphone :</label>
          <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} />
        </div>
        <div>
          <label>Adresse Postale :</label>
          <input type="text" name="adresse" value={formData.adresse} onChange={handleChange} />
        </div>
        <div>
          <h3>Informations Véhicule</h3>
          <label>Marque :</label>
          <input type="text" name="vehicule.marque" value={formData.vehicule.marque} onChange={handleChange} />
          <label>Modèle :</label>
          <input type="text" name="vehicule.modele" value={formData.vehicule.modele} onChange={handleChange} />
          <label>Immatriculation :</label>
          <input type="text" name="vehicule.immatriculation" value={formData.vehicule.immatriculation} onChange={handleChange} />
          <label>Année de Fabrication :</label>
          <input type="number" name="vehicule.anneeFabrication" value={formData.vehicule.anneeFabrication} onChange={handleChange} />
          <label>Kilométrage :</label>
          <input type="number" name="vehicule.kilometrage" value={formData.vehicule.kilometrage} onChange={handleChange} />
          <label>Date du dernier contrôle technique :</label>
          <input type="date" name="vehicule.dateControleTechnique" value={formData.vehicule.dateControleTechnique} onChange={handleChange} />
        </div>
        <div>
          <h3>Devis</h3>
          <label>Numéro :</label>
          <input type="text" name="devis.numero" value={formData.devis.numero} onChange={handleChange} />
          <label>Date :</label>
          <input type="date" name="devis.date" value={formData.devis.date} onChange={handleChange} />
          <label>Montant Total :</label>
          <input type="number" name="devis.montantTotal" value={formData.devis.montantTotal} onChange={handleChange} />
          <label>Travaux :</label>
          <textarea name="devis.travaux" value={formData.devis.travaux} onChange={handleChange}></textarea>
          <label>État :</label>
          <select name="devis.etat" value={formData.devis.etat} onChange={handleChange}>
            <option value="en attente">En attente</option>
            <option value="accepté">Accepté</option>
            <option value="refusé">Refusé</option>
          </select>
        </div>
        <div>
          <h3>Ajouter un fichier :</h3>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">{editingClient ? 'Modifier le client' : 'Ajouter un client'}</button>
        {editingClient && (
          <button type="button" onClick={() => setEditingClient(null)}>Annuler</button>
        )}
      </form>
      <h2>Liste des Clients</h2>
      <ul>
        {clients.map((client) => (
          <li key={client.id}>
            <strong>{client.nom} {client.prenom}</strong> - {client.email} - {client.telephone}
            <p>{client.adresse}</p>
            <h4>Véhicule :</h4>
            <p>{client.vehicule.marque} - {client.vehicule.modele} - {client.vehicule.immatriculation}</p>
            <button onClick={() => handleEdit(client)}>Modifier</button>
            <button onClick={() => handleDelete(client.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
