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
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = __importStar(require("./main"));
function directivePlugin(md, options) {
    var _a;
    let after = options.directivesAfter || "block";
    if ((_a = options.replaceFences) !== null && _a !== void 0 ? _a : true) {
        md.core.ruler.after(after, "fence_to_directive", replaceFences);
        after = "fence_to_directive";
    }
    md.core.ruler.after(after, "run_directives", runDirectives(options.directives || {}));
    // fallback renderer for unhandled directives
    md.renderer.rules["directive"] = (tokens, idx) => {
        const token = tokens[idx];
        return `<aside class="directive-unhandled">\n<header><mark>${token.info}</mark><code> ${token.meta.arg}</code></header>\n<pre>${token.content}</pre></aside>\n`;
    };
    md.renderer.rules["directive_error"] = (tokens, idx) => {
        const token = tokens[idx];
        let content = "";
        if (token.content) {
            content = `\n---\n${token.content}`;
        }
        return `<aside class="directive-error">\n<header><mark>${token.info}</mark><code> ${token.meta.arg}</code></header>\n<pre>${token.meta.error_name}:\n${token.meta.error_message}\n${content}</pre></aside>\n`;
    };
}
exports.default = directivePlugin;
/** Convert fences identified as directives to `directive` tokens */
function replaceFences(state) {
    for (const token of state.tokens) {
        if (token.type === "fence") {
            const match = token.info.match(/^\{([^\s}]+)\}\s*(.*)$/);
            if (match) {
                if (match[1] == "mermaid" || match[1] == "railroad")
                    continue;
                token.type = "directive";
                token.info = match[1];
                token.meta = { arg: match[2] };
            }
        }
    }
    return true;
}
/** Run all directives, replacing the original token */
function runDirectives(directives) {
    function func(state) {
        const finalTokens = [];
        for (const token of state.tokens) {
            // TODO directive name translations
            if (token.type === "directive" && token.info in directives) {
                try {
                    const directive = new directives[token.info](state);
                    const data = (0, main_1.default)(token, directive);
                    const [content, opts] = (0, main_1.parseDirectiveOptions)(token.content.trim() ? token.content.split(/\r?\n/) : [], directive);
                    const directiveOpen = new state.Token("parsed_directive_open", "", 1);
                    directiveOpen.info = token.info;
                    directiveOpen.hidden = true;
                    directiveOpen.content = content.join("\n").trim();
                    directiveOpen.meta = {
                        arg: token.meta.arg,
                        opts
                    };
                    const newTokens = [directiveOpen];
                    newTokens.push(...directive.run(data));
                    const directiveClose = new state.Token("parsed_directive_close", "", -1);
                    directiveClose.hidden = true;
                    newTokens.push(directiveClose);
                    // Ensure `meta` exists and add the directive options to parsed child
                    newTokens[1].meta = Object.assign(Object.assign({ directive: true }, data.options), newTokens[1].meta);
                    finalTokens.push(...newTokens);
                }
                catch (err) {
                    const errorToken = new state.Token("directive_error", "", 0);
                    errorToken.content = token.content;
                    errorToken.info = token.info;
                    errorToken.meta = token.meta;
                    errorToken.map = token.map;
                    errorToken.meta.error_message = err.message;
                    errorToken.meta.error_name = err.name;
                    finalTokens.push(errorToken);
                }
            }
            else {
                finalTokens.push(token);
            }
        }
        state.tokens = finalTokens;
        return true;
    }
    return func;
}
//# sourceMappingURL=plugin.js.map