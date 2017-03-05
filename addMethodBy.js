'use strict';

require('sequelize').Model.prototype.addMethodBy = addMethodBy;

/**
 * Instances of the model will receive a new method, dispatched depending on the value of a specified property.
 *
 * ```js
 * const User = sequelize.define('user', {
 *   role: {
 *     type: Sequelize.ENUM,
 *     values: ['normal', 'moderator', 'admin']
 *   }
 * })
 * .addMethodBy('role', 'destroyEverything',
 *   {
 *     admin () { console.log('sure.'); }
 *   },
 *   function () { throw new Error('no, thanks.'); });
 *
 * User
 *  .create({ role: 'admin' })
 *  .then(a => { a.destroyEverything(); });
 * // => sure.
 * ```
 *
 * @method addMethodBy
 * @memberof Model
 * @param {String} propertyName The property whose value determines which method to dispatch.
 * @param {String} methodName The name of the method to be added.
 * @param {Object} methods The different method implementations for each attribute value.
 * @param {Function} [defaultMethod] The method to dispatch in case the property has a value not defined by methods.
 */
function addMethodBy(propertyName, methodName, methods, defaultMethod) {

  Object.defineProperty(
    this.Instance.prototype,
    methodName, {
      get: function () { return methods[this[propertyName]] || defaultMethod; }
    });

  return this;
}
