"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.docutilsPlugin = exports.directiveOptions = exports.Directive = exports.directivePlugin = exports.directivesDefault = exports.Role = exports.rolePlugin = exports.rolesDefault = void 0;
const roles_1 = require("./roles");
Object.defineProperty(exports, "rolesDefault", { enumerable: true, get: function () { return roles_1.rolesDefault; } });
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return roles_1.Role; } });
Object.defineProperty(exports, "rolePlugin", { enumerable: true, get: function () { return roles_1.rolePlugin; } });
const directives_1 = require("./directives");
Object.defineProperty(exports, "directivesDefault", { enumerable: true, get: function () { return directives_1.directivesDefault; } });
Object.defineProperty(exports, "Directive", { enumerable: true, get: function () { return directives_1.Directive; } });
Object.defineProperty(exports, "directivePlugin", { enumerable: true, get: function () { return directives_1.directivePlugin; } });
Object.defineProperty(exports, "directiveOptions", { enumerable: true, get: function () { return directives_1.directiveOptions; } });
const plugin_1 = __importDefault(require("./state/plugin"));
/** Default options for docutils plugin */
const OptionDefaults = {
    parseRoles: true,
    replaceFences: true,
    rolesAfter: "inline",
    directivesAfter: "block",
    directives: directives_1.directivesDefault,
    roles: roles_1.rolesDefault
};
/**
 * A markdown-it plugin for implementing docutils style roles and directives.
 */
function docutilsPlugin(md, options) {
    const fullOptions = Object.assign(Object.assign({}, OptionDefaults), options);
    md.use(roles_1.rolePlugin, fullOptions);
    md.use(directives_1.directivePlugin, fullOptions);
    md.use(plugin_1.default, fullOptions);
}
exports.docutilsPlugin = docutilsPlugin;
// Note: Exporting default and the function as a named export.
//       This helps with Jest integration in downstream packages.
exports.default = docutilsPlugin;
//# sourceMappingURL=index.js.map