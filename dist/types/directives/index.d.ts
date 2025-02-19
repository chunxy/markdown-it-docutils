export { Directive, IDirectiveData } from "./main";
export { default as directivePlugin } from "./plugin";
export * as directiveOptions from "./options";
export type { IOptions as IDirectiveOptions } from "./types";
export { admonitions } from "./admonitions";
export { code } from "./code";
export { images } from "./images";
export { tables } from "./tables";
export { math } from "./math";
export declare const directivesDefault: {
    math: typeof import("./math").Math;
    "list-table": typeof import("./tables").ListTable;
    code: typeof import("./code").Code;
    "code-block": typeof import("./code").CodeBlock;
    "code-cell": typeof import("./code").CodeCell;
    image: typeof import("./images").Image;
    figure: typeof import("./images").Figure;
    admonition: typeof import("./admonitions").Admonition;
    attention: typeof import("./admonitions").Attention;
    caution: typeof import("./admonitions").Caution;
    danger: typeof import("./admonitions").Danger;
    error: typeof import("./admonitions").Error;
    important: typeof import("./admonitions").Important;
    hint: typeof import("./admonitions").Hint;
    note: typeof import("./admonitions").Note;
    seealso: typeof import("./admonitions").SeeAlso;
    tip: typeof import("./admonitions").Tip;
    warning: typeof import("./admonitions").Warning;
};
