"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Functions for converting and validating directive options
 *
 * Primarily adapted from: docutils/docutils/parsers/rst/directives/__init__.py
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.uri = exports.create_choice = exports.length_or_percentage_or_unitless_figure = exports.length_or_percentage_or_unitless = exports.length_or_unitless = exports.percentage = exports.optional_int = exports.nonnegative_int = exports.int = exports.class_option = exports.flag = exports.unchanged_required = exports.unchanged = exports.OptionSpecError = exports.make_id = void 0;
/**
 * Normalize a string to HTML4 id
 *
 * Adapted from docutils/nodes.py::make_id,
 * it should be noted that in HTML5 the only requirement is no whitespace.
 * */
function make_id(name) {
    // TODO make more complete
    return name
        .toLowerCase()
        .split(/\s+/)
        .join("-")
        .replace(/[^a-z0-9]+/, "-")
        .replace(/^[-0-9]+|-+$/, "");
}
exports.make_id = make_id;
/** Error to throw when an option is invalid. */
class OptionSpecError extends Error {
    constructor() {
        super(...arguments);
        this.name = "OptionSpecError";
    }
}
exports.OptionSpecError = OptionSpecError;
/** Leave value unchanged */
const unchanged = (value) => value;
exports.unchanged = unchanged;
/** Leave value unchanged, but assert non-empty string */
const unchanged_required = (value) => {
    if (!value) {
        throw new OptionSpecError("Argument required but none supplied");
    }
    return value;
};
exports.unchanged_required = unchanged_required;
/** A flag option (no argument) */
const flag = (value) => {
    if (value.trim()) {
        throw new OptionSpecError(`No argument is allowed: "${value}" supplied`);
    }
    return null;
};
exports.flag = flag;
/** Split values by whitespace and normalize to HTML4 id */
const class_option = (value) => {
    return `${value || ""}`.split(/\s+/).map(name => make_id(name));
};
exports.class_option = class_option;
/** Check for an integer argument and convert */
function int(argument) {
    if (!argument) {
        throw new OptionSpecError("Value is not set");
    }
    const value = Number.parseFloat(argument);
    if (Number.isNaN(value) || !Number.isInteger(value)) {
        throw new OptionSpecError(`Value "${argument}" is not an integer`);
    }
    return value;
}
exports.int = int;
/** Check for a non-negative integer argument and convert */
function nonnegative_int(argument) {
    const value = int(argument);
    if (value < 0) {
        throw new OptionSpecError(`Value "${argument}" must be positive or zero`);
    }
    return value;
}
exports.nonnegative_int = nonnegative_int;
/** A non-negative integer or null. */
const optional_int = (value) => {
    if (!value) {
        return null;
    }
    return nonnegative_int(value);
};
exports.optional_int = optional_int;
/** Check for an integer percentage value with optional percent sign. */
const percentage = (value) => {
    value = `${value || ""}`.replace(/\s+%$/, "");
    return nonnegative_int(value);
};
exports.percentage = percentage;
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
const length_or_unitless = (value) => {
    return get_measure(value, [...length_units, ""]);
};
exports.length_or_unitless = length_or_unitless;
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
const length_or_percentage_or_unitless = (argument, defaultUnit = "") => {
    try {
        return get_measure(argument, [...length_units, "%"]);
    }
    catch (_a) {
        return (0, exports.length_or_unitless)(argument) + defaultUnit;
    }
};
exports.length_or_percentage_or_unitless = length_or_percentage_or_unitless;
const length_or_percentage_or_unitless_figure = (argument, defaultUnit = "") => {
    if (argument.toLowerCase() === "image") {
        return "image";
    }
    return (0, exports.length_or_percentage_or_unitless)(argument, defaultUnit);
};
exports.length_or_percentage_or_unitless_figure = length_or_percentage_or_unitless_figure;
/** Create an option that asserts the (lower-cased & trimmed) value is a member of a choice set. */
function create_choice(choices) {
    return (argument) => {
        argument = argument.toLowerCase().trim();
        if (choices.includes(argument)) {
            return argument;
        }
        throw new OptionSpecError(`must be in: ${choices.join("|")}`);
    };
}
exports.create_choice = create_choice;
/** Return the URI argument with unescaped whitespace removed. */
const uri = (value) => {
    // TODO implement whitespace removal
    return value;
};
exports.uri = uri;
//# sourceMappingURL=options.js.map