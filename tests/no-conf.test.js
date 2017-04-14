'use strict';

test('no configuration', () => {
  const config = require('../mikro-config');
  expect(config).toEqual({});
});

test('get with no configuration', () => {
  const config = require('../mikro-config');
  expect(config.get('test')).toBeUndefined();
});

test('has with no configuration', () => {
  const config = require('../mikro-config');
  expect(config.has('test')).toBeFalsy();
});

test('adding configuration on the fly [object]', () => {
  const config = require('../mikro-config');
  expect(config).toEqual({});
  config.addOptions({repository: {type: 'git'}});
  expect(config.has('repository')).toBeTruthy();
  expect(config.has('repository.type')).toBeTruthy();
  expect(config.get('repository.type')).toBe('git');
  expect(config.has('repository.missing')).toBeFalsy();
  expect(config.get('repository.missing')).toBeUndefined();
});

test('adding configuration on the fly [JSON]', () => {
  const config = require('../mikro-config');
  expect(config).toEqual({});
  config.addOptions(__dirname + '/../package.json');
  expect(config.has('repository')).toBeTruthy();
  expect(config.has('repository.type')).toBeTruthy();
  expect(config.get('repository.type')).toBe('git');
  expect(config.has('repository.missing')).toBeFalsy();
  expect(config.get('repository.missing')).toBeUndefined();
});

test('environment getter', () => {
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
