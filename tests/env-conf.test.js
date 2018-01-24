'use strict';

process.env.NODE_CONFIG_DIR = __dirname + '/js-conf';

describe('mikro-config [js conf + ENV]', () => {
  process.env.MIKRO_CONFIG_PREFIX = 'MY_TEST_APP_';
  process.env.MY_TEST_APP_KEY1 = 'value2';
  process.env.MY_TEST_APP_KEY5___SUB_KEY3 = 'false';

  it('has `get` method', () => {
    const config = require('../mikro-config');
    expect(config.get('key1')).toBe('value2');
    expect(config.get('key2')).toBe(123);
    expect(config.get('key3')).toBe(false);
    expect(config.get('key4')).toBe(true);
    expect(config.get('key5')).toBeInstanceOf(Object);
    expect(config.get('key5.subKey1')).toBe(1);
    expect(config.get('key5.subKey2')).toBe('2');
    expect(config.get('key5.subKey3')).toBe('false');
    expect(config.get('key5.subKey4')).toBe(true);
    expect(config.get('routes')).toBeInstanceOf(Object);
    expect(config.get('routes.route1')).toBe('path1');
    expect(config.get('routes.route2')).toBe('path2');
    expect(config.get('routes.route3')).toBe(1);
    expect(config.get('routes.route4')).toBe('false');
    expect(config.get('routes.route5')).toBe(`ServiceName('false')`);
    expect(config.get('routes.route6')).toBe(`ServiceName(1)`);
    expect(config.get('routes.route7')).toBe(`ServiceName('false', 1)`);
    expect(config.get('routes.route8')).toBe(`ServiceName('false', 1, 'test', 456)`);
  });

  it('has direct property getter', () => {
    const config = require('../mikro-config');
    expect(config.key1).toBe('value2');
    expect(config.key2).toBe(123);
    expect(config.key3).toBe(false);
    expect(config.key4).toBe(true);
    expect(config.key5).toBeInstanceOf(Object);
    expect(config.key5.subKey1).toBe(1);
    expect(config.key5.subKey2).toBe('2');
    expect(config.key5.subKey3).toBe('false');
    expect(config.key5.subKey4).toBe(true);
  });

  it('has `has` method', () => {
    const config = require('../mikro-config');
    expect(config.has('key1')).toBe(true);
    expect(config.has('key2')).toBe(true);
    expect(config.has('key3')).toBe(true);
    expect(config.has('key4')).toBe(true);
    expect(config.has('key5')).toBe(true);
    expect(config.has('key6')).toBe(false);
    expect(config.has('key5.subKey1')).toBe(true);
    expect(config.has('key5.subKey2')).toBe(true);
    expect(config.has('key5.subKey3')).toBe(true);
    expect(config.has('key5.subKey4')).toBe(true);
    expect(config.has('key5.subKey5')).toBe(false);
  });
});
