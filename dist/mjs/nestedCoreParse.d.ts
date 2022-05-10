import type MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token";
/** Perform a nested parse upto and including a particular ruleName
 *
 * The main use for this function is to perform nested parses
 * upto but not including inline parsing.
 */
export declare function nestedCoreParse(md: MarkdownIt, pluginRuleName: string, src: string, env: any, initLine: number, includeRule?: boolean): Token[];
