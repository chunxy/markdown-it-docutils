"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
/** Convert a directives first line and content to its structural components
 *
 * The code is adapted from: myst_parser/parse_directives.py
 * and is common for all directives
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDirectiveOptions = exports.DirectiveParsingError = exports.Directive = exports.DirectiveToken = void 0;
const js_yaml_1 = __importDefault(require("js-yaml"));
const nestedCoreParse_1 = require("../nestedCoreParse");
/** token specification for a directive */
class DirectiveToken {
    constructor(name, arg, content, map) {
        this.type = "directive";
        this.tag = "";
        this.attrs = null;
        this.nesting = 0;
        this.level = 0;
        this.children = null;
        this.markup = "";
        this.block = true;
        this.hidden = false;
        this.info = name;
        this.meta = { arg };
        this.content = content;
        this.map = map;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attrIndex(name) {
        return -1;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attrPush(attrData) {
        throw new Error("not implemented");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attrSet(name, value) {
        throw new Error("not implemented");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attrGet(name) {
        return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    attrJoin(name, value) {
        throw new Error("not implemented");
    }
}
exports.DirectiveToken = DirectiveToken;
/** A class to define a single directive */
class Directive {
    constructor(state) {
        this.required_arguments = 0;
        this.optional_arguments = 0;
        this.final_argument_whitespace = false;
        this.has_content = false;
        this.option_spec = {};
        this.rawOptions = false;
        this.state = state;
    }
    /** Convert the directive data to tokens */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(data) {
        return [];
    }
    assert(test, msg) {
        if (!test) {
            throw new Error(msg);
        }
    }
    /** throw error is no body content parsed. */
    assert_has_content(data) {
        if (!data.body) {
            throw new Error("Content block expected, but none found.");
        }
    }
    /** Create a single token */
    createToken(type, tag, nesting, optional) {
        const token = new this.state.Token(type, tag, nesting);
        if ((optional === null || optional === void 0 ? void 0 : optional.content) !== undefined) {
            token.content = optional.content;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.level) !== undefined) {
            token.level = optional.level;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.map) !== undefined) {
            token.map = optional.map;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.block) !== undefined) {
            token.block = optional.block;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.info) !== undefined) {
            token.info = optional.info;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.meta) !== undefined) {
            token.meta = optional.meta;
        }
        if ((optional === null || optional === void 0 ? void 0 : optional.children) !== undefined) {
            token.children = optional.children;
        }
        return token;
    }
    /** parse block of text to tokens (does not run inline parse) */
    nestedParse(block, initLine) {
        return (0, nestedCoreParse_1.nestedCoreParse)(this.state.md, "run_directives", block, this.state.env, initLine, true);
    }
}
exports.Directive = Directive;
/** Raise on parsing/validation error. */
class DirectiveParsingError extends Error {
    constructor() {
        super(...arguments);
        this.name = "DirectiveParsingError";
    }
}
exports.DirectiveParsingError = DirectiveParsingError;
/**
 * This function contains the logic to take the first line of a directive,
 * and the content, and turn it into the three core components:
 * arguments (list), options (key: value mapping), and body (text).
 */
