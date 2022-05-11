/** A tree representation of a linear markdown-it token stream.
 *
 * Ported from: markdown-it-py/markdown_it/tree.py
 */
import Token from "markdown-it/lib/token";
/**A Markdown syntax tree node.

A class that can be used to construct a tree representation of a linear
`markdown-it` token stream.

Each node in the tree represents either:
    - root of the Markdown document
    - a single unnested `Token`
    - a `Token` "_open" and "_close" token pair, and the tokens nested in
        between
*/
export declare class SyntaxTreeNode {
    private token?;
    private nester_tokens?;
    parent?: SyntaxTreeNode;
    children: SyntaxTreeNode[];
    /** Initialize a `SyntaxTreeNode` from a token stream. */
    constructor(tokens: Token[], create_root?: boolean);
    private _set_children_from_tokens;
    private _add_child;
    /** Recover the linear token stream. */
    to_tokens(): Token[];
    /** Is the node a special root node? */
    get is_root(): boolean;
    /** Is this node nested? */
    get is_nested(): boolean;
    /** Get siblings of the node (including self). */
    get siblings(): SyntaxTreeNode[];
    /** Recursively yield all descendant nodes in the tree starting at self.
     *
     * The order mimics the order of the underlying linear token stream (i.e. depth first).
     */
    walk(include_self?: boolean): Generator<SyntaxTreeNode>;
    /** Get a string type of the represented syntax.
     *
      - "root" for root nodes
      - `Token.type` if the node represents an un-nested token
      - `Token.type` of the opening token, with "_open" suffix stripped, if
          the node represents a nester token pair
    */
    get type(): string;
    private attribute_token;
    get tag(): string;
    get level(): number;
    get content(): string;
    get markup(): string;
    get info(): string;
    get meta(): any;
    get block(): boolean;
    get hidden(): boolean;
    get map(): [number, number] | null;
    get attrs(): [string, string][] | null;
}
