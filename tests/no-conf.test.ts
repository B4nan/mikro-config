process.env.NODE_CONFIG_DIR = '';

import { MikroConfig } from '../lib';

describe('mikro-config [no conf]', () => {
  process.env.MIKRO_CONFIG_PREFIX = '';

  it('works with no configuration', () => {
    const config = new MikroConfig();
    expect(config).toMatchObject({});
  });

  it('returns undefined when calling get with no configuration', () => {
    const config = new MikroConfig();
    expect(config.get('test')).toBeUndefined();
  });

  it('returns false when calling has with no configuration', () => {
    const config = new MikroConfig();
    expect(config.has('test')).toBeFalsy();
  });

  it('allows adding configuration on the fly [object]', () => {
    const config = new MikroConfig();
    expect(config).toMatchObject({});
    config.addOptions({repository: {type: 'git'}});
    expect(config.has('repository')).toBeTruthy();
    expect(config.has('repository.type')).toBeTruthy();
    expect(config.get('repository.type')).toBe('git');
    expect(config.has('repository.missing')).toBeFalsy();
    expect(config.get('repository.missing')).toBeUndefined();
  });

  it('allows adding configuration on the fly [JSON]', () => {
    const config = new MikroConfig();
    expect(config).toMatchObject({});
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
    const config1 = new MikroConfig();
    expect(config1.getEnvironment()).toBe('development');

    process.env.NODE_ENV = 'development';
    const config2 = new MikroConfig();
    expect(config2.getEnvironment()).toBe('development');

    process.env.NODE_ENV = 'test';
    const config3 = new MikroConfig();
    expect(config3.getEnvironment()).toBe('test');

    process.env.NODE_ENV = 'production';
    const config4 = new MikroConfig();
    expect(config4.getEnvironment()).toBe('production');
  });
});
