"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.math = exports.Math = void 0;
const utils_1 = require("../state/utils");
const main_1 = require("./main");
const options_1 = require("./options");
/** Math directive with a label
 */
class Math extends main_1.Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 0;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            label: options_1.unchanged
        };
    }
    run(data) {
        // TODO handle options
        this.assert_has_content(data);
        const token = this.createToken("math_block", "div", 0, {
            content: data.body,
            map: data.bodyMap,
            block: true
        });
        token.attrSet("class", "math block");
        if (data.options.label) {
            token.attrSet("id", data.options.label);
            const target = (0, utils_1.newTarget)(this.state, token, utils_1.TargetKind.equation, data.options.label, "");
            token.attrSet("number", `${target.number}`);
            token.info = data.options.label;
            token.meta = { label: data.options.label, numbered: true, number: target.number };
        }
        return [token];
    }
}
exports.Math = Math;
exports.math = {
    math: Math
};
//# sourceMappingURL=math.js.map