// up is used when migrate (create)
exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', function(t){
    t.increments('id').primary(); // auto increment ID
    t.string('email').notNullable(); // email
    t.string('password').notNullable(); // password
    t.string('phoneNum').notNullable(); // phoneNum
    t.string('name').notNullable(); // Full Name
    t.timestamps(false, true); // updated at and created at fields
  })
};

// down is used when we roll back (delete)
exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('user');
};
