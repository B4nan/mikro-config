import { get, set, has, merge } from 'lodash';
import { existsSync, readdirSync } from 'fs';

const CONFIG = {};

/**
 * Simple config helper, loads configuration in this order:
 *  - /config/default.js
 *  - /config/*.js (all files in config folder excluding local configs)
 *  - /config/env/$NODE_ENV.js
 *  - /config/env/$NODE_ENV.local.js
 *  - /config/local.js
 */
export class MikroConfig {

  [key: string]: any;

  constructor(private configDir: string = process.env.NODE_CONFIG_DIR || process.cwd() + '/config') {
    const env = this.getEnvironment();
    this.buildConfig(this.configDir, env);
  }

  get(key: string, defaultValue: any = undefined): any {
    return get(CONFIG, key, defaultValue);
  }

  has(key: string): boolean {
    return has(CONFIG, key);
  }

  /**
   * options can be either object or path to config file to merge (checks for existence synchronously)
   */
  addOptions(options: object | string, optional = false) {
    if (typeof options === 'string') {
      if (!options.endsWith('.js') && !options.endsWith('.json') && !options.endsWith('.ts')) {
        if (existsSync(options + '.json')) {
          options += '.json';
        } else if (existsSync(options + '.js')) {
          options += '.js';
        } else if (existsSync(options + '.ts')) {
          options += '.ts';
        } else {
          options += '.js';
        }
      }

      if (existsSync(options)) {
        options = require(options);
      } else if (optional) {
        options = {};
      } else {
        throw new Error(`Configuration file '${options}' not found!`);
      }
    }

    merge(CONFIG, options);
  }

  getEnvironment(): string {
    return process.env.NODE_ENV || 'development';
  }

  private buildConfig(configDir: string, environment: string) {
    // load default config file
    this.addOptions(configDir + '/default', true);

    // load additional config files
    if (existsSync(configDir)) {
      readdirSync(configDir)
        .filter((file: string) => {
          const isConfigFile = file.endsWith('.js') || (file.endsWith('.ts') && !file.endsWith('.d.ts')) || file.endsWith('.json');
          const isIgnored = ['default.js', 'default.json', 'local.js', 'local.json'].includes(file);

          return isConfigFile && !isIgnored;
        })
        .forEach((file: string) => this.addOptions(`${configDir}/${file}`));
    }

    // load environment config
    this.addOptions(`${configDir}/env/${environment}`, true);

    // load local environment config
    this.addOptions(`${configDir}/env/${environment}.local`, true);

    // load local config
    this.addOptions(`${configDir}/local`, true);

    // override with environment config
    this.addEnvOptions();

    // propagate referenced config values (e.g. `HttpClient($[backend.api])` => `HttpClient('https://api.io/...')`)
    this.propagateReferences(CONFIG);

    // support `config.foo.bar` syntax (instead of `config.get('foo.bar')`)
    merge(this, CONFIG);
  }

  private addEnvOptions() {
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
      _key = _key.replace(/___/g, '.');
      _key = _key.toLowerCase().replace(/_(\w)/g, (m, w) => w.toUpperCase());
      set(CONFIG, _key, process.env[key]);
    });
  }

  private propagateReferences(config: Options) {
    Object.keys(config).forEach(key => {
      const value = config[key];

      if (typeof value === 'string' && value.includes('$[')) {
        this.propagateSingleReference(config, key);
      } else if (typeof value === 'object' && value) {
        this.propagateReferences(value);
      }
    });
  }

  private propagateSingleReference(config: Options, key: string) {
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
      this.propagateSingleReference(config, key);
    }
  }

}

export interface Options {
  [key: string]: any;
}
