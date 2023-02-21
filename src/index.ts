import { workspaceRules } from "./resolve-workspace-rules";

/** 
 * Export eslint rules plugin: https://eslint.org/docs/latest/extend/plugins
 */
module.exports = {
    rules: {
        // Copy generated list of workspace rules
        ...workspaceRules,
    },
};
