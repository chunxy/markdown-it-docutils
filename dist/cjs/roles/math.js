"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.math = exports.inlineMathRenderer = exports.Math = void 0;
const main_1 = require("./main");
const INLINE_MATH_RULE = "math_inline";
class Math extends main_1.Role {
    run(data) {
        const inline = new this.state.Token(INLINE_MATH_RULE, "span", 0);
        inline.attrSet("class", "math inline");
        inline.markup = "$";
        inline.content = data.content;
        return [inline];
    }
}
exports.Math = Math;
function inlineMathRenderer(md, options) {
    var _a;
    // Only create the renderer if it does not exist
    // For example, this may be defined in markdown-it-dollarmath
    if (!((_a = options === null || options === void 0 ? void 0 : options.roles) === null || _a === void 0 ? void 0 : _a.math) || md.renderer.rules[INLINE_MATH_RULE])
        return;
    md.renderer.rules[INLINE_MATH_RULE] = (tokens, idx) => {
        var _a, _b, _c;
        const renderer = (_c = (_b = (_a = options === null || options === void 0 ? void 0 : options.opts) === null || _a === void 0 ? void 0 : _a.math) === null || _b === void 0 ? void 0 : _b.renderer) !== null && _c !== void 0 ? _c : (c => md.utils.escapeHtml(c));
        const token = tokens[idx];
        const content = token.content.trim();
        const math = renderer(content, { displayMode: false });
        return `<span class="${token.attrGet("class")}">${math}</span>`;
    };
}
exports.inlineMathRenderer = inlineMathRenderer;
exports.math = {
    math: Math
};
//# sourceMappingURL=math.js.map