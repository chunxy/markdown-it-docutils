import { Role } from "./main";
export class Subscript extends Role {
    run(data) {
        const open = new this.state.Token("sub_open", "sub", 1);
        open.markup = "~";
        const text = new this.state.Token("text", "", 0);
        text.content = data.content;
        const close = new this.state.Token("sub_close", "sub", -1);
        close.markup = "~";
        return [open, text, close];
    }
}
export class Superscript extends Role {
    run(data) {
        const open = new this.state.Token("sup_open", "sup", 1);
        open.markup = "~";
        const text = new this.state.Token("text", "", 0);
        text.content = data.content;
        const close = new this.state.Token("sup_close", "sup", -1);
        close.markup = "~";
        return [open, text, close];
    }
}
const ABBR_PATTERN = /^(.+?)\(([^()]+)\)$/; // e.g. 'CSS (Cascading Style Sheets)'
export class Abbreviation extends Role {
    run(data) {
        var _a, _b, _c, _d;
        const match = ABBR_PATTERN.exec(data.content);
        const content = (_b = (_a = match === null || match === void 0 ? void 0 : match[1]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : data.content.trim();
        const title = (_d = (_c = match === null || match === void 0 ? void 0 : match[2]) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : null;
        const open = new this.state.Token("abbr_open", "abbr", 1);
        if (title)
            open.attrSet("title", title);
        const text = new this.state.Token("text", "", 0);
        text.content = content;
        const close = new this.state.Token("abbr_close", "abbr", -1);
        return [open, text, close];
    }
}
export const html = {
    // Subscript
    subscript: Subscript,
    sub: Subscript,
    // Superscript
    superscript: Superscript,
    sup: Superscript,
    // Abbreviation
    abbreviation: Abbreviation,
    abbr: Abbreviation
};
//# sourceMappingURL=html.js.map