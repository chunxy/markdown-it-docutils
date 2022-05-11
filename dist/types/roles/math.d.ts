/**
 * This module contains roles that relate to mathematics
 */
import type MarkdownIt from "markdown-it/lib";
import type Token from "markdown-it/lib/token";
import { IRoleData, Role } from "./main";
import { IOptions } from "./types";
export declare class Math extends Role {
    run(data: IRoleData): Token[];
}
export declare function inlineMathRenderer(md: MarkdownIt, options?: IOptions): void;
export declare const math: {
    math: typeof Math;
};
