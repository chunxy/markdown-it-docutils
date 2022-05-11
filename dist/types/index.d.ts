import type MarkdownIt from "markdown-it/lib";
import { rolesDefault, Role, rolePlugin, IRoleOptions, IRoleData } from "./roles";
import { directivesDefault, Directive, directivePlugin, directiveOptions, IDirectiveOptions, IDirectiveData } from "./directives";
export { rolesDefault, rolePlugin, Role };
export { directivesDefault, directivePlugin, Directive, directiveOptions };
export type { IRoleData, IRoleOptions, IDirectiveData, IDirectiveOptions };
/** Allowed options for docutils plugin */
export interface IOptions extends IDirectiveOptions, IRoleOptions {
}
/**
 * A markdown-it plugin for implementing docutils style roles and directives.
 */
export declare function docutilsPlugin(md: MarkdownIt, options?: IOptions): void;
export default docutilsPlugin;
