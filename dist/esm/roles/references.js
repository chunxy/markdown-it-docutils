import { resolveRefLater, TargetKind } from "../state/utils";
import { Role } from "./main";
const REF_PATTERN = /^(.+?)<([^<>]+)>$/; // e.g. 'Labeled Reference <ref>'
export class Eq extends Role {
    run(data) {
        const open = new this.state.Token("ref_open", "a", 1);
        const content = new this.state.Token("text", "", 0);
        const close = new this.state.Token("ref_close", "a", -1);
        resolveRefLater(this.state, { open, content, close }, { kind: "eq", label: data.content }, {
            kind: TargetKind.equation,
            contentFromTarget: target => {
                return `(${target.number})`;
            }
        });
        return [open, content, close];
    }
}
export class NumRef extends Role {
    run(data) {
        const match = REF_PATTERN.exec(data.content);
        const [, modified, ref] = match !== null && match !== void 0 ? match : [];
        const withoutLabel = modified === null || modified === void 0 ? void 0 : modified.trim();
        const open = new this.state.Token("ref_open", "a", 1);
        const content = new this.state.Token("text", "", 0);
        const close = new this.state.Token("ref_close", "a", -1);
        resolveRefLater(this.state, { open, content, close }, { kind: "numref", label: ref || data.content, value: withoutLabel }, {
            contentFromTarget: target => {
                if (!match)
                    return target.title.trim();
                return withoutLabel
                    .replace(/%s/g, String(target.number))
                    .replace(/\{number\}/g, String(target.number));
            }
        });
        return [open, content, close];
    }
}
export class Ref extends Role {
    run(data) {
        const match = REF_PATTERN.exec(data.content);
        const [, modified, ref] = match !== null && match !== void 0 ? match : [];
        const withoutLabel = modified === null || modified === void 0 ? void 0 : modified.trim();
        const open = new this.state.Token("ref_open", "a", 1);
        const content = new this.state.Token("text", "", 0);
        const close = new this.state.Token("ref_close", "a", -1);
        resolveRefLater(this.state, { open, content, close }, { kind: "ref", label: ref || data.content, value: withoutLabel }, {
            contentFromTarget: target => {
                return withoutLabel || target.title;
            }
        });
        return [open, content, close];
    }
}
export const references = {
    eq: Eq,
    ref: Ref,
    numref: NumRef
};
//# sourceMappingURL=references.js.map