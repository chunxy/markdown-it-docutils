import { Directive } from "./main";
import { class_option, flag, int, optional_int, unchanged, unchanged_required } from "./options";
// TODO add Highlight directive
/** Mark up content of a code block
 *
 * Adapted from sphinx/directives/patches.py
 */
export class Code extends Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 1;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            /** Add line numbers, optionally starting from a particular number. */
            "number-lines": optional_int,
            /** Ignore minor errors on highlighting */
            force: flag,
            name: unchanged,
            class: class_option
        };
    }
    run(data) {
        // TODO handle options
        this.assert_has_content(data);
        const token = this.createToken("fence", "code", 0, {
            // TODO if not specified, the language should come from a central configuration "highlight_language"
            info: data.args ? data.args[0] : "",
            content: data.body,
            map: data.bodyMap
        });
        return [token];
    }
}
/** Mark up content of a code block, with more settings
 *
 * Adapted from sphinx/directives/code.py
 */
export class CodeBlock extends Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 1;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            /** Add line numbers. */
            linenos: flag,
            /** Start line numbering from a particular value. */
            "lineno-start": int,
            /** Strip indentation characters from the code block.
             * When number given, leading N characters are removed
             */
            dedent: optional_int,
            /** Emphasize particular lines (comma-separated numbers) */
            "emphasize-lines": unchanged_required,
            caption: unchanged_required,
            /** Ignore minor errors on highlighting */
            force: flag,
            name: unchanged,
            class: class_option
        };
    }
    run(data) {
        // TODO handle options
        this.assert_has_content(data);
        const token = this.createToken("fence", "code", 0, {
            // TODO if not specified, the language should come from a central configuration "highlight_language"
            info: data.args ? data.args[0] : "",
            content: data.body,
            map: data.bodyMap
        });
        return [token];
    }
}
/** A code cell is a special MyST based cell, signifying executable code. */
export class CodeCell extends Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 1;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.rawOptions = true;
    }
    run(data) {
        // TODO store options and the fact that this is a code cell rather than a fence?
        const token = this.createToken("fence", "code", 0, {
            info: data.args ? data.args[0] : "",
            content: data.body,
            map: data.bodyMap
        });
        return [token];
    }
}
export const code = {
    code: Code,
    "code-block": CodeBlock,
    "code-cell": CodeCell
};
//# sourceMappingURL=code.js.map