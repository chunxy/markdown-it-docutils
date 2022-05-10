/** Directives for creating admonitions, also known as call-outs,
 * for including side content without significantly interrupting the document flow.
 */
import type Token from "markdown-it/lib/token";
import { Directive, IDirectiveData } from "./main";
/** Directives for admonition boxes.
 *
 * Apdapted from: docutils/docutils/parsers/rst/directives/admonitions.py
 */
declare class BaseAdmonition extends Directive {
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {
        class: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
    };
    title: string;
    run(data: IDirectiveData<keyof BaseAdmonition["option_spec"]>): Token[];
}
export declare class Admonition extends BaseAdmonition {
    required_arguments: number;
}
export declare class Attention extends BaseAdmonition {
    title: string;
}
export declare class Caution extends BaseAdmonition {
    title: string;
}
export declare class Danger extends BaseAdmonition {
    title: string;
}
export declare class Error extends BaseAdmonition {
    title: string;
}
export declare class Important extends BaseAdmonition {
    title: string;
}
export declare class Hint extends BaseAdmonition {
    title: string;
}
export declare class Note extends BaseAdmonition {
    title: string;
}
export declare class SeeAlso extends BaseAdmonition {
    title: string;
}
export declare class Tip extends BaseAdmonition {
    title: string;
}
export declare class Warning extends BaseAdmonition {
    title: string;
}
export declare const admonitions: {
    admonition: typeof Admonition;
    attention: typeof Attention;
    caution: typeof Caution;
    danger: typeof Danger;
    error: typeof Error;
    important: typeof Important;
    hint: typeof Hint;
    note: typeof Note;
    seealso: typeof SeeAlso;
    tip: typeof Tip;
    warning: typeof Warning;
};
export {};
