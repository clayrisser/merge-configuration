import mergeConf from '../src';

describe('mergeConf(config, modifier, { concat: true, dedup: true })', () => {
  it('should be a function', async () => {
    expect(typeof mergeConf).toBe('function');
  });
  it('should be cloned', async () => {
    const config = {};
    const merged = mergeConf(config, config => config);
    expect(config).not.toBe(merged);
  });
  it('should override when config types do not match', async () => {
    const merged = mergeConf({}, []);
    expect(merged).toEqual([]);
  });
  it('should concat and dedup arrays', async () => {
    expect(mergeConf([1, 2], [2, 3])).toEqual([1, 2, 3]);
  });
  it('should concat and dedup array properties', async () => {
    expect(mergeConf({ item: [1, 2] }, { item: [2, 3] })).toEqual({
      item: [1, 2, 3]
    });
  });
  it('should replace primatives', async () => {
    expect(mergeConf(1, 2)).toEqual(2);
    expect(mergeConf('one', 'two')).toEqual('two');
    expect(mergeConf(true, false)).toEqual(false);
  });
  it('should ignore undefined or null', async () => {
    expect(mergeConf(undefined, 'abc')).toEqual('abc');
    expect(mergeConf('abc', undefined)).toEqual('abc');
    expect(mergeConf(undefined, undefined)).toEqual(undefined);
    expect(mergeConf(null, undefined)).toEqual(null);
    expect(mergeConf(undefined, null)).toEqual(null);
    expect(mergeConf(null, 'abc')).toEqual('abc');
    expect(mergeConf('abc', null)).toEqual('abc');
    expect(mergeConf(null, null)).toEqual(null);
  });
  it('should preserve functions', async () => {
    const config = mergeConf(
      {
        hello: 'world'
      },
      {
        hello: () => 'texas'
      }
    );
    expect(typeof config.hello).toBe('function');
    expect(config.hello()).toBe('texas');
  });
  it('should support modifier functions on sublevels', async () => {
    const config = mergeConf(
      {
        hello: {
          world: 99
        }
      },
      {
        hello: {
          world: conf => ++conf
        }
      },
      {
        level: 2
      }
    );
    expect(typeof config.hello.world).toBe('number');
    expect(config.hello.world).toBe(100);
  });
  it('should pass config through modifier', async () => {
    const config = mergeConf({ hello: 'world' }, config => {
      config.howdy = 'texas';
      return config;
    });
    expect(config).toEqual({ hello: 'world', howdy: 'texas' });
  });
});

describe('mergeConf(config, modifier, { concat: true, dedup: true }, ...args)', () => {
  it('should pass additional args through modifier', async () => {
    const merged = mergeConf(
      { one: 1 },
      (config, ...args) => {
        config.two = 2;
        config = {
          ...config,
          ...args.reduce((args, arg, i) => {
            args[arg] = i + 3;
            return args;
          }, {})
        };
        return config;
      },
      {},
      'three',
      'four'
    );
    expect(merged).toEqual({ one: 1, two: 2, three: 3, four: 4 });
  });
});

describe('mergeConf(config, modifier, { concat: true, dedup: false })', () => {
  it('should concat and not dedup arrays', async () => {
    expect(mergeConf([1, 2], [2, 3], { dedup: false })).toEqual([1, 2, 2, 3]);
  });
  it('should concat and not dedup array properties', async () => {
    expect(
      mergeConf({ item: [1, 2] }, { item: [2, 3] }, { dedup: false })
    ).toEqual({
      item: [1, 2, 2, 3]
    });
  });
});

describe('mergeConf(config, modifier, { concat: false })', () => {
  it('should not concat arrays', async () => {
    expect(mergeConf([1, 2], [2, 3], { concat: false })).toEqual([2, 3]);
  });
  it('should not concat array properties', async () => {
    expect(
      mergeConf({ item: [1, 2] }, { item: [2, 3] }, { concat: false })
    ).toEqual({
      item: [2, 3]
    });
  });
});
