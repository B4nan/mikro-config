'use strict';

const _get = require('lodash.get');
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
   * @param {String} configDir
   * @param {String} environment
   * @private
   */
  _buildConfig(configDir, environment) {
    // load default config file
    this.addOptions(configDir + '/default.js', true);

    // load additional config files
    if (fs.existsSync(configDir)) {
      const files = fs.readdirSync(configDir).filter(file => file.endsWith('.js') && !['default.js', 'local.js'].includes(file));
      files.forEach(file => this.addOptions(`${configDir}/${file}`));
    }

    // load _environment config
    this.addOptions(`${configDir}/env/${environment}.js`, true);

    // load local _environment config
    this.addOptions(`${configDir}/env/${environment}.local.js`, true);

    // load local config
    this.addOptions(`${configDir}/local.js`, true);

    // support `config.foo.bar` syntax (instead of `config.get('foo.bar')`)
    _merge(this, CONFIG);
  }

  /**
   * @param {Object|String} options or path to config file to merge (checks for existence synchronously)
   * @param {Boolean} [optional]
   */
  addOptions(options, optional = false) {
    if (typeof options === 'string') {
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

}

module.exports = new Config();
