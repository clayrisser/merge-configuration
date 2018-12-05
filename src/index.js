import clone from 'lodash.clone';
import mergeWith from 'lodash.mergewith';
import uniq from 'lodash.uniq';

export default function mergeConfiguration(config, modifier, options, ...args) {
  options = {
    _level: 0,
    concat: true,
    dedup: true,
    level: 0,
    preserveFunctions: false,
    ...options
  };
  if (typeof config === 'undefined') return modifier;
  if (typeof modifier === 'undefined') return config;
  if (config === null) return modifier;
  if (modifier === null) return config;
  config = clone(config);
  if (typeof modifier === 'function') {
    if (options._level > options.level) return modifier;
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
      return mergeConfiguration(
        oldValue,
        newValue,
        {
          ...options,
          _level: ++options._level
        },
        ...args
      );
    });
  }
  return modifier;
}
