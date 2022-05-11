import { newTarget, TargetKind } from "../state/utils";
import { Directive } from "./main";
import { unchanged } from "./options";
/** Math directive with a label
 */
export class Math extends Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 0;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            label: unchanged
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
            const target = newTarget(this.state, token, TargetKind.equation, data.options.label, "");
            token.attrSet("number", `${target.number}`);
            token.info = data.options.label;
            token.meta = { label: data.options.label, numbered: true, number: target.number };
        }
        return [token];
    }
}
export const math = {
    math: Math
};
//# sourceMappingURL=math.js.map