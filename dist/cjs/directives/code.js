"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.code = exports.CodeCell = exports.CodeBlock = exports.Code = void 0;
const main_1 = require("./main");
const options_1 = require("./options");
// TODO add Highlight directive
/** Mark up content of a code block
 *
 * Adapted from sphinx/directives/patches.py
 */
class Code extends main_1.Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 1;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            /** Add line numbers, optionally starting from a particular number. */
            "number-lines": options_1.optional_int,
            /** Ignore minor errors on highlighting */
            force: options_1.flag,
            name: options_1.unchanged,
            class: options_1.class_option
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
exports.Code = Code;
/** Mark up content of a code block, with more settings
 *
 * Adapted from sphinx/directives/code.py
 */
class CodeBlock extends main_1.Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 0;
        this.optional_arguments = 1;
        this.final_argument_whitespace = false;
        this.has_content = true;
        this.option_spec = {
            /** Add line numbers. */
            linenos: options_1.flag,
            /** Start line numbering from a particular value. */
            "lineno-start": options_1.int,
            /** Strip indentation characters from the code block.
             * When number given, leading N characters are removed
             */
            dedent: options_1.optional_int,
            /** Emphasize particular lines (comma-separated numbers) */
            "emphasize-lines": options_1.unchanged_required,
            caption: options_1.unchanged_required,
            /** Ignore minor errors on highlighting */
            force: options_1.flag,
            name: options_1.unchanged,
            class: options_1.class_option
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
exports.CodeBlock = CodeBlock;
/** A code cell is a special MyST based cell, signifying executable code. */
class CodeCell extends main_1.Directive {
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
exports.CodeCell = CodeCell;
exports.code = {
    code: Code,
    "code-block": CodeBlock,
    "code-cell": CodeCell
};
//# sourceMappingURL=code.js.map