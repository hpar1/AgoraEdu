// up is used when migrate (create)
exports.up = function(knex, Promise) {
    return knex.schema.createTable('wishlist', function(t){
      t.increments('id').primary(); // auto increment ID
      t.string('title').notNullable(); // title
      t.string('phoneNum').notNullable(); // phone number list
      t.timestamps(false, true); // "updated at" and "created at" fields
    })
  };
  
  // down is used when we roll back (delete)
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('wishlist');
  };
  