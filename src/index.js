import clone from 'lodash.clone';
import mergeWith from 'lodash.mergewith';
import uniq from 'lodash.uniq';

export default function mergeConfiguration(config, modifier, options) {
  options = {
    concat: true,
    dedup: true,
    ...options
  };
  config = clone(config);
  if (typeof modifier === 'function') return modifier(config);
  if (
    Array.isArray(config) || Array.isArray(modifier)
      ? Array.isArray(config) !== Array.isArray(modifier)
      : typeof config !== typeof modifier
  ) {
    throw new Error('config types must match');
  }

  if (Array.isArray(config)) {
    if (options.concat) {
      config = config.concat(modifier);
      if (options.dedup) return uniq(config);
      return config;
    }
    return modifier;
  }
  if (typeof config === 'object') {
    return mergeWith(config, modifier, (oldValue, newValue) => {
      if (options.concat && Array.isArray(oldValue)) {
        const value = oldValue.concat(newValue);
        if (options.dedup) return uniq(value);
        return value;
      }
      return newValue;
    });
  }
  return modifier;
}
