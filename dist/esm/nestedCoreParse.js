/** Perform a nested parse upto and including a particular ruleName
 *
 * The main use for this function is to perform nested parses
 * upto but not including inline parsing.
 */
export function nestedCoreParse(md, pluginRuleName, src, 
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
env, initLine, includeRule = true) {
    // disable all core rules after pluginRuleName
    const tempDisabledCore = [];
    // TODO __rules__ is currently not exposed in typescript, but is the only way to get the rule names,
    // since md.core.ruler.getRules('') only returns the rule functions
    // we should upstream a getRuleNames() function or similar
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore TS2339
    for (const rule of [...md.core.ruler.__rules__].reverse()) {
        if (rule.name === pluginRuleName) {
            if (!includeRule) {
                tempDisabledCore.push(rule.name);
            }
            break;
        }
        if (rule.name) {
            tempDisabledCore.push(rule.name);
        }
    }
    md.core.ruler.disable(tempDisabledCore);
    let tokens = [];
    try {
        tokens = md.parse(src, env);
    }
    finally {
        md.core.ruler.enable(tempDisabledCore);
    }
    for (const token of tokens) {
        token.map =
            token.map !== null
                ? [token.map[0] + initLine, token.map[1] + initLine]
                : token.map;
    }
    return tokens;
}
//# sourceMappingURL=nestedCoreParse.js.map