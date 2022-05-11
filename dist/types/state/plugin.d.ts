import type MarkdownIt from "markdown-it";
/** Allowed options for state plugin */
export declare type IOptions = Record<string, never>;
/**
 * Create a rule that runs at the end of a markdown-it parser to go through all
 * references and add their targets.
 *
 * This `Rule` is done *last*, as you may reference a figure/equation, when that `Target`
 * has not yet been created. The references call `resolveRefLater` when they are being
 * created and pass their tokens such that the content of those tokens can be
 * dynamically updated.
 *
 * @param options (none currently)
 * @returns The markdown-it Rule
 */
export default function statePlugin(md: MarkdownIt, options: IOptions): void;
