"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
function numberingRule(options) {
    return (state) => {
        const env = (0, utils_1.getDocState)(state);
        env.references.forEach(ref => {
            const { label, tokens, contentFromTarget } = ref;
            const setError = (details, error) => {
                tokens.open.attrJoin("class", "error");
                tokens.open.tag = tokens.close.tag = "code";
                if (contentFromTarget && error) {
                    tokens.content.content = contentFromTarget(error);
                }
                else {
                    tokens.content.content = details;
                }
                return true;
            };
            const target = env.targets[label];
            if (!target)
                return setError(label, {
                    kind: ref.kind || "",
                    label,
                    title: label,
                    number: `"${label}"`
                });
            if (ref.kind && target.kind !== ref.kind) {
                return setError(`Reference "${label}" does not match kind "${ref.kind}"`);
            }
            tokens.open.attrSet("href", `#${target.label}`);
            if (target.title)
                tokens.open.attrSet("title", target.title);
            if (contentFromTarget)
                tokens.content.content = contentFromTarget(target).trim();
        });
        // TODO: Math that wasn't pre-numbered?
        return true;
    };
}
/**
 * Create a rule that runs at the end of a markdown-it parser to go through all
 * references and add their targets.
 *
 * This `Rule` is done *last*, as you may reference a figure/equation, when that `Target`
 * has not yet been created. The references call `resolveRefLater` when they are being
 * created and pass their tokens such that the content of those tokens can be
 * dynamically updated.
 *
 * @param options (none currently)
 * @returns The markdown-it Rule
 */
function statePlugin(md, options) {
    md.core.ruler.push("docutils_number", numberingRule(options));
}
exports.default = statePlugin;
//# sourceMappingURL=plugin.js.map