"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRefLater = exports.newTarget = exports.getNamespacedMeta = exports.getDocState = exports.TargetKind = void 0;
/** The kind of the target as a TargetKind enum ('fig', 'eq', etc.) */
var TargetKind;
(function (TargetKind) {
    TargetKind["equation"] = "eq";
    TargetKind["figure"] = "fig";
    TargetKind["table"] = "table";
    TargetKind["code"] = "code";
    TargetKind["section"] = "sec";
})(TargetKind = exports.TargetKind || (exports.TargetKind = {}));
/** Safely create the document state for docutils */
function getDocState(state) {
    var _a, _b;
    const env = (_b = (_a = state.env) === null || _a === void 0 ? void 0 : _a.docutils) !== null && _b !== void 0 ? _b : {};
    if (!env.targets)
        env.targets = {};
    if (!env.references)
        env.references = [];
    if (!env.numbering)
        env.numbering = {};
    if (!state.env.docutils)
        state.env.docutils = env;
    return env;
}
exports.getDocState = getDocState;
/**
 * Safely create a namespaced meta information on a token
 * @param token A markdown-it token that will contain the target
 * @returns An object containing a `Target`
 */
function getNamespacedMeta(token) {
    var _a, _b;
    const meta = (_b = (_a = token.meta) === null || _a === void 0 ? void 0 : _a.docutils) !== null && _b !== void 0 ? _b : {};
    if (!token.meta)
        token.meta = {};
    if (!token.meta.docutils)
        token.meta.docutils = meta;
    return meta;
}
exports.getNamespacedMeta = getNamespacedMeta;
/** Get the next number for an equation, figure, code or table
 *
 * Can input `{ docutils: { numbering: { eq: 100 } } }` to start counting at a different number.
 *
 * @param state MarkdownIt state that will be modified
 */
function nextNumber(state, kind) {
    const env = getDocState(state);
    if (env.numbering[kind] == null) {
        env.numbering[kind] = 1;
    }
    else {
        env.numbering[kind] += 1;
    }
    return env.numbering[kind];
}
/** Create a new internal target.
 *
 * @param state MarkdownIt state that will be modified
 * @param label The reference label that will be normalized and used to associate the target. Note some directives use "name".
 * @param kind The target kind: "eq", "code", "table" or "fig"
 */
function newTarget(state, token, kind, label, title, silent = false) {
    const env = getDocState(state);
    const number = nextNumber(state, kind);
    const target = {
        label,
        kind,
        number,
        title
    };
    if (!silent) {
        // Put the token in both the token.meta and the central environment
        const meta = getNamespacedMeta(token);
        meta.target = target;
        token.attrSet("id", label);
        // TODO: raise error on duplicates
        env.targets[label] = target;
    }
    return target;
}
exports.newTarget = newTarget;
/**
 * Resolve a reference **in-place** in a following numbering pass.
 *
 * @param state Reference to the state object
 * @param tokens The open/content/close tokens of the reference
 * @param name Name/label/identifier of the target
 * @param opts Includes the reference `kind` and an optional way to create the reference content
 */
function resolveRefLater(state, tokens, data, opts) {
    var _a;
    tokens.open.meta = (_a = tokens.open.meta) !== null && _a !== void 0 ? _a : {};
    tokens.open.meta.kind = data.kind;
    tokens.open.meta.label = data.label;
    tokens.open.meta.value = data.value;
    const env = getDocState(state);
    env.references.push(Object.assign({ label: data.label, tokens }, opts));
}
exports.resolveRefLater = resolveRefLater;
//# sourceMappingURL=utils.js.map