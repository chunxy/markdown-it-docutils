import type Token from "markdown-it/lib/token";
import { IRoleData, Role } from "./main";
export declare class Eq extends Role {
    run(data: IRoleData): Token[];
}
export declare class NumRef extends Role {
    run(data: IRoleData): Token[];
}
export declare class Ref extends Role {
    run(data: IRoleData): Token[];
}
export declare const references: {
    eq: typeof Eq;
    ref: typeof Ref;
    numref: typeof NumRef;
};
