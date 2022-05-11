"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directivesDefault = exports.math = exports.tables = exports.images = exports.code = exports.admonitions = exports.directiveOptions = exports.directivePlugin = exports.Directive = void 0;
var main_1 = require("./main");
Object.defineProperty(exports, "Directive", { enumerable: true, get: function () { return main_1.Directive; } });
var plugin_1 = require("./plugin");
Object.defineProperty(exports, "directivePlugin", { enumerable: true, get: function () { return __importDefault(plugin_1).default; } });
exports.directiveOptions = __importStar(require("./options"));
var admonitions_1 = require("./admonitions");
Object.defineProperty(exports, "admonitions", { enumerable: true, get: function () { return admonitions_1.admonitions; } });
var code_1 = require("./code");
Object.defineProperty(exports, "code", { enumerable: true, get: function () { return code_1.code; } });
var images_1 = require("./images");
Object.defineProperty(exports, "images", { enumerable: true, get: function () { return images_1.images; } });
var tables_1 = require("./tables");
Object.defineProperty(exports, "tables", { enumerable: true, get: function () { return tables_1.tables; } });
var math_1 = require("./math");
Object.defineProperty(exports, "math", { enumerable: true, get: function () { return math_1.math; } });
const admonitions_2 = require("./admonitions");
const code_2 = require("./code");
const images_2 = require("./images");
const tables_2 = require("./tables");
const math_2 = require("./math");
exports.directivesDefault = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, admonitions_2.admonitions), images_2.images), code_2.code), tables_2.tables), math_2.math);
//# sourceMappingURL=index.js.map