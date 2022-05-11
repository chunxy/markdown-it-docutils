export { Directive } from "./main";
export { default as directivePlugin } from "./plugin";
import * as directiveOptions_1 from "./options";
export { directiveOptions_1 as directiveOptions };
export { admonitions } from "./admonitions";
export { code } from "./code";
export { images } from "./images";
export { tables } from "./tables";
export { math } from "./math";
import { admonitions } from "./admonitions";
import { code } from "./code";
import { images } from "./images";
import { tables } from "./tables";
import { math } from "./math";
export const directivesDefault = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, admonitions), images), code), tables), math);
//# sourceMappingURL=index.js.map