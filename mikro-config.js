'use strict';

const _get = require('lodash.get');
const _set = require('lodash.set');
const _has = require('lodash.has');
const _merge = require('lodash.merge');
const fs = require('fs');

const CONFIG_DIR = process.env.NODE_CONFIG_DIR || process.cwd() + '/config';
const CONFIG = {};

/**
 * Simple config helper, loads configuration in this order:
 *  - /config/default.js
 *  - /config/*.js (all files in config folder excluding local configs)
 *  - /config/env/$NODE_ENV.js
 *  - /config/env/$NODE_ENV.local.js
 *  - /config/local.js
 */
class Config {

  constructor() {
    const env = this.getEnvironment();
    this._buildConfig(CONFIG_DIR, env);
  }

  /**
   * @param {String} key
   * @param {*} [defaultValue]
   * @return {*}
   */
  get(key, defaultValue = undefined) {
    return _get(CONFIG, key, defaultValue);
  }

  /**
   * @param {String} key
   * @return {Boolean}
   */
  has(key) {
    return _has(CONFIG, key);
  }

  /**
   * @param {Object|String} options or path to config file to merge (checks for existence synchronously)
   * @param {Boolean} [optional]
   */
  addOptions(options, optional = false) {
    if (typeof options === 'string') {
      if (!options.endsWith('.js') && !options.endsWith('.json')) {
        if (fs.existsSync(options + '.json')) {
          options += '.json';
        } else {
          options += '.js';
        }
      }

      if (fs.existsSync(options)) {
        options = require(options);
      } else if (optional) {
        options = {};
      } else {
        throw new Error(`Configuration file '${options}' not found!`);
      }
    }

    _merge(CONFIG, options);
  }

  /**
   * @return {String}
   */
  getEnvironment() {
    return process.env.NODE_ENV || 'development';
  }

  /**
   * @param {String} configDir
   * @param {String} environment
   * @private
   */
  _buildConfig(configDir, environment) {
    // load default config file
    this.addOptions(configDir + '/default', true);

    // load additional config files
    if (fs.existsSync(configDir)) {
      const filter = file => {
        const isConfigFile = file.endsWith('.js') || file.endsWith('.json');
        const isIgnored = ['default.js', 'default.json', 'local.js', 'local.json'].includes(file);
        return isConfigFile && !isIgnored;
      };
      const files = fs.readdirSync(configDir).filter(filter);
      files.forEach(file => this.addOptions(`${configDir}/${file}`));
    }

    // load _environment config
    this.addOptions(`${configDir}/env/${environment}`, true);

    // load local _environment config
    this.addOptions(`${configDir}/env/${environment}.local`, true);

    // load local config
    this.addOptions(`${configDir}/local`, true);

    // override with environment config
    this._addEnvOptions();

    // propagate referenced config values (e.g. `HttpClient($[backend.api])` => `HttpClient('https://api.io/...')`)
    this._propagateReferences(CONFIG);

    // support `config.foo.bar` syntax (instead of `config.get('foo.bar')`)
    _merge(this, CONFIG);
  }

  /**
   * @private
   */
  _addEnvOptions() {
    if (!process.env.MIKRO_CONFIG_PREFIX) {
      return;
    }

    const prefix = process.env.MIKRO_CONFIG_PREFIX;

    Object.keys(process.env).forEach(key => {
      if (!key.startsWith(prefix)) {
        return;
      }

      // convert PREFIX_VAR_NAME to varName
      let _key = key.substr(prefix.length);
      _key = _key.replace('___', '.');
      _key = _key.toLowerCase().replace(/_(\w)/g, (m, w) => w.toUpperCase());
      _set(CONFIG, _key, process.env[key]);
    });
  }

  /**
   * @param {Object} config
   * @private
   */
  _propagateReferences(config) {
    Object.keys(config).forEach(key => {
      const value = config[key];
      if (typeof value === 'string' && value.includes('$[')) {
        this._propagateSingleReference(config, key);
      } else if (typeof value === 'object') {
        this._propagateReferences(value);
      }
    });
  }

  /**
   * @param {Object} config
   * @param {String} key
   * @private
   */
  _propagateSingleReference(config, key) {
    const value = config[key];
    const referencedProperty = config[key].match(/\$\[([\w.]+)]/)[1];
    let newValue = this.get(referencedProperty);

    // value is `$[...]`
    if (value.match(/^\$\[(.*)]$/)) {
      return config[key] = newValue;
    }

    // value is part of string (e.g. `ServiceName($[...])`)
    // wrap string values in apostrophes
    if (typeof newValue === 'string') {
      newValue = `'${newValue}'`;
    }

    config[key] = value.replace(/\$\[([\w.]+)]/, newValue);

    if (config[key].match(/\$\[([\w.]+)]/)) {
      this._propagateSingleReference(config, key);
    }
  }

}

module.exports = new Config();
