exports.up = function (knex) {
    return knex.schema.createTable('clients', table => {
        table.increments('id').primary(); // ID unique pour chaque client
        table.string('nom').notNullable(); // Nom du client
        table.string('prenom').notNullable(); // Prénom
        table.string('email'); // Email (optionnel)
        table.string('telephone'); // Numéro de téléphone
        table.text('description'); // Détails ou description du rendez-vous
        table.timestamp('created_at').defaultTo(knex.fn.now()); // Date de création
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('clients'); // Supprime la table si besoin
};

