// For the migration, we are going to add encrypted_password
// and salt columns, then we are going to borrow the saltHashPassword
// method that we exported from store.js in order to migrate users
// already in the database. Finally, we will remove the password column.

const { saltHashPassword } = require('../store');

exports.up = async function up (knex) {
    await knex.schema.table('user', t => {
      t.string('salt').notNullable(); // create a salt column
      t.string('encrypted_password').notNullable(); // create encrypted_pass column
    })
    const users = await knex('user');
    await Promise.all(users.map(convertPassword));
    await knex.schema.table('user', t => {
      t.dropColumn('password'); // delete password column
    })

  function convertPassword (user) {
    const { salt, hash } = saltHashPassword(user.password);
    return knex('user')
      .where({ id: user.id }).update({
          salt,
          encrypted_password: hash
      })
  }
}
// Undo changes
exports.down = function down (knex) {
  return knex.schema.table('user', t => {
    t.dropColumn('salt')
    t.dropColumn('encrypted_password')
    t.string('password').notNullable()
  })
}
