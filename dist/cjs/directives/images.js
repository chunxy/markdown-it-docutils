"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.images = exports.Figure = exports.Image = void 0;
const utils_1 = require("../state/utils");
const main_1 = require("./main");
const options_1 = require("./options");
const shared_option_spec = {
    alt: options_1.unchanged,
    height: options_1.length_or_unitless,
    width: options_1.length_or_percentage_or_unitless,
    // TODO handle scale option
    scale: options_1.percentage,
    // TODO handle target option
    target: options_1.unchanged_required,
    class: options_1.class_option,
    // TODO handle name option (note: should be applied to figure for Figure)
    name: options_1.unchanged
};
/** Directive for a single image.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py
 */
class Image extends main_1.Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 1;
        this.optional_arguments = 0;
        this.final_argument_whitespace = true;
        this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: (0, options_1.create_choice)(["left", "center", "right", "top", "middle", "bottom"]) });
    }
    create_image(data) {
        // get URI
        const src = (0, options_1.uri)(data.args[0] || "");
        const token = this.createToken("image", "img", 0, { map: data.map, block: true });
        token.attrSet("src", src);
        token.attrSet("alt", data.options.alt || "");
        // TODO markdown-it default renderer requires the alt as children tokens
        const altTokens = [];
        if (data.options.alt) {
            this.state.md.inline.parse(data.options.alt, this.state.md, this.state.env, altTokens);
        }
        token.children = altTokens;
        if (data.options.height) {
            token.attrSet("height", data.options.height);
        }
        if (data.options.width) {
            token.attrSet("width", data.options.width);
        }
        if (data.options.align) {
            token.attrJoin("class", `align-${data.options.align}`);
        }
        if (data.options.class) {
            token.attrJoin("class", data.options.class.join(" "));
        }
        return token;
    }
    run(data) {
        return [this.create_image(data)];
    }
}
exports.Image = Image;
/** Directive for an image with caption.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py,
 * and sphinx/directives/patches.py (patch to apply name to figure instead of image)
 */
class Figure extends Image {
    constructor() {
        super(...arguments);
        this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: (0, options_1.create_choice)(["left", "center", "right"]), figwidth: options_1.length_or_percentage_or_unitless_figure, figclass: options_1.class_option });
        this.has_content = true;
    }
    run(data) {
        const openToken = this.createToken("figure_open", "figure", 1, {
            map: data.map,
            block: true
        });
        if (data.options.figclass) {
            openToken.attrJoin("class", data.options.figclass.join(" "));
        }
        if (data.options.align) {
            openToken.attrJoin("class", `align-${data.options.align}`);
        }
        if (data.options.figwidth && data.options.figwidth !== "image") {
            // TODO handle figwidth == "image"?
            openToken.attrSet("width", data.options.figwidth);
        }
        let target;
        if (data.options.name) {
            // TODO: figure out how to pass silent here
            target = (0, utils_1.newTarget)(this.state, openToken, utils_1.TargetKind.figure, data.options.name, 
            // TODO: a better title?
            data.body.trim());
            openToken.attrJoin("class", "numbered");
        }
        const imageToken = this.create_image(data);
        imageToken.map = [data.map[0], data.map[0]];
        let captionTokens = [];
        let legendTokens = [];
        if (data.body) {
            const [caption, ...legendParts] = data.body.split("\n\n");
            const legend = legendParts.join("\n\n");
            const captionMap = data.bodyMap[0];
            const openCaption = this.createToken("figure_caption_open", "figcaption", 1, {
                block: true
            });
            if (target) {
                openCaption.attrSet("number", `${target.number}`);
            }
            // TODO in docutils caption can only be single paragraph (or ignored if comment)
            // then additional content is figure legend
            const captionBody = this.nestedParse(caption, captionMap);
            const closeCaption = this.createToken("figure_caption_close", "figcaption", -1, {
                block: true
            });
            captionTokens = [openCaption, ...captionBody, closeCaption];
            if (legend) {
                const legendMap = captionMap + caption.split("\n").length + 1;
                const openLegend = this.createToken("figure_legend_open", "", 1, {
                    block: true
                });
                const legendBody = this.nestedParse(legend, legendMap);
                const closeLegend = this.createToken("figure_legend_close", "", -1, {
                    block: true
                });
                legendTokens = [openLegend, ...legendBody, closeLegend];
            }
        }
        const closeToken = this.createToken("figure_close", "figure", -1, { block: true });
        return [openToken, imageToken, ...captionTokens, ...legendTokens, closeToken];
    }
}
exports.Figure = Figure;
exports.images = {
    image: Image,
    figure: Figure
};
//# sourceMappingURL=images.js.map