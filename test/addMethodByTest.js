const { assert } = require('chai');

const Sequelize = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  define: { timestamps: false }
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

    it('should add multiple methods on a single value when created and found', () => {

      function adminA() {}
      function adminB() {}

      const check = admin => {
        assert.equal(admin.methodA, adminA);
        assert.equal(admin.methodB, adminB);
      };

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['admin']
        }
      })
        .addMethodBy('role', 'methodA', { admin: adminA })
        .addMethodBy('role', 'methodB', { admin: adminB });

      return User
        .sync({ force: true })
        .then(() => User.create({ role: 'admin' }))
        .then(check)
        .then(() => User.findOne())
        .then(check);
    });

    it('should resolve the default method when no methods are provided', () => {

      function defaultA() {}

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['normal', 'admin']
        }
      })
        .addMethodBy('role', 'methodA', {}, defaultA);

      return User
        .sync({ force: true })
        .then(() => Sequelize.Promise.all([
          User.create({ role: 'normal' }),
          User.create({ role: 'admin' })
        ]))
        .then(([normal, admin]) => {
          assert.equal(normal.methodA, defaultA);
          assert.equal(admin.methodA, defaultA);
        });
    });

    it('should resolve the specific method before the default method', () => {

      function adminA() {}
      function defaultA() {}

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['normal', 'admin']
        }
      })
        .addMethodBy('role', 'methodA', { admin: adminA }, defaultA);

      return User
        .sync({ force: true })
        .then(() => Sequelize.Promise.all([
          User.create({ role: 'normal' }),
          User.create({ role: 'admin' })
        ]))
        .then(([normal, admin]) => {
          assert.equal(normal.methodA, defaultA);
          assert.equal(admin.methodA, adminA);
        });

    });

    it('should support multiple methods for multiple values', () => {

      function normalA() {}
      function adminA() {}

      function normalB() {}
      function adminB() {}

      const User = sequelize.define('user', {
        role: {
          type: Sequelize.ENUM,
          values: ['normal', 'admin']
        }
      })
        .addMethodBy('role', 'methodA', { normal: normalA, admin: adminA })
        .addMethodBy('role', 'methodB', { normal: normalB, admin: adminB });

      return User
        .sync({ force: true })
        .then(() => Sequelize.Promise.all([
          User.create({ role: 'normal' }),
          User.create({ role: 'admin' })
        ]))
        .then(([normal, admin]) => {

          assert.equal(normal.methodA, normalA);
          assert.equal(admin.methodA, adminA);

          assert.equal(normal.methodB, normalB);
          assert.equal(admin.methodB, adminB);
        });
    });

    it('should support adding methods by multiple properties', () => {

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
      })
        .addMethodBy('role', 'roleMethod', { admin: a, normal: n })
        .addMethodBy('age', 'ageMethod', { old: o, young: y });

      return User
        .sync({ force: true })
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
        });
    });
  });
});
