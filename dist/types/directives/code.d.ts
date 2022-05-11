/** Admonitions to visualise programming codes */
import type Token from "markdown-it/lib/token";
import { Directive, IDirectiveData } from "./main";
import { int } from "./options";
/** Mark up content of a code block
 *
 * Adapted from sphinx/directives/patches.py
 */
export declare class Code extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {
        /** Add line numbers, optionally starting from a particular number. */
        "number-lines": import("./options").OptionSpecConverter;
        /** Ignore minor errors on highlighting */
        force: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
        class: import("./options").OptionSpecConverter;
    };
    run(data: IDirectiveData<keyof Code["option_spec"]>): Token[];
}
/** Mark up content of a code block, with more settings
 *
 * Adapted from sphinx/directives/code.py
 */
export declare class CodeBlock extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {
        /** Add line numbers. */
        linenos: import("./options").OptionSpecConverter;
        /** Start line numbering from a particular value. */
        "lineno-start": typeof int;
        /** Strip indentation characters from the code block.
         * When number given, leading N characters are removed
         */
        dedent: import("./options").OptionSpecConverter;
        /** Emphasize particular lines (comma-separated numbers) */
        "emphasize-lines": import("./options").OptionSpecConverter;
        caption: import("./options").OptionSpecConverter;
        /** Ignore minor errors on highlighting */
        force: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
        class: import("./options").OptionSpecConverter;
    };
    run(data: IDirectiveData<keyof CodeBlock["option_spec"]>): Token[];
}
/** A code cell is a special MyST based cell, signifying executable code. */
export declare class CodeCell extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    rawOptions: boolean;
    run(data: IDirectiveData<keyof CodeCell["option_spec"]>): Token[];
}
export declare const code: {
    code: typeof Code;
    "code-block": typeof CodeBlock;
    "code-cell": typeof CodeCell;
};
