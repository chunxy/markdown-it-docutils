import type StateCore from "markdown-it/lib/rules_core/state_core";
import type Token from "markdown-it/lib/token";
/** Data structure of a role */
export interface IRoleData {
    /** The map of the containing inline token */
    parentMap: [number, number] | null;
    content: string;
    options?: {
        [key: string]: any;
    };
}
/** A class to define a single role */
export declare class Role {
    state: StateCore;
    constructor(state: StateCore);
    /** Convert the role to tokens */
    run(data: IRoleData): Token[];
}
export declare class RawRole extends Role {
    run(data: IRoleData): Token[];
}
export declare const main: {
    raw: typeof RawRole;
};
