// up is used when migrate (create)
exports.up = function(knex, Promise) {
    return knex.schema.createTable('user_posts', function(t){
      t.increments('id').primary(); // auto increment ID
      t.string('user_id').notNullable(); // user unique ID
      t.string('title').notNullable(); // title
      t.float('price').notNullable(); // price
      t.text('description').notNullable(); // description
      t.string('picture').notNullable(); // picture of item
      t.timestamps(false, true); // updated at and created at fields
    })
  };
  
  // down is used when we roll back (delete)
  exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('posts');
  };
  