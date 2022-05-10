/** Admonitions to visualise programming codes */
import type Token from "markdown-it/lib/token";
import { Directive, IDirectiveData } from "./main";
/** Math directive with a label
 */
export declare class Math extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {
        label: import("./options").OptionSpecConverter;
    };
    run(data: IDirectiveData<keyof Math["option_spec"]>): Token[];
}
export declare const math: {
    math: typeof Math;
};
