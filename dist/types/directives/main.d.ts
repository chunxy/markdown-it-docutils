/** Convert a directives first line and content to its structural components
 *
 * The code is adapted from: myst_parser/parse_directives.py
 * and is common for all directives
 */
import type StateCore from "markdown-it/lib/rules_core/state_core";
import type Token from "markdown-it/lib/token";
import { OptionSpecConverter } from "./options";
/** token specification for a directive */
export declare class DirectiveToken implements Token {
    type: string;
    tag: string;
    attrs: null;
    nesting: 0 | 1 | -1;
    level: number;
    children: null;
    markup: string;
    block: boolean;
    hidden: boolean;
    info: string;
    meta: {
        arg: string;
    };
    content: string;
    map: [number, number];
    constructor(name: string, arg: string, content: string, map: [number, number]);
    attrIndex(name: string): number;
    attrPush(attrData: [string, string]): void;
    attrSet(name: string, value: string): void;
    attrGet(name: string): null;
    attrJoin(name: string, value: string): void;
}
/** Data required to parse a directive first line and content to its structure */
export interface IDirectiveSpec {
    /** number of required arguments */
    required_arguments?: number;
    /** number of optional arguments */
    optional_arguments?: number;
    /** indicating if the final argument may contain whitespace */
    final_argument_whitespace?: boolean;
    /** if body content is allowed */
    has_content?: boolean;
    /** mapping known option names to conversion functions */
    option_spec?: Record<string, OptionSpecConverter>;
    /** If true, do not attempt to validate/convert options. */
    rawOptions?: boolean;
}
/** A class to define a single directive */
export declare class Directive implements IDirectiveSpec {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    has_content: boolean;
    option_spec: {};
    rawOptions: boolean;
    state: StateCore;
    constructor(state: StateCore);
    /** Convert the directive data to tokens */
    run(data: IDirectiveData): Token[];
    assert(test: boolean, msg: string): void;
    /** throw error is no body content parsed. */
    assert_has_content(data: IDirectiveData): void;
    /** Create a single token */
    createToken(type: string, tag: string, nesting: Token.Nesting, optional?: {
        content?: string;
        level?: number;
        map?: null | [number, number];
        meta?: any;
        info?: string;
        block?: boolean;
        children?: Token[];
    }): Token;
    /** parse block of text to tokens (does not run inline parse) */
    nestedParse(block: string, initLine: number): Token[];
}
/** Data structure of a directive */
export interface IDirectiveData<T extends string = string> {
    map: [number, number];
    args: string[];
    options: Record<T, any>;
    body: string;
    bodyMap: [number, number];
}
/** Raise on parsing/validation error. */
export declare class DirectiveParsingError extends Error {
    name: string;
}
/**
 * This function contains the logic to take the first line of a directive,
 * and the content, and turn it into the three core components:
 * arguments (list), options (key: value mapping), and body (text).
 */
export default function directiveToData(token: Token, directive: IDirectiveSpec): IDirectiveData;
export declare function parseDirectiveOptions(content: string[], fullSpec: IDirectiveSpec): [string[], {
    [key: string]: any;
}, number];
