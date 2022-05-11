import StateCore from "markdown-it/lib/rules_core/state_core";
import Token from "markdown-it/lib/token";
/** The kind of the target as a TargetKind enum ('fig', 'eq', etc.) */
export declare enum TargetKind {
    equation = "eq",
    figure = "fig",
    table = "table",
    code = "code",
    section = "sec"
}
/**
 * Targets are created by figures or equations.
 * They are "things" that you can reference in documentation, e.g. Figure 1.
 */
export declare type Target = {
    /** The identifier or label of the target. */
    label: string;
    /** TargetKind enum ('fig', 'eq', etc.) or a custom string */
    kind: TargetKind | string;
    /** The default title that may be resolved in other places in a document. */
    title: string;
    /** This is the number that will be given to this target.
     * Note that it may be a `Number` or a `String` depending on
     * if there is Section numbering in place (e.g. `Figure 1.2`)
     */
    number: number | string;
};
export declare type Reference = {
    /** The identifier or label of the target. */
    label: string;
    tokens: {
        open: Token;
        content: Token;
        close: Token;
    };
    /** TargetKind enum ('fig', 'eq', etc.) or a custom string */
    kind?: TargetKind | string;
    /** Return the content that should be shown in a reference given a target.
     *
     * For example, in a `numref`, you will replace `%s` with the `target.number`.
     */
    contentFromTarget?: (target: Target) => string;
};
/**
 * The `DocState` keeps track of targets, references and numbering.
 *
 * This is on the the state.env (see `getDocState`), and there
 * should only be one per markdown-it instance.
 */
export declare type DocState = {
    targets: Record<string, Target>;
    references: Reference[];
    numbering: Record<TargetKind | string, number>;
};
/** Safely create the document state for docutils */
export declare function getDocState(state: StateCore): DocState;
/**
 * This is the information on `token.meta.docutils`
 */
export declare type MetaState = {
    /** Target included in the `token.meta.docutils` state. */
    target: Target;
};
/**
 * Safely create a namespaced meta information on a token
 * @param token A markdown-it token that will contain the target
 * @returns An object containing a `Target`
 */
export declare function getNamespacedMeta(token: Token): MetaState;
/** Create a new internal target.
 *
 * @param state MarkdownIt state that will be modified
 * @param label The reference label that will be normalized and used to associate the target. Note some directives use "name".
 * @param kind The target kind: "eq", "code", "table" or "fig"
 */
export declare function newTarget(state: StateCore, token: Token, kind: TargetKind, label: string, title: string, silent?: boolean): Target;
/**
 * Resolve a reference **in-place** in a following numbering pass.
 *
 * @param state Reference to the state object
 * @param tokens The open/content/close tokens of the reference
 * @param name Name/label/identifier of the target
 * @param opts Includes the reference `kind` and an optional way to create the reference content
 */
export declare function resolveRefLater(state: StateCore, tokens: Reference["tokens"], data: {
    label: string;
    kind: string;
    value?: string;
}, opts?: {
    kind?: TargetKind;
    contentFromTarget?: Reference["contentFromTarget"];
}): void;
