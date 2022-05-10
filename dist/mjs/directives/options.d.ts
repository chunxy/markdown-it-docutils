/** Functions for converting and validating directive options
 *
 * Primarily adapted from: docutils/docutils/parsers/rst/directives/__init__.py
 */
/**
 * Normalize a string to HTML4 id
 *
 * Adapted from docutils/nodes.py::make_id,
 * it should be noted that in HTML5 the only requirement is no whitespace.
 * */
export declare function make_id(name: string): string;
/** convert and validate an option value */
export declare type OptionSpecConverter = (value: string, options?: any) => any;
/** Error to throw when an option is invalid. */
export declare class OptionSpecError extends Error {
    name: string;
}
/** Leave value unchanged */
export declare const unchanged: OptionSpecConverter;
/** Leave value unchanged, but assert non-empty string */
export declare const unchanged_required: OptionSpecConverter;
/** A flag option (no argument) */
export declare const flag: OptionSpecConverter;
/** Split values by whitespace and normalize to HTML4 id */
export declare const class_option: OptionSpecConverter;
/** Check for an integer argument and convert */
export declare function int(argument: string): number;
/** Check for a non-negative integer argument and convert */
export declare function nonnegative_int(argument: string): number;
/** A non-negative integer or null. */
export declare const optional_int: OptionSpecConverter;
/** Check for an integer percentage value with optional percent sign. */
export declare const percentage: OptionSpecConverter;
/** Check for a positive argument of a length unit, allowing for no unit. */
export declare const length_or_unitless: OptionSpecConverter;
/**
Return normalized string of a length or percentage unit.

Add <default> if there is no unit. Raise ValueError if the argument is not
a positive measure of one of the valid CSS units (or without unit).

>>> length_or_percentage_or_unitless('3 pt')
'3pt'
>>> length_or_percentage_or_unitless('3%', 'em')
'3%'
>>> length_or_percentage_or_unitless('3')
'3'
>>> length_or_percentage_or_unitless('3', 'px')
'3px'

*/
export declare const length_or_percentage_or_unitless: OptionSpecConverter;
export declare const length_or_percentage_or_unitless_figure: OptionSpecConverter;
/** Create an option that asserts the (lower-cased & trimmed) value is a member of a choice set. */
export declare function create_choice(choices: string[]): OptionSpecConverter;
/** Return the URI argument with unescaped whitespace removed. */
export declare const uri: OptionSpecConverter;
