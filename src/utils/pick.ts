/**
 * Create an object composed of the picked object properties
 * @param {Record<string, any>} object - The source object
 * @param {string[]} keys - The keys to pick
 * @returns {Partial<Record<string, any>>} - The new object with picked properties
 */
// @ts-nocheck
const pick = <T extends Record<string, any>>(
  object: T,
  keys: string[],
): Partial<T> => {
  return keys.reduce((obj, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {} as Partial<T>);
};

export default pick;
