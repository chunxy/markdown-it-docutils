"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesDefault = exports.references = exports.html = exports.math = exports.rolePlugin = exports.main = exports.Role = void 0;
var main_1 = require("./main");
Object.defineProperty(exports, "Role", { enumerable: true, get: function () { return main_1.Role; } });
Object.defineProperty(exports, "main", { enumerable: true, get: function () { return main_1.main; } });
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "rolePlugin", { enumerable: true, get: function () { return __importDefault(plugin_1).default; } });
var math_1 = require("./math");
Object.defineProperty(exports, "math", { enumerable: true, get: function () { return math_1.math; } });
var html_1 = require("./html");
Object.defineProperty(exports, "html", { enumerable: true, get: function () { return html_1.html; } });
var references_1 = require("./references");
Object.defineProperty(exports, "references", { enumerable: true, get: function () { return references_1.references; } });
const main_2 = require("./main");
const math_2 = require("./math");
const html_2 = require("./html");
const references_2 = require("./references");
exports.rolesDefault = Object.assign(Object.assign(Object.assign(Object.assign({}, main_2.main), html_2.html), math_2.math), references_2.references);
//# sourceMappingURL=index.js.map