import { rolesDefault, Role, rolePlugin } from "./roles";
import { directivesDefault, Directive, directivePlugin, directiveOptions } from "./directives";
import statePlugin from "./state/plugin";
export { rolesDefault, rolePlugin, Role };
export { directivesDefault, directivePlugin, Directive, directiveOptions };
/** Default options for docutils plugin */
const OptionDefaults = {
    parseRoles: true,
    replaceFences: true,
    rolesAfter: "inline",
    directivesAfter: "block",
    directives: directivesDefault,
    roles: rolesDefault
};
/**
 * A markdown-it plugin for implementing docutils style roles and directives.
 */
export function docutilsPlugin(md, options) {
    const fullOptions = Object.assign(Object.assign({}, OptionDefaults), options);
    md.use(rolePlugin, fullOptions);
    md.use(directivePlugin, fullOptions);
    md.use(statePlugin, fullOptions);
}
// Note: Exporting default and the function as a named export.
//       This helps with Jest integration in downstream packages.
export default docutilsPlugin;
//# sourceMappingURL=index.js.map