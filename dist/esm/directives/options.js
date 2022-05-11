/* eslint-disable @typescript-eslint/no-explicit-any */
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
export function make_id(name) {
    // TODO make more complete
    return name
        .toLowerCase()
        .split(/\s+/)
        .join("-")
        .replace(/[^a-z0-9]+/, "-")
        .replace(/^[-0-9]+|-+$/, "");
}
/** Error to throw when an option is invalid. */
export class OptionSpecError extends Error {
    constructor() {
        super(...arguments);
        this.name = "OptionSpecError";
    }
}
/** Leave value unchanged */
export const unchanged = (value) => value;
/** Leave value unchanged, but assert non-empty string */
export const unchanged_required = (value) => {
    if (!value) {
        throw new OptionSpecError("Argument required but none supplied");
    }
    return value;
};
/** A flag option (no argument) */
export const flag = (value) => {
    if (value.trim()) {
        throw new OptionSpecError(`No argument is allowed: "${value}" supplied`);
    }
    return null;
};
/** Split values by whitespace and normalize to HTML4 id */
export const class_option = (value) => {
    return `${value || ""}`.split(/\s+/).map(name => make_id(name));
};
/** Check for an integer argument and convert */
export function int(argument) {
    if (!argument) {
        throw new OptionSpecError("Value is not set");
    }
    const value = Number.parseFloat(argument);
    if (Number.isNaN(value) || !Number.isInteger(value)) {
        throw new OptionSpecError(`Value "${argument}" is not an integer`);
    }
    return value;
}
/** Check for a non-negative integer argument and convert */
export function nonnegative_int(argument) {
    const value = int(argument);
    if (value < 0) {
        throw new OptionSpecError(`Value "${argument}" must be positive or zero`);
    }
    return value;
}
/** A non-negative integer or null. */
export const optional_int = (value) => {
    if (!value) {
        return null;
    }
    return nonnegative_int(value);
};
/** Check for an integer percentage value with optional percent sign. */
export const percentage = (value) => {
    value = `${value || ""}`.replace(/\s+%$/, "");
    return nonnegative_int(value);
};
/** Check for a positive argument of one of the units and return a
    normalized string of the form "<value><unit>" (without space in
    between).
*/
function get_measure(argument, units) {
    const regex = new RegExp(`^(?<number>[0-9.]+)\\s*(?<units>${units.join("|")})$`);
    const match = regex.exec(argument);
    if (!match || !match.groups) {
        throw new OptionSpecError(`not a positive measure of one of the following units: ${units.join("|")}`);
    }
    return match.groups.number + match.groups.units;
}
const length_units = ["em", "ex", "px", "in", "cm", "mm", "pt", "pc"];
/** Check for a positive argument of a length unit, allowing for no unit. */
export const length_or_unitless = (value) => {
    return get_measure(value, [...length_units, ""]);
};
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
export const length_or_percentage_or_unitless = (argument, defaultUnit = "") => {
    try {
        return get_measure(argument, [...length_units, "%"]);
    }
    catch (_a) {
        return length_or_unitless(argument) + defaultUnit;
    }
};
export const length_or_percentage_or_unitless_figure = (argument, defaultUnit = "") => {
    if (argument.toLowerCase() === "image") {
        return "image";
    }
    return length_or_percentage_or_unitless(argument, defaultUnit);
};
/** Create an option that asserts the (lower-cased & trimmed) value is a member of a choice set. */
export function create_choice(choices) {
    return (argument) => {
        argument = argument.toLowerCase().trim();
        if (choices.includes(argument)) {
            return argument;
        }
        throw new OptionSpecError(`must be in: ${choices.join("|")}`);
    };
}
/** Return the URI argument with unescaped whitespace removed. */
export const uri = (value) => {
    // TODO implement whitespace removal
    return value;
};
//# sourceMappingURL=options.js.map