/* eslint-disable @typescript-eslint/no-explicit-any */
/** A class to define a single role */
export class Role {
    constructor(state) {
        this.state = state;
    }
    /** Convert the role to tokens */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    run(data) {
        return [];
    }
}
export class RawRole extends Role {
    run(data) {
        // TODO options
        const token = new this.state.Token("code_inline", "code", 0);
        token.content = data.content;
        return [token];
    }
}
export const main = {
    raw: RawRole
};
//# sourceMappingURL=main.js.map