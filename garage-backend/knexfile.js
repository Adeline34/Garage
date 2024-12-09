module.exports = {
    development: {
      client: 'sqlite3',
      connection: {
        filename: './data/garage.sqlite3', // Le fichier qui contiendra la base de données
      },
      useNullAsDefault: true, // Nécessaire pour SQLite
    },
  };
  