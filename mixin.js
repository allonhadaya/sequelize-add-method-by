'use strict';

module.exports = { define: define };

/**
 * define Model.prototype.mixin
 */
function define() {
  require('sequelize').Model.prototype.mixin = mixin;
}

/**
 * instances of the model will receive additional methods
 *
 * ```js
 * require('sequelize-mixins').define();
 *
 * const User = sequelize.define('user', {
 *   role: {
 *     type: Sequelize.ENUM,
 *     values: ['admin', 'normal']
 *   }
 * }).mixin('role', {
 *   admin: { destroyEverything() { console.log('sure.'); } },
 *   normal: { destroyEverything() { throw new Error('no, thanks.'); } }
 * });
 *
 * User
 *  .create({ role: 'admin' })
 *  .then(a => { a.destroyEverything(); });
 *
 * // => sure.
 *
 * ```
 *
 * @param {String} attribute The attribute whose value determines which mixin to inherit.
 * @param {Object} mixins The different method implementations. Each property should be an object with the same methods.
 */
function mixin(attribute, mixins) {

  validateMixin(this, attribute, mixins);

  this.beforeCreate(extendOneOrMany);
  this.afterFind(extendOneOrMany);
  return this;

  function extendOneOrMany(instance) {
    if (Array.isArray(instance)) {
      instance.forEach(extendOne);
    } else {
      extendOne(instance);
    }
  }

  function extendOne(instance) {
    Object.assign(instance, mixins[instance[attribute]]);
  }
}

function validateMixin(model, attribute, mixins) {

  if (!(attribute in model.attributes)) {
    throw new Error('Mixin attribute must be defined on the model: ' + attribute);
  }

  var type = model.attributes[attribute];

  if (!('values' in type)) {
    throw new Error('Mixin attribute must be an ENUM with values');
  }

  var values = type.values;

  if (!(values.every(function (v) { return v in mixins; }))) {
    throw new Error('Mixins must be provided for each ENUM value: ' + values);
  }

  var value;
  var method;

  var methodCount = {};
  for (value in mixins) {
    for (method in mixins[value]) {
      methodCount[method] = (methodCount[method] || 0) + 1;
    }
  }

  for (method in methodCount) {
    if (methodCount[method] !== values.length) {
      throw new Error('Mixin methods must be defined consistently for each ENUM value.');
    }
  }
}
