export { Role, main } from "./main";
export { default as rolePlugin } from "./plugin";
export { math } from "./math";
export { html } from "./html";
export { references } from "./references";
import { main } from "./main";
import { math } from "./math";
import { html } from "./html";
import { references } from "./references";
export const rolesDefault = Object.assign(Object.assign(Object.assign(Object.assign({}, main), html), math), references);
//# sourceMappingURL=index.js.map