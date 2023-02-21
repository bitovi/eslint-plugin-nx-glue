# ESLint Plugin Nx Glue

Allows local ESLint Rules written in TypeScript or JavaScript to be available within Nx workspace. This means that developers can write their own ESLint Rules within a project and also use them for that project without having to publish those ESLint Rules or use Symlinks.

## Installation

```bash
npm install -D @bitovi/eslint-plugin-nx-glue
```

This library assumes you are using an [Nx workspace](https://nx.dev/). If you are not, you will have to also install `nx` as a dev-dependency:

```bash
npm install -D nx@15
```

## How to Use

Create an `eslint-plugin-nx-glue.config.js` file at the root of your project. This file will export all of your ESLint Plugins by name, a path to its exported rules, and which typescript configuration to use:

```js
// eslint-plugin-nx-glue.config.js

module.exports = {
  'my-plugin': {
    dir: 'tools/my-rules',// Required
    tsconfig: 'tsconfig.json',// Optional: default is tsconfig.json
  },
};
```

This example will check `tools/my-rules` for `index.ts` that exports an [ESLint Plugin](https://eslint.org/docs/latest/extend/plugins):

```ts
// tools/my-rules/index.ts

import { myCustomRule} from './rules/my-custom-rule';
import { mySecondCustomRule } from './rules/my-second-custom-rule';

module.exports = {
  rules: {
    'some-custom-rule-name': myCustomRule,
    'another-custom-rule-name': mySecondCustomRule,
  },
};
```

Now you can include these rules into your eslint configuration by adding `@bitovi/nx-glue` to your plugins and listing which rules you want to use within `overrides`:

```json
// .eslintrc

{
  "plugins": ["@bitovi/nx-glue"],
  "overrides": [
    {
      "files": ["*.ts"],
      "rules": {
        "@bitovi/nx-glue/my-plugin/some-custom-rule-name": "error",
        "@bitovi/nx-glue/my-plugin/another-custom-rule-name": "warn"
      }
    }
  ]
}
```

## eslint-plugin-glue Configuration Schema

Listed below is a detailed explaination of how the `eslint-plugin-glue` configuration schema affects how you can consume your custom rules:

```js
// eslint-plugin-nx-glue.config.js

module.exports = {
    '<plugin-name>': {
      dir: 'path to index.ts from root of project',// Required
      tsconfig: 'relative path from dir',// Optional: default is tsconfig.json
    },
    '<plugin-name-2>': {
      dir: 'path to index.ts from root of project',// Required
      tsconfig: 'relative path from dir',// Optional: default is tsconfig.json
    },
    // ...
};
```

`eslint-plugin-glue` configuration schema:

1. `plugin-name`: Used to distinguish each plugin. This allows for plugins to have the same named rules within the same project.
2. `dir`: Path to `index.ts` from root of project. This is the location of the exported ESLint Plugin.
3. `tsconfig`: Relative path from `dir` to typescript configuration. Defaults to `tsconfig.json` which would imply that the typescript configuration file lives inside the same directory as `index.ts`.

This allows you to consume your custom rules exported by your local ESLint Plugins:

```json
// .eslintrc

{
  "plugins": ["@bitovi/nx-glue"],
  "overrides": [
    {
      "files": ["..."],
      "rules": {
        "@bitovi/nx-glue/<plugin-name>/<custom-rule-name>": "...",
        "@bitovi/nx-glue/<plugin-name>/<custom-rule-name-2>": "...",
        "@bitovi/nx-glue/<plugin-name-2>/<another-custom-rule-name>": "...",
        // ...
      }
    }
  ]
}
```

## ESLint Extention

If you are using [VSCode's ESLint extention](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), you will have to restart your ESLint server whenever you make changes to your ESLint Plugin(s). You can quickly restart your ESLint server by using the [Command Palette](https://code.visualstudio.com/docs/getstarted/tips-and-tricks#_command-palette) and selecting `ESLint: Restart ESLint Server`.

## Overriding eslint-plugin-glue Configuration Path

You can set path to your `eslint-plugin-glue` configuration by setting `ESLINT_PLUGIN_GLUE_CONFIG_PATH` environment variable. By default, eslint-plugin-glue configuration is expected to be at the root of your project and to be named `eslint-plugin-glue.config.js`.
