/**
 * This module contains roles that directly map to HTML semantic tags
 */
import type Token from "markdown-it/lib/token";
import { IRoleData, Role } from "./main";
export declare class Subscript extends Role {
    run(data: IRoleData): Token[];
}
export declare class Superscript extends Role {
    run(data: IRoleData): Token[];
}
export declare class Abbreviation extends Role {
    run(data: IRoleData): Token[];
}
export declare const html: {
    subscript: typeof Subscript;
    sub: typeof Subscript;
    superscript: typeof Subscript;
    sup: typeof Superscript;
    abbreviation: typeof Abbreviation;
    abbr: typeof Abbreviation;
};
