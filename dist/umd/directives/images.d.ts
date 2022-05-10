/** Directives for image visualisation */
import type Token from "markdown-it/lib/token";
import { Directive, IDirectiveData } from "./main";
/** Directive for a single image.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py
 */
export declare class Image extends Directive {
    required_arguments: number;
    optional_arguments: number;
    final_argument_whitespace: boolean;
    option_spec: {
        align: import("./options").OptionSpecConverter;
        alt: import("./options").OptionSpecConverter;
        height: import("./options").OptionSpecConverter;
        width: import("./options").OptionSpecConverter;
        scale: import("./options").OptionSpecConverter;
        target: import("./options").OptionSpecConverter;
        class: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
    };
    create_image(data: IDirectiveData<keyof Image["option_spec"]>): Token;
    run(data: IDirectiveData): Token[];
}
/** Directive for an image with caption.
 *
 * Adapted from: docutils/docutils/parsers/rst/directives/images.py,
 * and sphinx/directives/patches.py (patch to apply name to figure instead of image)
 */
export declare class Figure extends Image {
    option_spec: {
        align: import("./options").OptionSpecConverter;
        figwidth: import("./options").OptionSpecConverter;
        figclass: import("./options").OptionSpecConverter;
        alt: import("./options").OptionSpecConverter;
        height: import("./options").OptionSpecConverter;
        width: import("./options").OptionSpecConverter;
        scale: import("./options").OptionSpecConverter;
        target: import("./options").OptionSpecConverter;
        class: import("./options").OptionSpecConverter;
        name: import("./options").OptionSpecConverter;
    };
    has_content: boolean;
    run(data: IDirectiveData<keyof Figure["option_spec"]>): Token[];
}
export declare const images: {
    image: typeof Image;
    figure: typeof Figure;
};
