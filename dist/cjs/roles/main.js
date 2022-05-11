"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = exports.RawRole = exports.Role = void 0;
/** A class to define a single role */
class Role {
    constructor(state) {
        this.state = state;
    }
    /** Convert the role to tokens */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(data) {
        return [];
    }
}
exports.Role = Role;
class RawRole extends Role {
    run(data) {
        // TODO options
        const token = new this.state.Token("code_inline", "code", 0);
        token.content = data.content;
        return [token];
    }
}
exports.RawRole = RawRole;
exports.main = {
    raw: RawRole
};
//# sourceMappingURL=main.js.map