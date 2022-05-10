import type MarkdownIt from "markdown-it/lib"
import { rolesDefault, Role, rolePlugin, IRoleOptions, IRoleData } from "./roles"
import {
  directivesDefault,
  Directive,
  directivePlugin,
  directiveOptions,
  IDirectiveOptions,
  IDirectiveData
} from "./directives"
import statePlugin from "./state/plugin"

export { rolesDefault, rolePlugin, Role }
export { directivesDefault, directivePlugin, Directive, directiveOptions }

export type { IRoleData, IRoleOptions, IDirectiveData, IDirectiveOptions }

/** Allowed options for docutils plugin */
export interface IOptions extends IDirectiveOptions, IRoleOptions {
  // TODO new token render rules
}

/** Default options for docutils plugin */
const OptionDefaults: IOptions = {
  parseRoles: true,
  replaceFences: true,
  rolesAfter: "inline",
  directivesAfter: "block",
  directives: directivesDefault,
  roles: rolesDefault
}

/**
 * A markdown-it plugin for implementing docutils style roles and directives.
 */
export function docutilsPlugin(md: MarkdownIt, options?: IOptions): void {
  const fullOptions = { ...OptionDefaults, ...options }

  md.use(rolePlugin, fullOptions)
  md.use(directivePlugin, fullOptions)
  md.use(statePlugin, fullOptions)
}

// Note: Exporting default and the function as a named export.
//       This helps with Jest integration in downstream packages.
export default docutilsPlugin
