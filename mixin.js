'use strict';

module.exports = { define: define };

/**
 * define Model.prototype.addMethodBy
 */
function define() {
  require('sequelize').Model.prototype.addMethodBy = addMethodBy;
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
 *     values: ['normal', 'admin']
 *   }
 * }).addMethodBy('role', 'destroyEverything', {
 *   normal: { function() { throw new Error('no, thanks.'); } },
 *   admin: { function() { console.log('sure.'); } }
 * });
 *
 * User
 *  .create({ role: 'admin' })
 *  .then(a => { a.destroyEverything(); });
 * // => sure.
 * ```
 *
 * @param {String} attributeName The attribute whose value determines which method to dispatch.
 * @param {String} methodName The name of the method to be added.
 * @param {Object} methods The different method implementations for each attribute value.
 */
function addMethodBy(attributeName, methodName, methods) {

  if (!(attributeName in this.attributes && 'values' in this.attributes[attributeName])) {
    throw new Error(`Model method ${methodName} must defined over an ENUM attribute`);
  }

  var values = new Set(this.attributes[attributeName].values);

  for (let value in methods) {
    values.delete(value);
  }

  if (values.size > 0) {
    const { inspect } = require('util');
    throw new Error(`Model method ${methodName} is missing an implementation for some attribute values: ${inspect(values)}`);
  }

  Object.defineProperty(this.Instance.prototype, methodName, {
    get: function () { return methods[this[attributeName]]; }
  });

  return this;
}
