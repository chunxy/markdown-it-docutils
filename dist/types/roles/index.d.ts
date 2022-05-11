export { Role, main, IRoleData } from "./main";
export { default as rolePlugin } from "./plugin";
export type { IOptions as IRoleOptions } from "./types";
export { math } from "./math";
export { html } from "./html";
export { references } from "./references";
export declare const rolesDefault: {
    eq: typeof import("./references").Eq;
    ref: typeof import("./references").Ref;
    numref: typeof import("./references").NumRef;
    math: typeof import("./math").Math;
    subscript: typeof import("./html").Subscript;
    sub: typeof import("./html").Subscript;
    superscript: typeof import("./html").Superscript;
    sup: typeof import("./html").Superscript;
    abbreviation: typeof import("./html").Abbreviation;
    abbr: typeof import("./html").Abbreviation;
    raw: typeof import("./main").RawRole;
};
