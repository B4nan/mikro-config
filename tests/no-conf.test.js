'use strict';

process.env.NODE_CONFIG_DIR = '';

describe('mikro-config [no conf]', () => {
  process.env.MIKRO_CONFIG_PREFIX = '';

  it('works with no configuration', () => {
    const config = require('../mikro-config');
    expect(config).toEqual({});
  });

  it('returns undefined when calling get with no configuration', () => {
    const config = require('../mikro-config');
    expect(config.get('test')).toBeUndefined();
  });

  it('returns false when calling has with no configuration', () => {
    const config = require('../mikro-config');
    expect(config.has('test')).toBeFalsy();
  });

  it('allows adding configuration on the fly [object]', () => {
    const config = require('../mikro-config');
    expect(config).toEqual({});
    config.addOptions({repository: {type: 'git'}});
    expect(config.has('repository')).toBeTruthy();
    expect(config.has('repository.type')).toBeTruthy();
    expect(config.get('repository.type')).toBe('git');
    expect(config.has('repository.missing')).toBeFalsy();
    expect(config.get('repository.missing')).toBeUndefined();
  });

  it('allows adding configuration on the fly [JSON]', () => {
    const config = require('../mikro-config');
    expect(config).toEqual({});
    expect(() => {
      config.addOptions(__dirname + '/not-exists.json');
    }).toThrow(`Configuration file '${__dirname}/not-exists.json' not found!`);
    config.addOptions(__dirname + '/../package.json');
    expect(config.has('repository')).toBeTruthy();
    expect(config.has('repository.type')).toBeTruthy();
    expect(config.get('repository.type')).toBe('git');
    expect(config.has('repository.missing')).toBeFalsy();
    expect(config.get('repository.missing')).toBeUndefined();
  });

  it('has environment getter', () => {
    process.env.NODE_ENV = '';
    const config1 = require('../mikro-config');
    expect(config1.getEnvironment()).toBe('development');

    process.env.NODE_ENV = 'development';
    const config2 = require('../mikro-config');
    expect(config2.getEnvironment()).toBe('development');

    process.env.NODE_ENV = 'test';
    const config3 = require('../mikro-config');
    expect(config3.getEnvironment()).toBe('test');

    process.env.NODE_ENV = 'production';
    const config4 = require('../mikro-config');
    expect(config4.getEnvironment()).toBe('production');
  });
});
