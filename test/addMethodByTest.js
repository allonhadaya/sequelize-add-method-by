const { assert } = require('chai');

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:'
});

describe('Model.prototype.addMethodBy', () => {

  describe('before being required', () => {

    it('should not exist', () => {

      const m = sequelize.define('m', {});
      assert.notProperty(m, 'addMethodBy');
    });
  });

  describe('after being required', () => {

    before(() => {
      require('../addMethodBy');
    });

    it('should exist', () => {

      const m = sequelize.define('m', {});
      assert.property(m, 'addMethodBy');
    });

    it('should support a single implementation', () => {

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['admin']
        }
      }).addMethodBy('role', 'methodA', {
        admin: function () {}
      }).addMethodBy('role', 'methodB', {
        admin: function () {}
      });

      return User.sync({ force: true })
        .then(() => User.create({ role: 'admin' }))
        .then(created => {
          assert.property(created, 'methodA');
          assert.property(created, 'methodB');
        })
        .then(() => User.findOne())
        .then(found => {
          assert.property(found, 'methodA');
          assert.property(found, 'methodB');
        });
    });

    it('should support multiple implementations', () => {

      function adminA() {}
      function adminB() {}
      function normalA() {}
      function normalB() {}

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['admin', 'normal']
        }
      }).addMethodBy('role', 'methodA', {
        admin: adminA,
        normal: normalA
      }).addMethodBy('role', 'methodB', {
        admin: adminB,
        normal: normalB
      });

      return User.sync({ force: true })
        .then(() => Sequelize.Promise.all([
          User.create({ role: 'admin' }),
          User.create({ role: 'normal' })
        ]))
        .then(([createdAdmin, createdNormal]) => {
          assert.equal(createdAdmin.methodA, adminA);
          assert.equal(createdAdmin.methodB, adminB);
          assert.equal(createdNormal.methodA, normalA);
          assert.equal(createdNormal.methodB, normalB);
        })
        .then(() => User.findAll({ orderBy: 'role' }))
        .then(([foundAdmin, foundNormal]) => {
          assert.equal(foundAdmin.methodA, adminA);
          assert.equal(foundAdmin.methodB, adminB);
          assert.equal(foundNormal.methodA, normalA);
          assert.equal(foundNormal.methodB, normalB);
        });
    });

    it('should support multiple attributes', () => {

      function a() {}
      function n() {}
      function o() {}
      function y() {}

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['admin', 'normal']
        },
        age: {
          type: Sequelize.ENUM,
          values: ['old', 'young']
        }
      }).addMethodBy('role', 'roleMethod', {
        admin: a,
        normal: n
      }).addMethodBy('age', 'ageMethod', {
        old: o,
        young: y
      });

      return User.sync({ force: true })
        .then(() => Sequelize.Promise.all([
          User.create({ role: 'admin', age: 'old' }),
          User.create({ role: 'admin', age: 'young' }),
          User.create({ role: 'normal', age: 'old' }),
          User.create({ role: 'normal', age: 'young' })
        ]))
        .then(([ao, ay, no, ny]) => {

          assert.equal(ao.roleMethod, a);
          assert.equal(ay.roleMethod, a);
          assert.equal(no.roleMethod, n);
          assert.equal(ny.roleMethod, n);

          assert.equal(ao.ageMethod, o);
          assert.equal(ay.ageMethod, y);
          assert.equal(no.ageMethod, o);
          assert.equal(ny.ageMethod, y);
        })
        // assuming finding works
    });
  });
});
