import type MarkdownIt from "markdown-it/lib";
import { rolesDefault, Role, rolePlugin, IRoleOptions } from "./roles";
import { directivesDefault, Directive, directivePlugin, IDirectiveOptions } from "./directives";
export { rolesDefault, rolePlugin, Role };
export { directivesDefault, directivePlugin, Directive };
/** Allowed options for docutils plugin */
export interface IOptions extends IDirectiveOptions, IRoleOptions {
}
/**
 * A markdown-it plugin for implementing docutils style roles and directives.
 */
export default function docutilsPlugin(md: MarkdownIt, options?: IOptions): void;
