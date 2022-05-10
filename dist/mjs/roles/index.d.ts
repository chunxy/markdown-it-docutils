export { Role, main } from "./main";
export { default as rolePlugin } from "./plugin";
export type { IOptions as IRoleOptions } from "./types";
export { math } from "./math";
export declare const rolesDefault: {
    math: typeof import("./math").Math;
    subscript: typeof import("./html").Subscript;
    sub: typeof import("./html").Subscript;
    superscript: typeof import("./html").Subscript;
    sup: typeof import("./html").Superscript;
    abbreviation: typeof import("./html").Abbreviation;
    abbr: typeof import("./html").Abbreviation;
    raw: typeof import("./main").RawRole;
};
