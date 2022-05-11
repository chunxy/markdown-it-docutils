import { newTarget, TargetKind } from "../state/utils";
import { Directive } from "./main";
import { class_option, create_choice, length_or_percentage_or_unitless, length_or_percentage_or_unitless_figure, length_or_unitless, percentage, unchanged, unchanged_required, uri } from "./options";
const shared_option_spec = {
    alt: unchanged,
    height: length_or_unitless,
    width: length_or_percentage_or_unitless,
    // TODO handle scale option
    scale: percentage,
    // TODO handle target option
    target: unchanged_required,
    class: class_option,
    // TODO handle name option (note: should be applied to figure for Figure)
    name: unchanged
};
/** Directive for a single image.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py
 */
export class Image extends Directive {
    constructor() {
        super(...arguments);
        this.required_arguments = 1;
        this.optional_arguments = 0;
        this.final_argument_whitespace = true;
        this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: create_choice(["left", "center", "right", "top", "middle", "bottom"]) });
    }
    create_image(data) {
        // get URI
        const src = uri(data.args[0] || "");
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
/** Directive for an image with caption.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py,
 * and sphinx/directives/patches.py (patch to apply name to figure instead of image)
 */
export class Figure extends Image {
    constructor() {
        super(...arguments);
        this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: create_choice(["left", "center", "right"]), figwidth: length_or_percentage_or_unitless_figure, figclass: class_option });
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
            target = newTarget(this.state, openToken, TargetKind.figure, data.options.name, 
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
export const images = {
    image: Image,
    figure: Figure
};
//# sourceMappingURL=images.js.map