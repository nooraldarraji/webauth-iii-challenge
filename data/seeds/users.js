
exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('users').del()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { id: 1, username: 'noor', password: 'notallowed' },
        { id: 2, username: 'notnoor', password: 'allowed' },
      ]);
    });
};
