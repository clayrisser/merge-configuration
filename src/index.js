import clone from 'lodash.clone';
import mergeWith from 'lodash.mergewith';
import uniq from 'lodash.uniq';

function pass(config, options, ...args) {
  if (typeof config === 'function' && !options._preserveFunctions) {
    return config(null, ...args);
  }
  return config;
}

export default function mergeConfiguration(config, modifier, options, ...args) {
  options = {
    concat: true,
    dedup: true,
    preserveFunctions: false,
    ...options
  };
  if (options.preserveFunctions) options._preserveFunctions = true;
  if (typeof config === 'undefined') return pass(modifier, options, ...args);
  if (typeof modifier === 'undefined') return pass(config, options, ...args);
  if (config === null) return pass(modifier, options, ...args);
  if (modifier === null) return pass(config, options, ...args);
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
    if (typeof config === 'function') {
      config = config(null, ...args);
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