function directiveToData(token, directive) {
    const firstLine = token.meta.arg || "";
    const content = token.content;
    let body = content.trim() ? content.split(/\r?\n/) : [];
    let bodyOffset = 0;
    let options = {};
    if (Object.keys(directive.option_spec || {}) || directive.rawOptions) {
        ;
        [body, options, bodyOffset] = parseDirectiveOptions(body, directive);
    }
    let args = [];
    if (!directive.required_arguments && !directive.optional_arguments) {
        if (firstLine) {
            bodyOffset = 0;
            body = [firstLine].concat(body);
        }
    }
    else {
        args = parseDirectiveArguments(firstLine, directive);
    }
    // remove first line of body if blank, to allow space between the options and the content
    if (body.length && !body[0].trim()) {
        body.shift();
        bodyOffset++;
    }
    // check for body content
    if (body.length && !directive.has_content) {
        throw new DirectiveParsingError("Has content but content not allowed");
    }
    return {
        map: token.map ? token.map : [0, 0],
        args,
        options,
        body: body.join("\n"),
        bodyMap: token.map
            ? [
                body.length > 0 ? token.map[0] + bodyOffset : token.map[1],
                body.length > 0 ? token.map[1] - 1 : token.map[1]
            ]
            : [0, 0]
    };
}
exports.default = directiveToData;
function parseDirectiveOptions(content, fullSpec) {
    // instantiate options
    let bodyOffset = 1;
    let options = {};
    let yamlBlock = null;
    // TODO allow for indented content (I can't remember why this was needed?)
    if (content.length && content[0].startsWith("---")) {
        // options contained in YAML block, ending with '---'
        bodyOffset++;
        const newContent = [];
        yamlBlock = [];
        let foundDivider = false;
        for (const line of content.slice(1)) {
            if (line.startsWith("---")) {
                bodyOffset++;
                foundDivider = true;
                continue;
            }
            if (foundDivider) {
                newContent.push(line);
            }
            else {
                bodyOffset++;
                yamlBlock.push(line);
            }
        }
        content = newContent;
    }
    else if (content.length && content[0].startsWith(":")) {
        const newContent = [];
        yamlBlock = [];
        let foundDivider = false;
        for (const line of content) {
            if (!foundDivider && !line.startsWith(":")) {
                foundDivider = true;
                newContent.push(line);
                continue;
            }
            if (foundDivider) {
                newContent.push(line);
            }
            else {
                bodyOffset++;
                yamlBlock.push(line.slice(1));
            }
        }
        content = newContent;
    }
    if (yamlBlock !== null) {
        try {
            const output = js_yaml_1.default.load(yamlBlock.join("\n"));
            if (output !== null && typeof output === "object") {
                options = output;
            }
            else {
                throw new DirectiveParsingError(`not dict: ${output}`);
            }
        }
        catch (error) {
            throw new DirectiveParsingError(`Invalid options YAML: ${error}`);
        }
    }
    if (fullSpec.rawOptions) {
        return [content, options, bodyOffset];
    }
    for (const [name, value] of Object.entries(options)) {
        const convertor = fullSpec.option_spec ? fullSpec.option_spec[name] : null;
        if (!convertor) {
            throw new DirectiveParsingError(`Unknown option: ${name}`);
        }
        let converted_value = value;
        if (value === null || value === false) {
            converted_value = "";
        }
        try {
            // In docutils all values are simply read as strings,
            // but loading with YAML these can be converted to other types, so we convert them back first
            // TODO check that it is sufficient to simply do this conversion, or if there is a better way
            converted_value = convertor(`${converted_value || ""}`);
        }
        catch (error) {
            throw new DirectiveParsingError(`Invalid option value: (option: '${name}'; value: ${value})\n${error}`);
        }
        options[name] = converted_value;
    }
    return [content, options, bodyOffset];
}
exports.parseDirectiveOptions = parseDirectiveOptions;
function parseDirectiveArguments(firstLine, fullSpec) {
    var _a;
    let args = firstLine.trim() ? (_a = firstLine.trim()) === null || _a === void 0 ? void 0 : _a.split(/\s+/) : [];
    const totalArgs = (fullSpec.required_arguments || 0) + (fullSpec.optional_arguments || 0);
    if (args.length < (fullSpec.required_arguments || 0)) {
        throw new DirectiveParsingError(`${fullSpec.required_arguments} argument(s) required, ${args.length} supplied`);
    }
    else if (args.length > totalArgs) {
        if (fullSpec.final_argument_whitespace) {
            // note split limit does not work the same as in python
            const arr = firstLine.split(/\s+/);
            args = arr.splice(0, totalArgs - 1);
            // TODO is it ok that we effectively replace all whitespace with single spaces?
            args.push(arr.join(" "));
        }
        else {
            throw new DirectiveParsingError(`maximum ${totalArgs} argument(s) allowed, ${args.length} supplied`);
        }
    }
    return args;
}
//# sourceMappingURL=main.js.map