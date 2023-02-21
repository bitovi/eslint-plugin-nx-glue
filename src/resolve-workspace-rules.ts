import type { TSESLint } from '@typescript-eslint/utils';
import { existsSync } from 'fs';
import { join } from 'path';
import { workspaceRoot } from 'nx/src/utils/workspace-root';
import { registerTsProject } from 'nx/src/utils/register';

type ESLintRules = Record<string, TSESLint.RuleModule<string, unknown[]>>;

interface Config {
  dir: string,
  tsconfig: string,
}

/**
 * Implementation is heavily inspired by [nx's implementation](https://github.com/nrwl/nx/blob/master/packages/eslint-plugin-nx/src/resolve-workspace-rules.ts).
 * 
 * Instead of having a static directory and workspace name, all plugins are referenced through a config file:
 * 
 * 1. WORKSPACE_PLUGIN_DIR is the keys in `config`
 * 2. WORKSPACE_RULE_NAMESPACE is the values in `config`
 */
export const workspaceRules = ((): ESLintRules => {
  const configPath = getConfigPath();
  const config: Record<string, Config> = require(configPath);

  const namespacedRules: ESLintRules = {};

  // Get all plugin names and rules folder paths
  Object.entries(config).forEach(([pluginName, pluginConfig]) => {
    const { dir, tsconfig } = pluginConfig;
    
    // If rules folder doesn't exist, there is no point trying to register and load it
    if (!existsSync(dir)) {
      return;
    }

    // // Register plugin for TS transpilation
    const registrationCleanup = registerTsProject(dir, tsconfig);

    try {
      /**
       * Currently we only support applying the rules from the user's workspace plugin object
       * (i.e. not other things that plugings can expose like configs, processors etc)
       */
      const { rules } = require(dir);

      for (const [ruleName, ruleConfig] of Object.entries(rules as ESLintRules)) {
        namespacedRules[`${pluginName}/${ruleName}`] = ruleConfig;
      }
    } catch (err) {
      /* silently handle error */
    } finally {
      registrationCleanup?.();
    }
  });

  return namespacedRules;
})();

/**
 * Get config path. Config path is set by `ESLINT_PLUGIN_GLUE_CONFIG_PATH`
 * environment and defaults to `eslint-plugin-glue.config.js`
 * at the root of nx workspace.
 */
function getConfigPath() {
  return process.env.ESLINT_PLUGIN_GLUE_CONFIG_PATH || join(workspaceRoot, 'eslint-plugin-glue.config.js');
}
