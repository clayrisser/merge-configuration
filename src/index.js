import clone from 'lodash.clone';
import mergeWith from 'lodash.mergewith';
import uniq from 'lodash.uniq';

export default function mergeConfiguration(config, modifier, options, ...args) {
  if (typeof config === 'undefined') return modifier;
  if (typeof modifier === 'undefined') return config;
  if (config === null) return modifier;
  if (modifier === null) return config;
  options = {
    concat: true,
    dedup: true,
    preserveFunctions: false,
    ...options
  };
  if (options.preserveFunctions) options._preserveFunctions = true;
  if (typeof config !== 'function') {
    config = clone(config);
  }
  if (typeof modifier === 'function') {
    if (options._preserveFunctions) {
      return (...args) => {
        let context = config;
        if (typeof config === 'function') {
          context = config(...args);
        }
        return mergeConfiguration(context, modifier(...args));
      };
    }
    return modifier(config, ...args);
  }
  if (
    Array.isArray(config) || Array.isArray(modifier)
      ? Array.isArray(config) !== Array.isArray(modifier)
      : typeof config !== typeof modifier
  ) {
    return modifier;
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
      options._preserveFunctions = true;
      return mergeConfiguration(oldValue, newValue, options, ...args);
    });
  }
  return modifier;
}
