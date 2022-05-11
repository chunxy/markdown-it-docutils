import { class_option, unchanged } from "./options";
import { Directive } from "./main";
/** Directives for admonition boxes.
 *
 * Apdapted from: docutils/docutils/parsers/rst/directives/admonitions.py
 */
class BaseAdmonition extends Directive {
    constructor() {
        super(...arguments);
        this.final_argument_whitespace = true;
        this.has_content = true;
        this.option_spec = {
            class: class_option,
            // TODO handle name option
            name: unchanged
        };
        this.title = "";
        this.kind = "";
    }
    run(data) {
        var _a;
        const newTokens = [];
        // we create an overall container, then individual containers for the title and body
        const adToken = this.createToken("admonition_open", "aside", 1, {
            map: data.map,
            block: true,
            meta: { kind: this.kind }
        });
        if (((_a = data.options.class) === null || _a === void 0 ? void 0 : _a.length) >= 1) {
            // Custom class information must go first for styling
            // For example, `class=tip, kind=seealso` should be styled as a `tip`
            adToken.attrSet("class", data.options.class.join(" "));
            adToken.attrJoin("class", "admonition");
        }
        else {
            adToken.attrSet("class", "admonition");
        }
        if (this.kind) {
            adToken.attrJoin("class", this.kind);
        }
        newTokens.push(adToken);
        const adTokenTitle = this.createToken("admonition_title_open", "header", 1);
        adTokenTitle.attrSet("class", "admonition-title");
        newTokens.push(adTokenTitle);
        // we want the title to be parsed as Markdown during the inline phase
        const title = data.args[0] || this.title;
        newTokens.push(this.createToken("inline", "", 0, {
            map: [data.map[0], data.map[0]],
            content: title,
            children: []
        }));
        newTokens.push(this.createToken("admonition_title_close", "header", -1, { block: true }));
        // run a recursive parse on the content of the admonition upto this stage
        const bodyTokens = this.nestedParse(data.body, data.bodyMap[0]);
        newTokens.push(...bodyTokens);
        newTokens.push(this.createToken("admonition_close", "aside", -1, { block: true }));
        return newTokens;
    }
}
export class Admonition extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.required_arguments = 1;
    }
}
export class Attention extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Attention";
        this.kind = "attention";
    }
}
export class Caution extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Caution";
        this.kind = "caution";
    }
}
export class Danger extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Danger";
        this.kind = "danger";
    }
}
export class Error extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Error";
        this.kind = "error";
    }
}
export class Important extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Important";
        this.kind = "important";
    }
}
export class Hint extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Hint";
        this.kind = "hint";
    }
}
export class Note extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Note";
        this.kind = "note";
    }
}
export class SeeAlso extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "See Also";
        this.kind = "seealso";
    }
}
export class Tip extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Tip";
        this.kind = "tip";
    }
}
export class Warning extends BaseAdmonition {
    constructor() {
        super(...arguments);
        this.title = "Warning";
        this.kind = "warning";
    }
}
export const admonitions = {
    admonition: Admonition,
    attention: Attention,
    caution: Caution,
    danger: Danger,
    error: Error,
    important: Important,
    hint: Hint,
    note: Note,
    seealso: SeeAlso,
    tip: Tip,
    warning: Warning
};
//# sourceMappingURL=admonitions.js.map