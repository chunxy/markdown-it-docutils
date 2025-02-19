(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.markdownitDocutils = {}));
})(this, (function (exports) { 'use strict';

  /* eslint-disable @typescript-eslint/no-explicit-any */
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
  class RawRole extends Role {
      run(data) {
          // TODO options
          const token = new this.state.Token("code_inline", "code", 0);
          token.content = data.content;
          return [token];
      }
  }
  const main = {
      raw: RawRole
  };

  const INLINE_MATH_RULE = "math_inline";
  class Math$2 extends Role {
      run(data) {
          const inline = new this.state.Token(INLINE_MATH_RULE, "span", 0);
          inline.attrSet("class", "math inline");
          inline.markup = "$";
          inline.content = data.content;
          return [inline];
      }
  }
  function inlineMathRenderer(md, options) {
      var _a;
      // Only create the renderer if it does not exist
      // For example, this may be defined in markdown-it-dollarmath
      if (!((_a = options === null || options === void 0 ? void 0 : options.roles) === null || _a === void 0 ? void 0 : _a.math) || md.renderer.rules[INLINE_MATH_RULE])
          return;
      md.renderer.rules[INLINE_MATH_RULE] = (tokens, idx) => {
          var _a, _b, _c;
          const renderer = (_c = (_b = (_a = options === null || options === void 0 ? void 0 : options.opts) === null || _a === void 0 ? void 0 : _a.math) === null || _b === void 0 ? void 0 : _b.renderer) !== null && _c !== void 0 ? _c : (c => md.utils.escapeHtml(c));
          const token = tokens[idx];
          const content = token.content.trim();
          const math = renderer(content, { displayMode: false });
          return `<span class="${token.attrGet("class")}">${math}</span>`;
      };
  }
  const math$1 = {
      math: Math$2
  };

  /** Parse a role, in MyST format */
  function rolePlugin(md, options) {
      if (options.parseRoles) {
          md.inline.ruler.before("backticks", "parse_roles", roleRule);
      }
      md.core.ruler.after(options.rolesAfter || "inline", "run_roles", runRoles(options.roles || {}));
      // fallback renderer for unhandled roles
      md.renderer.rules["role"] = (tokens, idx) => {
          const token = tokens[idx];
          return `<span class="role-unhandled"><mark>${token.meta.name}</mark><code>${token.content}</code></span>`;
      };
      // TODO: when another renderer comes up, refactor into something a bit more scalable
      inlineMathRenderer(md, options);
      // TODO role_error renderer
  }
  function roleRule(state, silent) {
      // Check if the role is escaped
      if (state.src.charCodeAt(state.pos - 1) === 0x5c) {
          /* \ */
          // TODO: this could be improved in the case of edge case '\\{', also multi-line
          return false;
      }
      const match = ROLE_PATTERN.exec(state.src.slice(state.pos));
      if (match == null)
          return false;
      const [str, name, , content] = match;
      // eslint-disable-next-line no-param-reassign
      state.pos += str.length;
      if (!silent) {
          const token = state.push("role", "", 0);
          token.meta = { name };
          token.content = content;
      }
      return true;
  }
  // MyST role syntax format e.g. {role}`text`
  // TODO: support role with no value e.g. {role}``
  let _x;
  try {
      _x = new RegExp("^\\{([a-zA-Z_\\-+:]{1,36})\\}(`+)(?!`)(.+?)(?<!`)\\2(?!`)");
  }
  catch (error) {
      // Safari does not support negative look-behinds
      // This is a slightly down-graded variant, as it does not require a space.
      _x = /^\{([a-zA-Z_\-+:]{1,36})\}(`+)(?!`)(.+?)\2(?!`)/;
  }
  const ROLE_PATTERN = _x;
  /** Run all roles, replacing the original token */
  function runRoles(roles) {
      function func(state) {
          var _a;
          for (const token of state.tokens) {
              if (token.type === "inline" && token.children) {
                  const childTokens = [];
                  for (const child of token.children) {
                      // TODO role name translations
                      if (child.type === "role" && ((_a = child.meta) === null || _a === void 0 ? void 0 : _a.name) in roles) {
                          try {
                              const role = new roles[child.meta.name](state);
                              const roleOpen = new state.Token("parsed_role_open", "", 1);
                              roleOpen.content = child.content;
                              roleOpen.hidden = true;
                              roleOpen.meta = { name: child.meta.name };
                              roleOpen.block = false;
                              const newTokens = [roleOpen];
                              newTokens.push(...role.run({
                                  parentMap: token.map,
                                  content: child.content
                              }));
                              const roleClose = new state.Token("parsed_role_close", "", -1);
                              roleClose.block = false;
                              roleClose.hidden = true;
                              newTokens.push(roleClose);
                              childTokens.push(...newTokens);
                          }
                          catch (err) {
                              const errorToken = new state.Token("role_error", "", 0);
                              errorToken.content = child.content;
                              errorToken.info = child.info;
                              errorToken.meta = child.meta;
                              errorToken.map = child.map;
                              errorToken.meta.error_message = err.message;
                              errorToken.meta.error_name = err.name;
                              childTokens.push(errorToken);
                          }
                      }
                      else {
                          childTokens.push(child);
                      }
                  }
                  token.children = childTokens;
              }
          }
          return true;
      }
      return func;
  }

  class Subscript extends Role {
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
  class Superscript extends Role {
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
  class Abbreviation extends Role {
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
  const html = {
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

  /** The kind of the target as a TargetKind enum ('fig', 'eq', etc.) */
  var TargetKind;
  (function (TargetKind) {
      TargetKind["equation"] = "eq";
      TargetKind["figure"] = "fig";
      TargetKind["table"] = "table";
      TargetKind["code"] = "code";
      TargetKind["section"] = "sec";
  })(TargetKind || (TargetKind = {}));
  /** Safely create the document state for docutils */
  function getDocState(state) {
      var _a, _b;
      const env = (_b = (_a = state.env) === null || _a === void 0 ? void 0 : _a.docutils) !== null && _b !== void 0 ? _b : {};
      if (!env.targets)
          env.targets = {};
      if (!env.references)
          env.references = [];
      if (!env.numbering)
          env.numbering = {};
      if (!state.env.docutils)
          state.env.docutils = env;
      return env;
  }
  /**
   * Safely create a namespaced meta information on a token
   * @param token A markdown-it token that will contain the target
   * @returns An object containing a `Target`
   */
  function getNamespacedMeta(token) {
      var _a, _b;
      const meta = (_b = (_a = token.meta) === null || _a === void 0 ? void 0 : _a.docutils) !== null && _b !== void 0 ? _b : {};
      if (!token.meta)
          token.meta = {};
      if (!token.meta.docutils)
          token.meta.docutils = meta;
      return meta;
  }
  /** Get the next number for an equation, figure, code or table
   *
   * Can input `{ docutils: { numbering: { eq: 100 } } }` to start counting at a different number.
   *
   * @param state MarkdownIt state that will be modified
   */
  function nextNumber(state, kind) {
      const env = getDocState(state);
      if (env.numbering[kind] == null) {
          env.numbering[kind] = 1;
      }
      else {
          env.numbering[kind] += 1;
      }
      return env.numbering[kind];
  }
  /** Create a new internal target.
   *
   * @param state MarkdownIt state that will be modified
   * @param label The reference label that will be normalized and used to associate the target. Note some directives use "name".
   * @param kind The target kind: "eq", "code", "table" or "fig"
   */
  function newTarget(state, token, kind, label, title, silent = false) {
      const env = getDocState(state);
      const number = nextNumber(state, kind);
      const target = {
          label,
          kind,
          number,
          title
      };
      if (!silent) {
          // Put the token in both the token.meta and the central environment
          const meta = getNamespacedMeta(token);
          meta.target = target;
          token.attrSet("id", label);
          // TODO: raise error on duplicates
          env.targets[label] = target;
      }
      return target;
  }
  /**
   * Resolve a reference **in-place** in a following numbering pass.
   *
   * @param state Reference to the state object
   * @param tokens The open/content/close tokens of the reference
   * @param name Name/label/identifier of the target
   * @param opts Includes the reference `kind` and an optional way to create the reference content
   */
  function resolveRefLater(state, tokens, data, opts) {
      var _a;
      tokens.open.meta = (_a = tokens.open.meta) !== null && _a !== void 0 ? _a : {};
      tokens.open.meta.kind = data.kind;
      tokens.open.meta.label = data.label;
      tokens.open.meta.value = data.value;
      const env = getDocState(state);
      env.references.push(Object.assign({ label: data.label, tokens }, opts));
  }

  const REF_PATTERN = /^(.+?)<([^<>]+)>$/; // e.g. 'Labeled Reference <ref>'
  class Eq extends Role {
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
  class NumRef extends Role {
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
  class Ref extends Role {
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
  const references = {
      eq: Eq,
      ref: Ref,
      numref: NumRef
  };

  const rolesDefault = Object.assign(Object.assign(Object.assign(Object.assign({}, main), html), math$1), references);

  /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
  function isNothing(subject) {
    return typeof subject === 'undefined' || subject === null;
  }

  function isObject(subject) {
    return typeof subject === 'object' && subject !== null;
  }

  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];
    return [sequence];
  }

  function extend(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }

  function repeat(string, count) {
    var result = '',
        cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }

  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }

  var isNothing_1 = isNothing;
  var isObject_1 = isObject;
  var toArray_1 = toArray;
  var repeat_1 = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1 = extend;
  var common = {
    isNothing: isNothing_1,
    isObject: isObject_1,
    toArray: toArray_1,
    repeat: repeat_1,
    isNegativeZero: isNegativeZero_1,
    extend: extend_1
  }; // YAML error class. http://stackoverflow.com/questions/8458984

  function formatError(exception, compact) {
    var where = '',
        message = exception.reason || '(unknown reason)';
    if (!exception.mark) return message;

    if (exception.mark.name) {
      where += 'in "' + exception.mark.name + '" ';
    }

    where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

    if (!compact && exception.mark.snippet) {
      where += '\n\n' + exception.mark.snippet;
    }

    return message + ' ' + where;
  }

  function YAMLException$1(reason, mark) {
    // Super constructor
    Error.call(this);
    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false); // Include stack trace in error object

    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = new Error().stack || '';
    }
  } // Inherit from Error


  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;

  YAMLException$1.prototype.toString = function toString(compact) {
    return this.name + ': ' + formatError(this, compact);
  };

  var exception = YAMLException$1; // get snippet for a single line, respecting maxLength

  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    var head = '';
    var tail = '';
    var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

    if (position - lineStart > maxHalfLength) {
      head = ' ... ';
      lineStart = position - maxHalfLength + head.length;
    }

    if (lineEnd - position > maxHalfLength) {
      tail = ' ...';
      lineEnd = position + maxHalfLength - tail.length;
    }

    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
      pos: position - lineStart + head.length // relative position

    };
  }

  function padStart(string, max) {
    return common.repeat(' ', max - string.length) + string;
  }

  function makeSnippet(mark, options) {
    options = Object.create(options || null);
    if (!mark.buffer) return null;
    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent !== 'number') options.indent = 1;
    if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
    if (typeof options.linesAfter !== 'number') options.linesAfter = 2;
    var re = /\r?\n|\r|\0/g;
    var lineStarts = [0];
    var lineEnds = [];
    var match;
    var foundLineNo = -1;

    while (match = re.exec(mark.buffer)) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);

      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }

    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
    var result = '',
        i,
        line;
    var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

    for (i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
      result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n' + result;
    }

    line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
    result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

    for (i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
      result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
    }

    return result.replace(/\n$/, '');
  }

  var snippet = makeSnippet;
  var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'multi', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'representName', 'defaultStyle', 'styleAliases'];
  var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];

  function compileStyleAliases(map) {
    var result = {};

    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }

    return result;
  }

  function Type$1(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    }); // TODO: Add tag format check.

    this.options = options; // keep original options in case user wants to extend this type later

    this.tag = tag;
    this.kind = options['kind'] || null;

    this.resolve = options['resolve'] || function () {
      return true;
    };

    this.construct = options['construct'] || function (data) {
      return data;
    };

    this.instanceOf = options['instanceOf'] || null;
    this.predicate = options['predicate'] || null;
    this.represent = options['represent'] || null;
    this.representName = options['representName'] || null;
    this.defaultStyle = options['defaultStyle'] || null;
    this.multi = options['multi'] || false;
    this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }

  var type = Type$1;
  /*eslint-disable max-len*/

  function compileList(schema, name) {
    var result = [];
    schema[name].forEach(function (currentType) {
      var newIndex = result.length;
      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
          newIndex = previousIndex;
        }
      });
      result[newIndex] = currentType;
    });
    return result;
  }

  function
    /* lists... */
  compileMap() {
    var result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    },
        index,
        length;

    function collectType(type) {
      if (type.multi) {
        result.multi[type.kind].push(type);
        result.multi['fallback'].push(type);
      } else {
        result[type.kind][type.tag] = result['fallback'][type.tag] = type;
      }
    }

    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }

    return result;
  }

  function Schema$1(definition) {
    return this.extend(definition);
  }

  Schema$1.prototype.extend = function extend(definition) {
    var implicit = [];
    var explicit = [];

    if (definition instanceof type) {
      // Schema.extend(type)
      explicit.push(definition);
    } else if (Array.isArray(definition)) {
      // Schema.extend([ type1, type2, ... ])
      explicit = explicit.concat(definition);
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);
    } else {
      throw new exception('Schema.extend argument should be a Type, [ Type ], ' + 'or a schema definition ({ implicit: [...], explicit: [...] })');
    }

    implicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }

      if (type$1.loadKind && type$1.loadKind !== 'scalar') {
        throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }

      if (type$1.multi) {
        throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
      }
    });
    explicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }
    });
    var result = Object.create(Schema$1.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, 'implicit');
    result.compiledExplicit = compileList(result, 'explicit');
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };

  var schema = Schema$1;
  var str = new type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) {
      return data !== null ? data : '';
    }
  });
  var seq = new type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) {
      return data !== null ? data : [];
    }
  });
  var map = new type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) {
      return data !== null ? data : {};
    }
  });
  var failsafe = new schema({
    explicit: [str, seq, map]
  });

  function resolveYamlNull(data) {
    if (data === null) return true;
    var max = data.length;
    return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
  }

  function constructYamlNull() {
    return null;
  }

  function isNull(object) {
    return object === null;
  }

  var _null = new type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () {
        return '~';
      },
      lowercase: function () {
        return 'null';
      },
      uppercase: function () {
        return 'NULL';
      },
      camelcase: function () {
        return 'Null';
      },
      empty: function () {
        return '';
      }
    },
    defaultStyle: 'lowercase'
  });

  function resolveYamlBoolean(data) {
    if (data === null) return false;
    var max = data.length;
    return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
  }

  function constructYamlBoolean(data) {
    return data === 'true' || data === 'True' || data === 'TRUE';
  }

  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }

  var bool = new type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) {
        return object ? 'true' : 'false';
      },
      uppercase: function (object) {
        return object ? 'TRUE' : 'FALSE';
      },
      camelcase: function (object) {
        return object ? 'True' : 'False';
      }
    },
    defaultStyle: 'lowercase'
  });

  function isHexCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    || 0x41
    /* A */
    <= c && c <= 0x46
    /* F */
    || 0x61
    /* a */
    <= c && c <= 0x66
    /* f */
    ;
  }

  function isOctCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x37
    /* 7 */
    ;
  }

  function isDecCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ;
  }

  function resolveYamlInteger(data) {
    if (data === null) return false;
    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;
    if (!max) return false;
    ch = data[index]; // sign

    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }

    if (ch === '0') {
      // 0
      if (index + 1 === max) return true;
      ch = data[++index]; // base 2, base 8, base 16

      if (ch === 'b') {
        // base 2
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }

      if (ch === 'x') {
        // base 16
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }

      if (ch === 'o') {
        // base 8
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }
    } // base 10 (except 0)
    // value should not start with `_`;


    if (ch === '_') return false;

    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;

      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }

      hasDigits = true;
    } // Should have digits and should not end with `_`


    if (!hasDigits || ch === '_') return false;
    return true;
  }

  function constructYamlInteger(data) {
    var value = data,
        sign = 1,
        ch;

    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }

    ch = value[0];

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }

    if (value === '0') return 0;

    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
      if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
    }

    return sign * parseInt(value, 10);
  }

  function isInteger(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
  }

  var int$1 = new type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function (obj) {
        return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1);
      },
      octal: function (obj) {
        return obj >= 0 ? '0o' + obj.toString(8) : '-0o' + obj.toString(8).slice(1);
      },
      decimal: function (obj) {
        return obj.toString(10);
      },

      /* eslint-disable max-len */
      hexadecimal: function (obj) {
        return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() : '-0x' + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary: [2, 'bin'],
      octal: [8, 'oct'],
      decimal: [10, 'dec'],
      hexadecimal: [16, 'hex']
    }
  });
  var YAML_FLOAT_PATTERN = new RegExp( // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' + // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' + // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' + // .nan
  '|\\.(?:nan|NaN|NAN))$');

  function resolveYamlFloat(data) {
    if (data === null) return false;

    if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    data[data.length - 1] === '_') {
      return false;
    }

    return true;
  }

  function constructYamlFloat(data) {
    var value, sign;
    value = data.replace(/_/g, '').toLowerCase();
    sign = value[0] === '-' ? -1 : 1;

    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }

    if (value === '.inf') {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === '.nan') {
      return NaN;
    }

    return sign * parseFloat(value, 10);
  }

  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

  function representYamlFloat(object, style) {
    var res;

    if (isNaN(object)) {
      switch (style) {
        case 'lowercase':
          return '.nan';

        case 'uppercase':
          return '.NAN';

        case 'camelcase':
          return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '.inf';

        case 'uppercase':
          return '.INF';

        case 'camelcase':
          return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '-.inf';

        case 'uppercase':
          return '-.INF';

        case 'camelcase':
          return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }

    res = object.toString(10); // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack

    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }

  function isFloat(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
  }

  var float = new type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });
  var json = failsafe.extend({
    implicit: [_null, bool, int$1, float]
  });
  var core = json;
  var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9])' + // [2] month
  '-([0-9][0-9])$'); // [3] day

  var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9]?)' + // [2] month
  '-([0-9][0-9]?)' + // [3] day
  '(?:[Tt]|[ \\t]+)' + // ...
  '([0-9][0-9]?)' + // [4] hour
  ':([0-9][0-9])' + // [5] minute
  ':([0-9][0-9])' + // [6] second
  '(?:\\.([0-9]*))?' + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$'); // [11] tz_minute

  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }

  function constructYamlTimestamp(data) {
    var match,
        year,
        month,
        day,
        hour,
        minute,
        second,
        fraction = 0,
        delta = null,
        tz_hour,
        tz_minute,
        date;
    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error('Date resolve error'); // match: [1] year [2] month [3] day

    year = +match[1];
    month = +match[2] - 1; // JS month starts with 0

    day = +match[3];

    if (!match[4]) {
      // no hour
      return new Date(Date.UTC(year, month, day));
    } // match: [4] hour [5] minute [6] second [7] fraction


    hour = +match[4];
    minute = +match[5];
    second = +match[6];

    if (match[7]) {
      fraction = match[7].slice(0, 3);

      while (fraction.length < 3) {
        // milli-seconds
        fraction += '0';
      }

      fraction = +fraction;
    } // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute


    if (match[9]) {
      tz_hour = +match[10];
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds

      if (match[9] === '-') delta = -delta;
    }

    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }

  function representYamlTimestamp(object
  /*, style*/
  ) {
    return object.toISOString();
  }

  var timestamp = new type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });

  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }

  var merge = new type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });
  /*eslint-disable no-bitwise*/
  // [ 64, 65, 66 ] -> [ padding, CR, LF ]

  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';

  function resolveYamlBinary(data) {
    if (data === null) return false;
    var code,
        idx,
        bitlen = 0,
        max = data.length,
        map = BASE64_MAP; // Convert one by one.

    for (idx = 0; idx < max; idx++) {
      code = map.indexOf(data.charAt(idx)); // Skip CR/LF

      if (code > 64) continue; // Fail on illegal characters

      if (code < 0) return false;
      bitlen += 6;
    } // If there are any bits left, source was corrupted


    return bitlen % 8 === 0;
  }

  function constructYamlBinary(data) {
    var idx,
        tailbits,
        input = data.replace(/[\r\n=]/g, ''),
        // remove CR/LF & padding to simplify scan
    max = input.length,
        map = BASE64_MAP,
        bits = 0,
        result = []; // Collect by 6*4 bits (3 bytes)

    for (idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 0xFF);
        result.push(bits >> 8 & 0xFF);
        result.push(bits & 0xFF);
      }

      bits = bits << 6 | map.indexOf(input.charAt(idx));
    } // Dump tail


    tailbits = max % 4 * 6;

    if (tailbits === 0) {
      result.push(bits >> 16 & 0xFF);
      result.push(bits >> 8 & 0xFF);
      result.push(bits & 0xFF);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 0xFF);
      result.push(bits >> 2 & 0xFF);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 0xFF);
    }

    return new Uint8Array(result);
  }

  function representYamlBinary(object
  /*, style*/
  ) {
    var result = '',
        bits = 0,
        idx,
        tail,
        max = object.length,
        map = BASE64_MAP; // Convert every three bytes to 4 ASCII characters.

    for (idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map[bits >> 18 & 0x3F];
        result += map[bits >> 12 & 0x3F];
        result += map[bits >> 6 & 0x3F];
        result += map[bits & 0x3F];
      }

      bits = (bits << 8) + object[idx];
    } // Dump tail


    tail = max % 3;

    if (tail === 0) {
      result += map[bits >> 18 & 0x3F];
      result += map[bits >> 12 & 0x3F];
      result += map[bits >> 6 & 0x3F];
      result += map[bits & 0x3F];
    } else if (tail === 2) {
      result += map[bits >> 10 & 0x3F];
      result += map[bits >> 4 & 0x3F];
      result += map[bits << 2 & 0x3F];
      result += map[64];
    } else if (tail === 1) {
      result += map[bits >> 2 & 0x3F];
      result += map[bits << 4 & 0x3F];
      result += map[64];
      result += map[64];
    }

    return result;
  }

  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === '[object Uint8Array]';
  }

  var binary = new type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2 = Object.prototype.toString;

  function resolveYamlOmap(data) {
    if (data === null) return true;
    var objectKeys = [],
        index,
        length,
        pair,
        pairKey,
        pairHasKey,
        object = data;

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;
      if (_toString$2.call(pair) !== '[object Object]') return false;

      for (pairKey in pair) {
        if (_hasOwnProperty$3.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;else return false;
        }
      }

      if (!pairHasKey) return false;
      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
    }

    return true;
  }

  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }

  var omap = new type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  var _toString$1 = Object.prototype.toString;

  function resolveYamlPairs(data) {
    if (data === null) return true;
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      if (_toString$1.call(pair) !== '[object Object]') return false;
      keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }

    return true;
  }

  function constructYamlPairs(data) {
    if (data === null) return [];
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }

    return result;
  }

  var pairs = new type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function resolveYamlSet(data) {
    if (data === null) return true;
    var key,
        object = data;

    for (key in object) {
      if (_hasOwnProperty$2.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }

    return true;
  }

  function constructYamlSet(data) {
    return data !== null ? data : {};
  }

  var set = new type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });

  var _default = core.extend({
    implicit: [timestamp, merge],
    explicit: [binary, omap, pairs, set]
  });
  /*eslint-disable max-len,no-use-before-define*/


  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }

  function is_EOL(c) {
    return c === 0x0A
    /* LF */
    || c === 0x0D
    /* CR */
    ;
  }

  function is_WHITE_SPACE(c) {
    return c === 0x09
    /* Tab */
    || c === 0x20
    /* Space */
    ;
  }

  function is_WS_OR_EOL(c) {
    return c === 0x09
    /* Tab */
    || c === 0x20
    /* Space */
    || c === 0x0A
    /* LF */
    || c === 0x0D
    /* CR */
    ;
  }

  function is_FLOW_INDICATOR(c) {
    return c === 0x2C
    /* , */
    || c === 0x5B
    /* [ */
    || c === 0x5D
    /* ] */
    || c === 0x7B
    /* { */
    || c === 0x7D
    /* } */
    ;
  }

  function fromHexCode(c) {
    var lc;

    if (0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ) {
      return c - 0x30;
    }
    /*eslint-disable no-bitwise*/


    lc = c | 0x20;

    if (0x61
    /* a */
    <= lc && lc <= 0x66
    /* f */
    ) {
      return lc - 0x61 + 10;
    }

    return -1;
  }

  function escapedHexLen(c) {
    if (c === 0x78
    /* x */
    ) {
      return 2;
    }

    if (c === 0x75
    /* u */
    ) {
      return 4;
    }

    if (c === 0x55
    /* U */
    ) {
      return 8;
    }

    return 0;
  }

  function fromDecimalCode(c) {
    if (0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ) {
      return c - 0x30;
    }

    return -1;
  }

  function simpleEscapeSequence(c) {
    /* eslint-disable indent */
    return c === 0x30
    /* 0 */
    ? '\x00' : c === 0x61
    /* a */
    ? '\x07' : c === 0x62
    /* b */
    ? '\x08' : c === 0x74
    /* t */
    ? '\x09' : c === 0x09
    /* Tab */
    ? '\x09' : c === 0x6E
    /* n */
    ? '\x0A' : c === 0x76
    /* v */
    ? '\x0B' : c === 0x66
    /* f */
    ? '\x0C' : c === 0x72
    /* r */
    ? '\x0D' : c === 0x65
    /* e */
    ? '\x1B' : c === 0x20
    /* Space */
    ? ' ' : c === 0x22
    /* " */
    ? '\x22' : c === 0x2F
    /* / */
    ? '/' : c === 0x5C
    /* \ */
    ? '\x5C' : c === 0x4E
    /* N */
    ? '\x85' : c === 0x5F
    /* _ */
    ? '\xA0' : c === 0x4C
    /* L */
    ? '\u2028' : c === 0x50
    /* P */
    ? '\u2029' : '';
  }

  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    } // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF


    return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
  }

  var simpleEscapeCheck = new Array(256); // integer, for fast access

  var simpleEscapeMap = new Array(256);

  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }

  function State$1(input, options) {
    this.input = input;
    this.filename = options['filename'] || null;
    this.schema = options['schema'] || _default;
    this.onWarning = options['onWarning'] || null; // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
    // if such documents have no explicit %YAML directive

    this.legacy = options['legacy'] || false;
    this.json = options['json'] || false;
    this.listener = options['listener'] || null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0; // position of first leading tab in the current line,
    // used to make sure there are no tabs in the indentation

    this.firstTabInLine = -1;
    this.documents = [];
    /*
    this.version;
    this.checkLineBreaks;
    this.tagMap;
    this.anchorMap;
    this.tag;
    this.anchor;
    this.kind;
    this.result;*/
  }

  function generateError(state, message) {
    var mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      // omit trailing \0
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = snippet(mark);
    return new exception(message, mark);
  }

  function throwError(state, message) {
    throw generateError(state, message);
  }

  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }

  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      var match, major, minor;

      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = minor < 2;

      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      var handle, prefix;

      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty$1.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, 'tag prefix is malformed: ' + prefix);
      }

      state.tagMap[handle] = prefix;
    }
  };

  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;

    if (start < end) {
      _result = state.input.slice(start, end);

      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);

          if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }

      state.result += _result;
    }
  }

  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;

    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }

    sourceKeys = Object.keys(source);

    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];

      if (!_hasOwnProperty$1.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }

  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    var index, quantity; // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).

    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);

      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, 'nested arrays are not supported inside keys');
        }

        if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
          keyNode[index] = '[object Object]';
        }
      }
    } // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)


    if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
      keyNode = '[object Object]';
    }

    keyNode = String(keyNode);

    if (_result === null) {
      _result = {};
    }

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      } // used for this specific key only because Object.defineProperty is slow


      if (keyNode === '__proto__') {
        Object.defineProperty(_result, keyNode, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: valueNode
        });
      } else {
        _result[keyNode] = valueNode;
      }

      delete overridableKeys[keyNode];
    }

    return _result;
  }

  function readLineBreak(state) {
    var ch;
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x0A
    /* LF */
    ) {
      state.position++;
    } else if (ch === 0x0D
    /* CR */
    ) {
      state.position++;

      if (state.input.charCodeAt(state.position) === 0x0A
      /* LF */
      ) {
        state.position++;
      }
    } else {
      throwError(state, 'a line break is expected');
    }

    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }

  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        if (ch === 0x09
        /* Tab */
        && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }

        ch = state.input.charCodeAt(++state.position);
      }

      if (allowComments && ch === 0x23
      /* # */
      ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A
        /* LF */
        && ch !== 0x0D
        /* CR */
        && ch !== 0);
      }

      if (is_EOL(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;

        while (ch === 0x20
        /* Space */
        ) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }

    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }

    return lineBreaks;
  }

  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;
    ch = state.input.charCodeAt(_position); // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.

    if ((ch === 0x2D
    /* - */
    || ch === 0x2E
    /* . */
    ) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);

      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }

    return false;
  }

  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }

  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23
    /* # */
    || ch === 0x26
    /* & */
    || ch === 0x2A
    /* * */
    || ch === 0x21
    /* ! */
    || ch === 0x7C
    /* | */
    || ch === 0x3E
    /* > */
    || ch === 0x27
    /* ' */
    || ch === 0x22
    /* " */
    || ch === 0x25
    /* % */
    || ch === 0x40
    /* @ */
    || ch === 0x60
    /* ` */
    ) {
      return false;
    }

    if (ch === 0x3F
    /* ? */
    || ch === 0x2D
    /* - */
    ) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }

    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;

    while (ch !== 0) {
      if (ch === 0x3A
      /* : */
      ) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }
      } else if (ch === 0x23
      /* # */
      ) {
        preceding = state.input.charCodeAt(state.position - 1);

        if (is_WS_OR_EOL(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;
      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);

        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }

      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }

      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, captureEnd, false);

    if (state.result) {
      return true;
    }

    state.kind = _kind;
    state.result = _result;
    return false;
  }

  function readSingleQuotedScalar(state, nodeIndent) {
    var ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x27
    /* ' */
    ) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27
      /* ' */
      ) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (ch === 0x27
        /* ' */
        ) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }

  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x22
    /* " */
    ) {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22
      /* " */
      ) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 0x5C
      /* \ */
      ) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);

        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent); // TODO: rework to inline fn with no type cast?
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;

          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);

            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }

          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, 'unknown escape sequence');
        }

        captureStart = captureEnd = state.position;
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }

  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _lineStart,
        _pos,
        _tag = state.tag,
        _result,
        _anchor = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = Object.create(null),
        keyNode,
        keyTag,
        valueNode,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x5B
    /* [ */
    ) {
      terminator = 0x5D;
      /* ] */

      isMapping = false;
      _result = [];
    } else if (ch === 0x7B
    /* { */
    ) {
      terminator = 0x7D;
      /* } */

      isMapping = true;
      _result = {};
    } else {
      return false;
    }

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(++state.position);

    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      } else if (ch === 0x2C
      /* , */
      ) {
        // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
        throwError(state, "expected the node content, but found ','");
      }

      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;

      if (ch === 0x3F
      /* ? */
      ) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }

      _line = state.line; // Save the current line.

      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if ((isExplicitPair || state.line === _line) && ch === 0x3A
      /* : */
      ) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }

      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }

      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if (ch === 0x2C
      /* , */
      ) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }

    throwError(state, 'unexpected end of the stream within a flow collection');
  }

  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent = nodeIndent,
        emptyLines = 0,
        atMoreIndented = false,
        tmp,
        ch;
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x7C
    /* | */
    ) {
      folding = false;
    } else if (ch === 0x3E
    /* > */
    ) {
      folding = true;
    } else {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';

    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x2B
      /* + */
      || ch === 0x2D
      /* - */
      ) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 0x2B
          /* + */
          ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }
      } else {
        break;
      }
    }

    if (is_WHITE_SPACE(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (is_WHITE_SPACE(ch));

      if (ch === 0x23
      /* # */
      ) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!is_EOL(ch) && ch !== 0);
      }
    }

    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);

      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20
      /* Space */
      ) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }

      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      } // End of the scalar.


      if (state.lineIndent < textIndent) {
        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            // i.e. only if the scalar is not empty.
            state.result += '\n';
          }
        } // Break this `while` cycle and go to the funciton's epilogue.


        break;
      } // Folded style: use fancy rules to handle line breaks.


      if (folding) {
        // Lines starting with white space characters (more-indented lines) are not folded.
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true; // except for the first content line (cf. Example 8.1)

          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines); // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1); // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) {
            // i.e. only if we have already read some scalar content.
            state.result += ' ';
          } // Several line breaks - perceive as different lines.

        } else {
          state.result += common.repeat('\n', emptyLines);
        } // Literal style: just add exact number of line breaks between content lines.

      } else {
        // Keep all line breaks except the header line break.
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }

      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;

      while (!is_EOL(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, state.position, false);
    }

    return true;
  }

  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = [],
        following,
        detected = false,
        ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar


    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      if (ch !== 0x2D
      /* - */
      ) {
        break;
      }

      following = state.input.charCodeAt(state.position + 1);

      if (!is_WS_OR_EOL(following)) {
        break;
      }

      detected = true;
      state.position++;

      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);

          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);

      _result.push(state.result);

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);

      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }

    return false;
  }

  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _keyLine,
        _keyLineStart,
        _keyPos,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = {},
        overridableKeys = Object.create(null),
        keyTag = null,
        keyNode = null,
        valueNode = null,
        atExplicitKey = false,
        detected = false,
        ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar


    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      following = state.input.charCodeAt(state.position + 1);
      _line = state.line; // Save the current line.
      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //

      if ((ch === 0x3F
      /* ? */
      || ch === 0x3A
      /* : */
      ) && is_WS_OR_EOL(following)) {
        if (ch === 0x3F
        /* ? */
        ) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
        }

        state.position += 1;
        ch = following; //
        // Implicit notation case. Flow-style node as the key first, then ":", and the value.
        //
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;

        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          // Neither implicit nor explicit notation.
          // Reading is done. Go to the epilogue.
          break;
        }

        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);

          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x3A
          /* : */
          ) {
            ch = state.input.charCodeAt(++state.position);

            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }

            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }
        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      } //
      // Common reading code for both explicit and implicit notations.
      //


      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }

        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }

        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }

      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    } //
    // Epilogue.
    //
    // Special case: last mapping's node contains only the key in explicit notation.


    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    } // Expose the resulting mapping.


    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }

    return detected;
  }

  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed = false,
        tagHandle,
        tagName,
        ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x21
    /* ! */
    ) return false;

    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }

    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x3C
    /* < */
    ) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 0x21
    /* ! */
    ) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = '!';
    }

    _position = state.position;

    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 0x3E
      /* > */
      );

      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        if (ch === 0x21
        /* ! */
        ) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);

            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }

            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }

        ch = state.input.charCodeAt(++state.position);
      }

      tagName = state.input.slice(_position, state.position);

      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }

    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }

    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, 'tag name is malformed: ' + tagName);
    }

    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;
    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }

    return true;
  }

  function readAnchorProperty(state) {
    var _position, ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x26
    /* & */
    ) return false;

    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }

    state.anchor = state.input.slice(_position, state.position);
    return true;
  }

  function readAlias(state) {
    var _position, alias, ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x2A
    /* * */
    ) return false;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }

    alias = state.input.slice(_position, state.position);

    if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }

    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }

  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1,
        // 1: this>parent, 0: this=parent, -1: this<parent
    atNewLine = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        typeList,
        type,
        flowIndent,
        blockIndent;

    if (state.listener !== null) {
      state.listener('open', state);
    }

    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;

    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }

    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }

    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }

    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }

      blockIndent = state.position - state.lineStart;

      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;

            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;

            if (state.tag === null) {
              state.tag = '?';
            }
          }

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }

    if (state.tag === null) {
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    } else if (state.tag === '?') {
      // Implicit resolving is not allowed for non-scalar types, and '?'
      // non-specific tag is only automatically assigned to plain scalars.
      //
      // We only need to check kind conformity in case user explicitly assigns '?'
      // tag, for example like this: "!<?> [0]"
      //
      if (state.result !== null && state.kind !== 'scalar') {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }

      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        if (type.resolve(state.result)) {
          // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }

          break;
        }
      }
    } else if (state.tag !== '!') {
      if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];
      } else {
        // looking for multi type
        type = null;
        typeList = state.typeMap.multi[state.kind || 'fallback'];

        for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type = typeList[typeIndex];
            break;
          }
        }
      }

      if (!type) {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result, state.tag)) {
        // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result, state.tag);

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    }

    if (state.listener !== null) {
      state.listener('close', state);
    }

    return state.tag !== null || state.anchor !== null || hasContent;
  }

  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;

    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = Object.create(null);
    state.anchorMap = Object.create(null);

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);

      if (state.lineIndent > 0 || ch !== 0x25
      /* % */
      ) {
        break;
      }

      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];

      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x23
        /* # */
        ) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !is_EOL(ch));

          break;
        }

        if (is_EOL(ch)) break;
        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveArgs.push(state.input.slice(_position, state.position));
      }

      if (ch !== 0) readLineBreak(state);

      if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }

    skipSeparationSpace(state, true, -1);

    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D
    /* - */
    && state.input.charCodeAt(state.position + 1) === 0x2D
    /* - */
    && state.input.charCodeAt(state.position + 2) === 0x2D
    /* - */
    ) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }

    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);

    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }

    state.documents.push(state.result);

    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 0x2E
      /* . */
      ) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }

      return;
    }

    if (state.position < state.length - 1) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }

  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};

    if (input.length !== 0) {
      // Add tailing `\n` if not exists
      if (input.charCodeAt(input.length - 1) !== 0x0A
      /* LF */
      && input.charCodeAt(input.length - 1) !== 0x0D
      /* CR */
      ) {
        input += '\n';
      } // Strip BOM


      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }

    var state = new State$1(input, options);
    var nullpos = input.indexOf('\0');

    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, 'null byte is not allowed in input');
    } // Use 0 as string terminator. That significantly simplifies bounds check.


    state.input += '\0';

    while (state.input.charCodeAt(state.position) === 0x20
    /* Space */
    ) {
      state.lineIndent += 1;
      state.position += 1;
    }

    while (state.position < state.length - 1) {
      readDocument(state);
    }

    return state.documents;
  }

  function loadAll$1(input, iterator, options) {
    if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    var documents = loadDocuments(input, options);

    if (typeof iterator !== 'function') {
      return documents;
    }

    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }

  function load$1(input, options) {
    var documents = loadDocuments(input, options);

    if (documents.length === 0) {
      /*eslint-disable no-undefined*/
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }

    throw new exception('expected a single document in the stream, but found more');
  }

  var loadAll_1 = loadAll$1;
  var load_1 = load$1;
  var loader = {
    loadAll: loadAll_1,
    load: load_1
  };
  /*eslint-disable no-use-before-define*/

  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CHAR_BOM = 0xFEFF;
  var CHAR_TAB = 0x09;
  /* Tab */

  var CHAR_LINE_FEED = 0x0A;
  /* LF */

  var CHAR_CARRIAGE_RETURN = 0x0D;
  /* CR */

  var CHAR_SPACE = 0x20;
  /* Space */

  var CHAR_EXCLAMATION = 0x21;
  /* ! */

  var CHAR_DOUBLE_QUOTE = 0x22;
  /* " */

  var CHAR_SHARP = 0x23;
  /* # */

  var CHAR_PERCENT = 0x25;
  /* % */

  var CHAR_AMPERSAND = 0x26;
  /* & */

  var CHAR_SINGLE_QUOTE = 0x27;
  /* ' */

  var CHAR_ASTERISK = 0x2A;
  /* * */

  var CHAR_COMMA = 0x2C;
  /* , */

  var CHAR_MINUS = 0x2D;
  /* - */

  var CHAR_COLON = 0x3A;
  /* : */

  var CHAR_EQUALS = 0x3D;
  /* = */

  var CHAR_GREATER_THAN = 0x3E;
  /* > */

  var CHAR_QUESTION = 0x3F;
  /* ? */

  var CHAR_COMMERCIAL_AT = 0x40;
  /* @ */

  var CHAR_LEFT_SQUARE_BRACKET = 0x5B;
  /* [ */

  var CHAR_RIGHT_SQUARE_BRACKET = 0x5D;
  /* ] */

  var CHAR_GRAVE_ACCENT = 0x60;
  /* ` */

  var CHAR_LEFT_CURLY_BRACKET = 0x7B;
  /* { */

  var CHAR_VERTICAL_LINE = 0x7C;
  /* | */

  var CHAR_RIGHT_CURLY_BRACKET = 0x7D;
  /* } */

  var ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0x00] = '\\0';
  ESCAPE_SEQUENCES[0x07] = '\\a';
  ESCAPE_SEQUENCES[0x08] = '\\b';
  ESCAPE_SEQUENCES[0x09] = '\\t';
  ESCAPE_SEQUENCES[0x0A] = '\\n';
  ESCAPE_SEQUENCES[0x0B] = '\\v';
  ESCAPE_SEQUENCES[0x0C] = '\\f';
  ESCAPE_SEQUENCES[0x0D] = '\\r';
  ESCAPE_SEQUENCES[0x1B] = '\\e';
  ESCAPE_SEQUENCES[0x22] = '\\"';
  ESCAPE_SEQUENCES[0x5C] = '\\\\';
  ESCAPE_SEQUENCES[0x85] = '\\N';
  ESCAPE_SEQUENCES[0xA0] = '\\_';
  ESCAPE_SEQUENCES[0x2028] = '\\L';
  ESCAPE_SEQUENCES[0x2029] = '\\P';
  var DEPRECATED_BOOLEANS_SYNTAX = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'];
  var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

  function compileStyleMap(schema, map) {
    var result, keys, index, length, tag, style, type;
    if (map === null) return {};
    result = {};
    keys = Object.keys(map);

    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map[tag]);

      if (tag.slice(0, 2) === '!!') {
        tag = 'tag:yaml.org,2002:' + tag.slice(2);
      }

      type = schema.compiledTypeMap['fallback'][tag];

      if (type && _hasOwnProperty.call(type.styleAliases, style)) {
        style = type.styleAliases[style];
      }

      result[tag] = style;
    }

    return result;
  }

  function encodeHex(character) {
    var string, handle, length;
    string = character.toString(16).toUpperCase();

    if (character <= 0xFF) {
      handle = 'x';
      length = 2;
    } else if (character <= 0xFFFF) {
      handle = 'u';
      length = 4;
    } else if (character <= 0xFFFFFFFF) {
      handle = 'U';
      length = 8;
    } else {
      throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
    }

    return '\\' + handle + common.repeat('0', length - string.length) + string;
  }

  var QUOTING_TYPE_SINGLE = 1,
      QUOTING_TYPE_DOUBLE = 2;

  function State(options) {
    this.schema = options['schema'] || _default;
    this.indent = Math.max(1, options['indent'] || 2);
    this.noArrayIndent = options['noArrayIndent'] || false;
    this.skipInvalid = options['skipInvalid'] || false;
    this.flowLevel = common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'];
    this.styleMap = compileStyleMap(this.schema, options['styles'] || null);
    this.sortKeys = options['sortKeys'] || false;
    this.lineWidth = options['lineWidth'] || 80;
    this.noRefs = options['noRefs'] || false;
    this.noCompatMode = options['noCompatMode'] || false;
    this.condenseFlow = options['condenseFlow'] || false;
    this.quotingType = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
    this.forceQuotes = options['forceQuotes'] || false;
    this.replacer = typeof options['replacer'] === 'function' ? options['replacer'] : null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = '';
    this.duplicates = [];
    this.usedDuplicates = null;
  } // Indents every line in a string. Empty lines (\n only) are not indented.


  function indentString(string, spaces) {
    var ind = common.repeat(' ', spaces),
        position = 0,
        next = -1,
        result = '',
        line,
        length = string.length;

    while (position < length) {
      next = string.indexOf('\n', position);

      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }

      if (line.length && line !== '\n') result += ind;
      result += line;
    }

    return result;
  }

  function generateNextLine(state, level) {
    return '\n' + common.repeat(' ', state.indent * level);
  }

  function testImplicitResolving(state, str) {
    var index, length, type;

    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type = state.implicitTypes[index];

      if (type.resolve(str)) {
        return true;
      }
    }

    return false;
  } // [33] s-white ::= s-space | s-tab


  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  } // Returns true if the character can be printed without escaping.
  // From YAML 1.2: "any allowed characters known to be non-printable
  // should also be escaped. [However,] This isn’t mandatory"
  // Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.


  function isPrintable(c) {
    return 0x00020 <= c && c <= 0x00007E || 0x000A1 <= c && c <= 0x00D7FF && c !== 0x2028 && c !== 0x2029 || 0x0E000 <= c && c <= 0x00FFFD && c !== CHAR_BOM || 0x10000 <= c && c <= 0x10FFFF;
  } // [34] ns-char ::= nb-char - s-white
  // [27] nb-char ::= c-printable - b-char - c-byte-order-mark
  // [26] b-char  ::= b-line-feed | b-carriage-return
  // Including s-white (for some reason, examples doesn't match specs in this aspect)
  // ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark


  function isNsCharOrWhitespace(c) {
    return isPrintable(c) && c !== CHAR_BOM // - b-char
    && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
  } // [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
  //                             c = flow-in   ⇒ ns-plain-safe-in
  //                             c = block-key ⇒ ns-plain-safe-out
  //                             c = flow-key  ⇒ ns-plain-safe-in
  // [128] ns-plain-safe-out ::= ns-char
  // [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
  // [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
  //                            | ( /* An ns-char preceding */ “#” )
  //                            | ( “:” /* Followed by an ns-plain-safe(c) */ )


  function isPlainSafe(c, prev, inblock) {
    var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
    var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
    return ( // ns-plain-safe
    inblock ? // c = flow-in
    cIsNsCharOrWhitespace : cIsNsCharOrWhitespace // - c-flow-indicator
    && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET // ns-plain-char
    ) && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP // change to true on '[^ ]#'
    || prev === CHAR_COLON && cIsNsChar; // change to true on ':[^ ]'
  } // Simplified test for values allowed as the first character in plain style.


  function isPlainSafeFirst(c) {
    // Uses a subset of ns-char - c-indicator
    // where ns-char = nb-char - s-white.
    // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
    return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  } // Simplified test for values allowed as the last character in plain style.


  function isPlainSafeLast(c) {
    // just not whitespace or colon, it will be checked to be plain character later
    return !isWhitespace(c) && c !== CHAR_COLON;
  } // Same as 'string'.codePointAt(pos), but works in older browsers.


  function codePointAt(string, pos) {
    var first = string.charCodeAt(pos),
        second;

    if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
      second = string.charCodeAt(pos + 1);

      if (second >= 0xDC00 && second <= 0xDFFF) {
        // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
        return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
      }
    }

    return first;
  } // Determines whether block indentation indicator is required.


  function needIndentIndicator(string) {
    var leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
  }

  var STYLE_PLAIN = 1,
      STYLE_SINGLE = 2,
      STYLE_LITERAL = 3,
      STYLE_FOLDED = 4,
      STYLE_DOUBLE = 5; // Determines which scalar styles are possible and returns the preferred style.
  // lineWidth = -1 => no limit.
  // Pre-conditions: str.length > 0.
  // Post-conditions:
  //    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
  //    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
  //    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).

  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
    var i;
    var char = 0;
    var prevChar = null;
    var hasLineBreak = false;
    var hasFoldableLine = false; // only checked if shouldTrackWidth

    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1; // count the first line correctly

    var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));

    if (singleLineOnly || forceQuotes) {
      // Case: no block styles.
      // Check for disallowed characters to rule out plain and single.
      for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
        char = codePointAt(string, i);

        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }

        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      }
    } else {
      // Case: block styles permitted.
      for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
        char = codePointAt(string, i);

        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true; // Check if any line can be folded.

          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
            i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }

        plain = plain && isPlainSafe(char, prevChar, inblock);
        prevChar = char;
      } // in case the end is missing a \n


      hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
    } // Although every style can represent \n without escaping, prefer block styles
    // for multiline, since they're more readable and they don't add empty lines.
    // Also prefer folding a super-long line.


    if (!hasLineBreak && !hasFoldableLine) {
      // Strings interpretable as another type have to be quoted;
      // e.g. the string 'true' vs. the boolean true.
      if (plain && !forceQuotes && !testAmbiguousType(string)) {
        return STYLE_PLAIN;
      }

      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    } // Edge case: block indentation indicator can only have one digit.


    if (indentPerLevel > 9 && needIndentIndicator(string)) {
      return STYLE_DOUBLE;
    } // At this point we know block styles are valid.
    // Prefer literal style unless we want to fold.


    if (!forceQuotes) {
      return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
    }

    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  } // Note: line breaking/folding is implemented for only the folded style.
  // NB. We drop the last trailing newline (if any) of a returned block scalar
  //  since the dumper adds its own newline. This always works:
  //    • No ending newline => unaffected; already using strip "-" chomping.
  //    • Ending newline    => removed then restored.
  //  Importantly, this keeps the "+" chomp indicator from gaining an extra line.


  function writeScalar(state, string, level, iskey, inblock) {
    state.dump = function () {
      if (string.length === 0) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
      }

      if (!state.noCompatMode) {
        if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
        }
      }

      var indent = state.indent * Math.max(1, level); // no 0-indent scalars
      // As indentation gets deeper, let the width decrease monotonically
      // to the lower bound min(state.lineWidth, 40).
      // Note that this implies
      //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
      //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
      // This behaves better than a constant minimum width which disallows narrower options,
      // or an indent threshold which causes the width to suddenly increase.

      var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent); // Without knowing if keys are implicit/explicit, assume implicit for safety.

      var singleLineOnly = iskey // No block styles in flow mode.
      || state.flowLevel > -1 && level >= state.flowLevel;

      function testAmbiguity(string) {
        return testImplicitResolving(state, string);
      }

      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
        case STYLE_PLAIN:
          return string;

        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";

        case STYLE_LITERAL:
          return '|' + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));

        case STYLE_FOLDED:
          return '>' + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));

        case STYLE_DOUBLE:
          return '"' + escapeString(string) + '"';

        default:
          throw new exception('impossible error: invalid scalar style');
      }
    }();
  } // Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.


  function blockHeader(string, indentPerLevel) {
    var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : ''; // note the special case: the string '\n' counts as a "trailing" empty line.

    var clip = string[string.length - 1] === '\n';
    var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
    var chomp = keep ? '+' : clip ? '' : '-';
    return indentIndicator + chomp + '\n';
  } // (See the note for writeScalar.)


  function dropEndingNewline(string) {
    return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
  } // Note: a long line without a suitable break point will exceed the width limit.
  // Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.


  function foldString(string, width) {
    // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
    // unless they're before or after a more-indented line, or at the very
    // beginning or end, in which case $k$ maps to $k$.
    // Therefore, parse each chunk as newline(s) followed by a content line.
    var lineRe = /(\n+)([^\n]*)/g; // first line (possibly an empty line)

    var result = function () {
      var nextLF = string.indexOf('\n');
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    }(); // If we haven't reached the first content line yet, don't add an extra \n.


    var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
    var moreIndented; // rest of the lines

    var match;

    while (match = lineRe.exec(string)) {
      var prefix = match[1],
          line = match[2];
      moreIndented = line[0] === ' ';
      result += prefix + (!prevMoreIndented && !moreIndented && line !== '' ? '\n' : '') + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }

    return result;
  } // Greedy line breaking.
  // Picks the longest line under the limit each time,
  // otherwise settles for the shortest line over the limit.
  // NB. More-indented lines *cannot* be folded, as that would add an extra \n.


  function foldLine(line, width) {
    if (line === '' || line[0] === ' ') return line; // Since a more-indented line adds a \n, breaks can't be followed by a space.

    var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.

    var match; // start is an inclusive index. end, curr, and next are exclusive.

    var start = 0,
        end,
        curr = 0,
        next = 0;
    var result = ''; // Invariants: 0 <= start <= length-1.
    //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
    // Inside the loop:
    //   A match implies length >= 2, so curr and next are <= length-2.

    while (match = breakRe.exec(line)) {
      next = match.index; // maintain invariant: curr - start <= width

      if (next - start > width) {
        end = curr > start ? curr : next; // derive end <= length-2

        result += '\n' + line.slice(start, end); // skip the space that was output as \n

        start = end + 1; // derive start <= length-1
      }

      curr = next;
    } // By the invariants, start <= length-1, so there is something left over.
    // It is either the whole string or a part starting from non-whitespace.


    result += '\n'; // Insert a break if the remainder is too long and there is a break available.

    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }

    return result.slice(1); // drop extra \n joiner
  } // Escapes a double-quoted string.


  function escapeString(string) {
    var result = '';
    var char = 0;
    var escapeSeq;

    for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      escapeSeq = ESCAPE_SEQUENCES[char];

      if (!escapeSeq && isPrintable(char)) {
        result += string[i];
        if (char >= 0x10000) result += string[i + 1];
      } else {
        result += escapeSeq || encodeHex(char);
      }
    }

    return result;
  }

  function writeFlowSequence(state, level, object) {
    var _result = '',
        _tag = state.tag,
        index,
        length,
        value;

    for (index = 0, length = object.length; index < length; index += 1) {
      value = object[index];

      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      } // Write only valid elements, put null instead of invalid elements.


      if (writeNode(state, level, value, false, false) || typeof value === 'undefined' && writeNode(state, level, null, false, false)) {
        if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = '[' + _result + ']';
  }

  function writeBlockSequence(state, level, object, compact) {
    var _result = '',
        _tag = state.tag,
        index,
        length,
        value;

    for (index = 0, length = object.length; index < length; index += 1) {
      value = object[index];

      if (state.replacer) {
        value = state.replacer.call(object, String(index), value);
      } // Write only valid elements, put null instead of invalid elements.


      if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === 'undefined' && writeNode(state, level + 1, null, true, true, false, true)) {
        if (!compact || _result !== '') {
          _result += generateNextLine(state, level);
        }

        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += '-';
        } else {
          _result += '- ';
        }

        _result += state.dump;
      }
    }

    state.tag = _tag;
    state.dump = _result || '[]'; // Empty sequence if no valid values.
  }

  function writeFlowMapping(state, level, object) {
    var _result = '',
        _tag = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        pairBuffer;

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';
      if (_result !== '') pairBuffer += ', ';
      if (state.condenseFlow) pairBuffer += '"';
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }

      if (!writeNode(state, level, objectKey, false, false)) {
        continue; // Skip this pair because of invalid key;
      }

      if (state.dump.length > 1024) pairBuffer += '? ';
      pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

      if (!writeNode(state, level, objectValue, false, false)) {
        continue; // Skip this pair because of invalid value.
      }

      pairBuffer += state.dump; // Both key and value are valid.

      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = '{' + _result + '}';
  }

  function writeBlockMapping(state, level, object, compact) {
    var _result = '',
        _tag = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        explicitPair,
        pairBuffer; // Allow sorting keys so that the output file is deterministic

    if (state.sortKeys === true) {
      // Default sorting
      objectKeyList.sort();
    } else if (typeof state.sortKeys === 'function') {
      // Custom sort function
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      // Something is wrong
      throw new exception('sortKeys must be a boolean or a function');
    }

    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';

      if (!compact || _result !== '') {
        pairBuffer += generateNextLine(state, level);
      }

      objectKey = objectKeyList[index];
      objectValue = object[objectKey];

      if (state.replacer) {
        objectValue = state.replacer.call(object, objectKey, objectValue);
      }

      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue; // Skip this pair because of invalid key.
      }

      explicitPair = state.tag !== null && state.tag !== '?' || state.dump && state.dump.length > 1024;

      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += '?';
        } else {
          pairBuffer += '? ';
        }
      }

      pairBuffer += state.dump;

      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }

      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue; // Skip this pair because of invalid value.
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ':';
      } else {
        pairBuffer += ': ';
      }

      pairBuffer += state.dump; // Both key and value are valid.

      _result += pairBuffer;
    }

    state.tag = _tag;
    state.dump = _result || '{}'; // Empty mapping if no valid pairs.
  }

  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type, style;

    typeList = explicit ? state.explicitTypes : state.implicitTypes;

    for (index = 0, length = typeList.length; index < length; index += 1) {
      type = typeList[index];

      if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === 'object' && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
        if (explicit) {
          if (type.multi && type.representName) {
            state.tag = type.representName(object);
          } else {
            state.tag = type.tag;
          }
        } else {
          state.tag = '?';
        }

        if (type.represent) {
          style = state.styleMap[type.tag] || type.defaultStyle;

          if (_toString.call(type.represent) === '[object Function]') {
            _result = type.represent(object, style);
          } else if (_hasOwnProperty.call(type.represent, style)) {
            _result = type.represent[style](object, style);
          } else {
            throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
          }

          state.dump = _result;
        }

        return true;
      }
    }

    return false;
  } // Serializes `object` and writes it to global `result`.
  // Returns true on success, or false on invalid object.
  //


  function writeNode(state, level, object, block, compact, iskey, isblockseq) {
    state.tag = null;
    state.dump = object;

    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }

    var type = _toString.call(state.dump);

    var inblock = block;
    var tagStr;

    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }

    var objectOrArray = type === '[object Object]' || type === '[object Array]',
        duplicateIndex,
        duplicate;

    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }

    if (state.tag !== null && state.tag !== '?' || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }

    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = '*ref_' + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }

      if (type === '[object Object]') {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);

          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);

          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object Array]') {
        if (block && state.dump.length !== 0) {
          if (state.noArrayIndent && !isblockseq && level > 0) {
            writeBlockSequence(state, level - 1, state.dump, compact);
          } else {
            writeBlockSequence(state, level, state.dump, compact);
          }

          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);

          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object String]') {
        if (state.tag !== '?') {
          writeScalar(state, state.dump, level, iskey, inblock);
        }
      } else if (type === '[object Undefined]') {
        return false;
      } else {
        if (state.skipInvalid) return false;
        throw new exception('unacceptable kind of an object to dump ' + type);
      }

      if (state.tag !== null && state.tag !== '?') {
        // Need to encode all characters except those allowed by the spec:
        //
        // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
        // [36] ns-hex-digit    ::=  ns-dec-digit
        //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
        // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
        // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
        // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
        //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
        //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
        //
        // Also need to encode '!' because it has special meaning (end of tag prefix).
        //
        tagStr = encodeURI(state.tag[0] === '!' ? state.tag.slice(1) : state.tag).replace(/!/g, '%21');

        if (state.tag[0] === '!') {
          tagStr = '!' + tagStr;
        } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
          tagStr = '!!' + tagStr.slice(18);
        } else {
          tagStr = '!<' + tagStr + '>';
        }

        state.dump = tagStr + ' ' + state.dump;
      }
    }

    return true;
  }

  function getDuplicateReferences(object, state) {
    var objects = [],
        duplicatesIndexes = [],
        index,
        length;
    inspectNode(object, objects, duplicatesIndexes);

    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }

    state.usedDuplicates = new Array(length);
  }

  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList, index, length;

    if (object !== null && typeof object === 'object') {
      index = objects.indexOf(object);

      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);

        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);

          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }

  function dump$1(input, options) {
    options = options || {};
    var state = new State(options);
    if (!state.noRefs) getDuplicateReferences(input, state);
    var value = input;

    if (state.replacer) {
      value = state.replacer.call({
        '': value
      }, '', value);
    }

    if (writeNode(state, 0, value, true, true)) return state.dump + '\n';
    return '';
  }

  var dump_1 = dump$1;
  var dumper = {
    dump: dump_1
  };

  function renamed(from, to) {
    return function () {
      throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' + 'Use yaml.' + to + ' instead, which is now safe by default.');
    };
  }

  var Type = type;
  var Schema = schema;
  var FAILSAFE_SCHEMA = failsafe;
  var JSON_SCHEMA = json;
  var CORE_SCHEMA = core;
  var DEFAULT_SCHEMA = _default;
  var load = loader.load;
  var loadAll = loader.loadAll;
  var dump = dumper.dump;
  var YAMLException = exception; // Re-export all types in case user wants to create custom schema

  var types = {
    binary: binary,
    float: float,
    map: map,
    null: _null,
    pairs: pairs,
    set: set,
    timestamp: timestamp,
    bool: bool,
    int: int$1,
    merge: merge,
    omap: omap,
    seq: seq,
    str: str
  }; // Removed functions from JS-YAML 3.0.x

  var safeLoad = renamed('safeLoad', 'load');
  var safeLoadAll = renamed('safeLoadAll', 'loadAll');
  var safeDump = renamed('safeDump', 'dump');
  var jsYaml = {
    Type: Type,
    Schema: Schema,
    FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
    JSON_SCHEMA: JSON_SCHEMA,
    CORE_SCHEMA: CORE_SCHEMA,
    DEFAULT_SCHEMA: DEFAULT_SCHEMA,
    load: load,
    loadAll: loadAll,
    dump: dump,
    YAMLException: YAMLException,
    types: types,
    safeLoad: safeLoad,
    safeLoadAll: safeLoadAll,
    safeDump: safeDump
  };

  /** Perform a nested parse upto and including a particular ruleName
   *
   * The main use for this function is to perform nested parses
   * upto but not including inline parsing.
   */
  function nestedCoreParse(md, pluginRuleName, src, 
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  env, initLine, includeRule = true) {
      // disable all core rules after pluginRuleName
      const tempDisabledCore = [];
      // TODO __rules__ is currently not exposed in typescript, but is the only way to get the rule names,
      // since md.core.ruler.getRules('') only returns the rule functions
      // we should upstream a getRuleNames() function or similar
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore TS2339
      for (const rule of [...md.core.ruler.__rules__].reverse()) {
          if (rule.name === pluginRuleName) {
              if (!includeRule) {
                  tempDisabledCore.push(rule.name);
              }
              break;
          }
          if (rule.name) {
              tempDisabledCore.push(rule.name);
          }
      }
      md.core.ruler.disable(tempDisabledCore);
      let tokens = [];
      try {
          tokens = md.parse(src, env);
      }
      finally {
          md.core.ruler.enable(tempDisabledCore);
      }
      for (const token of tokens) {
          token.map =
              token.map !== null
                  ? [token.map[0] + initLine, token.map[1] + initLine]
                  : token.map;
      }
      return tokens;
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /** A class to define a single directive */
  class Directive {
      constructor(state) {
          this.required_arguments = 0;
          this.optional_arguments = 0;
          this.final_argument_whitespace = false;
          this.has_content = false;
          this.option_spec = {};
          this.rawOptions = false;
          this.state = state;
      }
      /** Convert the directive data to tokens */
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      run(data) {
          return [];
      }
      assert(test, msg) {
          if (!test) {
              throw new Error(msg);
          }
      }
      /** throw error is no body content parsed. */
      assert_has_content(data) {
          if (!data.body) {
              throw new Error("Content block expected, but none found.");
          }
      }
      /** Create a single token */
      createToken(type, tag, nesting, optional) {
          const token = new this.state.Token(type, tag, nesting);
          if ((optional === null || optional === void 0 ? void 0 : optional.content) !== undefined) {
              token.content = optional.content;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.level) !== undefined) {
              token.level = optional.level;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.map) !== undefined) {
              token.map = optional.map;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.block) !== undefined) {
              token.block = optional.block;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.info) !== undefined) {
              token.info = optional.info;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.meta) !== undefined) {
              token.meta = optional.meta;
          }
          if ((optional === null || optional === void 0 ? void 0 : optional.children) !== undefined) {
              token.children = optional.children;
          }
          return token;
      }
      /** parse block of text to tokens (does not run inline parse) */
      nestedParse(block, initLine) {
          return nestedCoreParse(this.state.md, "run_directives", block, this.state.env, initLine, true);
      }
  }
  /** Raise on parsing/validation error. */
  class DirectiveParsingError extends Error {
      constructor() {
          super(...arguments);
          this.name = "DirectiveParsingError";
      }
  }
  /**
   * This function contains the logic to take the first line of a directive,
   * and the content, and turn it into the three core components:
   * arguments (list), options (key: value mapping), and body (text).
   */
  function directiveToData(token, directive) {
      const firstLine = token.meta.arg || "";
      const content = token.content;
      let body = content.trim() ? content.split(/\r?\n/) : [];
      let bodyOffset = 0;
      let options = {};
      if (Object.keys(directive.option_spec || {}) || directive.rawOptions) {
          [body, options, bodyOffset] = parseDirectiveOptions(body, directive);
      }
      let args = [];
      if (!directive.required_arguments && !directive.optional_arguments) {
          if (firstLine) {
              bodyOffset = 0;
              body = [firstLine].concat(body);
          }
      }
      else {
          args = parseDirectiveArguments(firstLine, directive);
      }
      // remove first line of body if blank, to allow space between the options and the content
      if (body.length && !body[0].trim()) {
          body.shift();
          bodyOffset++;
      }
      // check for body content
      if (body.length && !directive.has_content) {
          throw new DirectiveParsingError("Has content but content not allowed");
      }
      return {
          map: token.map ? token.map : [0, 0],
          args,
          options,
          body: body.join("\n"),
          bodyMap: token.map
              ? [
                  body.length > 0 ? token.map[0] + bodyOffset : token.map[1],
                  body.length > 0 ? token.map[1] - 1 : token.map[1]
              ]
              : [0, 0]
      };
  }
  function parseDirectiveOptions(content, fullSpec) {
      // instantiate options
      let bodyOffset = 1;
      let options = {};
      let yamlBlock = null;
      // TODO allow for indented content (I can't remember why this was needed?)
      if (content.length && content[0].startsWith("---")) {
          // options contained in YAML block, ending with '---'
          bodyOffset++;
          const newContent = [];
          yamlBlock = [];
          let foundDivider = false;
          for (const line of content.slice(1)) {
              if (line.startsWith("---")) {
                  bodyOffset++;
                  foundDivider = true;
                  continue;
              }
              if (foundDivider) {
                  newContent.push(line);
              }
              else {
                  bodyOffset++;
                  yamlBlock.push(line);
              }
          }
          content = newContent;
      }
      else if (content.length && content[0].startsWith(":")) {
          const newContent = [];
          yamlBlock = [];
          let foundDivider = false;
          for (const line of content) {
              if (!foundDivider && !line.startsWith(":")) {
                  foundDivider = true;
                  newContent.push(line);
                  continue;
              }
              if (foundDivider) {
                  newContent.push(line);
              }
              else {
                  bodyOffset++;
                  yamlBlock.push(line.slice(1));
              }
          }
          content = newContent;
      }
      if (yamlBlock !== null) {
          try {
              const output = jsYaml.load(yamlBlock.join("\n"));
              if (output !== null && typeof output === "object") {
                  options = output;
              }
              else {
                  throw new DirectiveParsingError(`not dict: ${output}`);
              }
          }
          catch (error) {
              throw new DirectiveParsingError(`Invalid options YAML: ${error}`);
          }
      }
      if (fullSpec.rawOptions) {
          return [content, options, bodyOffset];
      }
      for (const [name, value] of Object.entries(options)) {
          const convertor = fullSpec.option_spec ? fullSpec.option_spec[name] : null;
          if (!convertor) {
              throw new DirectiveParsingError(`Unknown option: ${name}`);
          }
          let converted_value = value;
          if (value === null || value === false) {
              converted_value = "";
          }
          try {
              // In docutils all values are simply read as strings,
              // but loading with YAML these can be converted to other types, so we convert them back first
              // TODO check that it is sufficient to simply do this conversion, or if there is a better way
              converted_value = convertor(`${converted_value || ""}`);
          }
          catch (error) {
              throw new DirectiveParsingError(`Invalid option value: (option: '${name}'; value: ${value})\n${error}`);
          }
          options[name] = converted_value;
      }
      return [content, options, bodyOffset];
  }
  function parseDirectiveArguments(firstLine, fullSpec) {
      var _a;
      let args = firstLine.trim() ? (_a = firstLine.trim()) === null || _a === void 0 ? void 0 : _a.split(/\s+/) : [];
      const totalArgs = (fullSpec.required_arguments || 0) + (fullSpec.optional_arguments || 0);
      if (args.length < (fullSpec.required_arguments || 0)) {
          throw new DirectiveParsingError(`${fullSpec.required_arguments} argument(s) required, ${args.length} supplied`);
      }
      else if (args.length > totalArgs) {
          if (fullSpec.final_argument_whitespace) {
              // note split limit does not work the same as in python
              const arr = firstLine.split(/\s+/);
              args = arr.splice(0, totalArgs - 1);
              // TODO is it ok that we effectively replace all whitespace with single spaces?
              args.push(arr.join(" "));
          }
          else {
              throw new DirectiveParsingError(`maximum ${totalArgs} argument(s) allowed, ${args.length} supplied`);
          }
      }
      return args;
  }

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
                      const data = directiveToData(token, directive);
                      const [content, opts] = parseDirectiveOptions(token.content.trim() ? token.content.split(/\r?\n/) : [], directive);
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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  /** Functions for converting and validating directive options
   *
   * Primarily adapted from: docutils/docutils/parsers/rst/directives/__init__.py
   */
  /**
   * Normalize a string to HTML4 id
   *
   * Adapted from docutils/nodes.py::make_id,
   * it should be noted that in HTML5 the only requirement is no whitespace.
   * */
  function make_id(name) {
      // TODO make more complete
      return name
          .toLowerCase()
          .split(/\s+/)
          .join("-")
          .replace(/[^a-z0-9]+/, "-")
          .replace(/^[-0-9]+|-+$/, "");
  }
  /** Error to throw when an option is invalid. */
  class OptionSpecError extends Error {
      constructor() {
          super(...arguments);
          this.name = "OptionSpecError";
      }
  }
  /** Leave value unchanged */
  const unchanged = (value) => value;
  /** Leave value unchanged, but assert non-empty string */
  const unchanged_required = (value) => {
      if (!value) {
          throw new OptionSpecError("Argument required but none supplied");
      }
      return value;
  };
  /** A flag option (no argument) */
  const flag = (value) => {
      if (value.trim()) {
          throw new OptionSpecError(`No argument is allowed: "${value}" supplied`);
      }
      return null;
  };
  /** Split values by whitespace and normalize to HTML4 id */
  const class_option = (value) => {
      return `${value || ""}`.split(/\s+/).map(name => make_id(name));
  };
  /** Check for an integer argument and convert */
  function int(argument) {
      if (!argument) {
          throw new OptionSpecError("Value is not set");
      }
      const value = Number.parseFloat(argument);
      if (Number.isNaN(value) || !Number.isInteger(value)) {
          throw new OptionSpecError(`Value "${argument}" is not an integer`);
      }
      return value;
  }
  /** Check for a non-negative integer argument and convert */
  function nonnegative_int(argument) {
      const value = int(argument);
      if (value < 0) {
          throw new OptionSpecError(`Value "${argument}" must be positive or zero`);
      }
      return value;
  }
  /** A non-negative integer or null. */
  const optional_int = (value) => {
      if (!value) {
          return null;
      }
      return nonnegative_int(value);
  };
  /** Check for an integer percentage value with optional percent sign. */
  const percentage = (value) => {
      value = `${value || ""}`.replace(/\s+%$/, "");
      return nonnegative_int(value);
  };
  /** Check for a positive argument of one of the units and return a
      normalized string of the form "<value><unit>" (without space in
      between).
  */
  function get_measure(argument, units) {
      const regex = new RegExp(`^(?<number>[0-9.]+)\\s*(?<units>${units.join("|")})$`);
      const match = regex.exec(argument);
      if (!match || !match.groups) {
          throw new OptionSpecError(`not a positive measure of one of the following units: ${units.join("|")}`);
      }
      return match.groups.number + match.groups.units;
  }
  const length_units = ["em", "ex", "px", "in", "cm", "mm", "pt", "pc"];
  /** Check for a positive argument of a length unit, allowing for no unit. */
  const length_or_unitless = (value) => {
      return get_measure(value, [...length_units, ""]);
  };
  /**
  Return normalized string of a length or percentage unit.

  Add <default> if there is no unit. Raise ValueError if the argument is not
  a positive measure of one of the valid CSS units (or without unit).

  >>> length_or_percentage_or_unitless('3 pt')
  '3pt'
  >>> length_or_percentage_or_unitless('3%', 'em')
  '3%'
  >>> length_or_percentage_or_unitless('3')
  '3'
  >>> length_or_percentage_or_unitless('3', 'px')
  '3px'

  */
  const length_or_percentage_or_unitless = (argument, defaultUnit = "") => {
      try {
          return get_measure(argument, [...length_units, "%"]);
      }
      catch (_a) {
          return length_or_unitless(argument) + defaultUnit;
      }
  };
  const length_or_percentage_or_unitless_figure = (argument, defaultUnit = "") => {
      if (argument.toLowerCase() === "image") {
          return "image";
      }
      return length_or_percentage_or_unitless(argument, defaultUnit);
  };
  /** Create an option that asserts the (lower-cased & trimmed) value is a member of a choice set. */
  function create_choice(choices) {
      return (argument) => {
          argument = argument.toLowerCase().trim();
          if (choices.includes(argument)) {
              return argument;
          }
          throw new OptionSpecError(`must be in: ${choices.join("|")}`);
      };
  }
  /** Return the URI argument with unescaped whitespace removed. */
  const uri = (value) => {
      // TODO implement whitespace removal
      return value;
  };

  var options = /*#__PURE__*/Object.freeze({
    __proto__: null,
    make_id: make_id,
    OptionSpecError: OptionSpecError,
    unchanged: unchanged,
    unchanged_required: unchanged_required,
    flag: flag,
    class_option: class_option,
    int: int,
    nonnegative_int: nonnegative_int,
    optional_int: optional_int,
    percentage: percentage,
    length_or_unitless: length_or_unitless,
    length_or_percentage_or_unitless: length_or_percentage_or_unitless,
    length_or_percentage_or_unitless_figure: length_or_percentage_or_unitless_figure,
    create_choice: create_choice,
    uri: uri
  });

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
  class Admonition extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.required_arguments = 1;
      }
  }
  class Attention extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Attention";
          this.kind = "attention";
      }
  }
  class Caution extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Caution";
          this.kind = "caution";
      }
  }
  class Danger extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Danger";
          this.kind = "danger";
      }
  }
  class Error$1 extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Error";
          this.kind = "error";
      }
  }
  class Important extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Important";
          this.kind = "important";
      }
  }
  class Hint extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Hint";
          this.kind = "hint";
      }
  }
  class Note extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Note";
          this.kind = "note";
      }
  }
  class SeeAlso extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "See Also";
          this.kind = "seealso";
      }
  }
  class Tip extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Tip";
          this.kind = "tip";
      }
  }
  class Warning extends BaseAdmonition {
      constructor() {
          super(...arguments);
          this.title = "Warning";
          this.kind = "warning";
      }
  }
  const admonitions = {
      admonition: Admonition,
      attention: Attention,
      caution: Caution,
      danger: Danger,
      error: Error$1,
      important: Important,
      hint: Hint,
      note: Note,
      seealso: SeeAlso,
      tip: Tip,
      warning: Warning
  };

  // TODO add Highlight directive
  /** Mark up content of a code block
   *
   * Adapted from sphinx/directives/patches.py
   */
  class Code extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 0;
          this.optional_arguments = 1;
          this.final_argument_whitespace = false;
          this.has_content = true;
          this.option_spec = {
              /** Add line numbers, optionally starting from a particular number. */
              "number-lines": optional_int,
              /** Ignore minor errors on highlighting */
              force: flag,
              name: unchanged,
              class: class_option
          };
      }
      run(data) {
          // TODO handle options
          this.assert_has_content(data);
          const token = this.createToken("fence", "code", 0, {
              // TODO if not specified, the language should come from a central configuration "highlight_language"
              info: data.args ? data.args[0] : "",
              content: data.body,
              map: data.bodyMap
          });
          return [token];
      }
  }
  /** Mark up content of a code block, with more settings
   *
   * Adapted from sphinx/directives/code.py
   */
  class CodeBlock extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 0;
          this.optional_arguments = 1;
          this.final_argument_whitespace = false;
          this.has_content = true;
          this.option_spec = {
              /** Add line numbers. */
              linenos: flag,
              /** Start line numbering from a particular value. */
              "lineno-start": int,
              /** Strip indentation characters from the code block.
               * When number given, leading N characters are removed
               */
              dedent: optional_int,
              /** Emphasize particular lines (comma-separated numbers) */
              "emphasize-lines": unchanged_required,
              caption: unchanged_required,
              /** Ignore minor errors on highlighting */
              force: flag,
              name: unchanged,
              class: class_option
          };
      }
      run(data) {
          // TODO handle options
          this.assert_has_content(data);
          const token = this.createToken("fence", "code", 0, {
              // TODO if not specified, the language should come from a central configuration "highlight_language"
              info: data.args ? data.args[0] : "",
              content: data.body,
              map: data.bodyMap
          });
          return [token];
      }
  }
  /** A code cell is a special MyST based cell, signifying executable code. */
  class CodeCell extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 0;
          this.optional_arguments = 1;
          this.final_argument_whitespace = false;
          this.has_content = true;
          this.rawOptions = true;
      }
      run(data) {
          // TODO store options and the fact that this is a code cell rather than a fence?
          const token = this.createToken("fence", "code", 0, {
              info: data.args ? data.args[0] : "",
              content: data.body,
              map: data.bodyMap
          });
          return [token];
      }
  }
  const code = {
      code: Code,
      "code-block": CodeBlock,
      "code-cell": CodeCell
  };

  const shared_option_spec = {
      alt: unchanged,
      height: length_or_unitless,
      width: length_or_percentage_or_unitless,
      // TODO handle scale option
      scale: percentage,
      // TODO handle target option
      target: unchanged_required,
      class: class_option,
      // TODO handle name option (note: should be applied to figure for Figure)
      name: unchanged
  };
  /** Directive for a single image.
   *
   * Adapted from: docutils/docutils/parsers/rst/directives/images.py
   */
  class Image extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 1;
          this.optional_arguments = 0;
          this.final_argument_whitespace = true;
          this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: create_choice(["left", "center", "right", "top", "middle", "bottom"]) });
      }
      create_image(data) {
          // get URI
          const src = uri(data.args[0] || "");
          const token = this.createToken("image", "img", 0, { map: data.map, block: true });
          token.attrSet("src", src);
          token.attrSet("alt", data.options.alt || "");
          // TODO markdown-it default renderer requires the alt as children tokens
          const altTokens = [];
          if (data.options.alt) {
              this.state.md.inline.parse(data.options.alt, this.state.md, this.state.env, altTokens);
          }
          token.children = altTokens;
          if (data.options.height) {
              token.attrSet("height", data.options.height);
          }
          if (data.options.width) {
              token.attrSet("width", data.options.width);
          }
          if (data.options.align) {
              token.attrJoin("class", `align-${data.options.align}`);
          }
          if (data.options.class) {
              token.attrJoin("class", data.options.class.join(" "));
          }
          return token;
      }
      run(data) {
          return [this.create_image(data)];
      }
  }
  /** Directive for an image with caption.
   *
   * Adapted from: docutils/docutils/parsers/rst/directives/images.py,
   * and sphinx/directives/patches.py (patch to apply name to figure instead of image)
   */
  class Figure extends Image {
      constructor() {
          super(...arguments);
          this.option_spec = Object.assign(Object.assign({}, shared_option_spec), { align: create_choice(["left", "center", "right"]), figwidth: length_or_percentage_or_unitless_figure, figclass: class_option });
          this.has_content = true;
      }
      run(data) {
          const openToken = this.createToken("figure_open", "figure", 1, {
              map: data.map,
              block: true
          });
          if (data.options.figclass) {
              openToken.attrJoin("class", data.options.figclass.join(" "));
          }
          if (data.options.align) {
              openToken.attrJoin("class", `align-${data.options.align}`);
          }
          if (data.options.figwidth && data.options.figwidth !== "image") {
              // TODO handle figwidth == "image"?
              openToken.attrSet("width", data.options.figwidth);
          }
          let target;
          if (data.options.name) {
              // TODO: figure out how to pass silent here
              target = newTarget(this.state, openToken, TargetKind.figure, data.options.name, 
              // TODO: a better title?
              data.body.trim());
              openToken.attrJoin("class", "numbered");
          }
          const imageToken = this.create_image(data);
          imageToken.map = [data.map[0], data.map[0]];
          let captionTokens = [];
          let legendTokens = [];
          if (data.body) {
              const [caption, ...legendParts] = data.body.split("\n\n");
              const legend = legendParts.join("\n\n");
              const captionMap = data.bodyMap[0];
              const openCaption = this.createToken("figure_caption_open", "figcaption", 1, {
                  block: true
              });
              if (target) {
                  openCaption.attrSet("number", `${target.number}`);
              }
              // TODO in docutils caption can only be single paragraph (or ignored if comment)
              // then additional content is figure legend
              const captionBody = this.nestedParse(caption, captionMap);
              const closeCaption = this.createToken("figure_caption_close", "figcaption", -1, {
                  block: true
              });
              captionTokens = [openCaption, ...captionBody, closeCaption];
              if (legend) {
                  const legendMap = captionMap + caption.split("\n").length + 1;
                  const openLegend = this.createToken("figure_legend_open", "", 1, {
                      block: true
                  });
                  const legendBody = this.nestedParse(legend, legendMap);
                  const closeLegend = this.createToken("figure_legend_close", "", -1, {
                      block: true
                  });
                  legendTokens = [openLegend, ...legendBody, closeLegend];
              }
          }
          const closeToken = this.createToken("figure_close", "figure", -1, { block: true });
          return [openToken, imageToken, ...captionTokens, ...legendTokens, closeToken];
      }
  }
  const images = {
      image: Image,
      figure: Figure
  };

  /**A Markdown syntax tree node.

  A class that can be used to construct a tree representation of a linear
  `markdown-it` token stream.

  Each node in the tree represents either:
      - root of the Markdown document
      - a single unnested `Token`
      - a `Token` "_open" and "_close" token pair, and the tokens nested in
          between
  */
  class SyntaxTreeNode {
      /** Initialize a `SyntaxTreeNode` from a token stream. */
      constructor(tokens, create_root = true) {
          this.children = [];
          this.children = [];
          if (create_root) {
              this._set_children_from_tokens(tokens);
              return;
          }
          if (tokens.length === 0) {
              throw new Error("Tree creation: Can only create root from empty token sequence.");
          }
          if (tokens.length === 1) {
              const inline_token = tokens[0];
              if (inline_token.nesting) {
                  throw new Error("Unequal nesting level at the start and end of token stream.");
              }
              this.token = inline_token;
              if (inline_token.children !== null && inline_token.children.length > 0) {
                  this._set_children_from_tokens(inline_token.children);
              }
          }
          else {
              this.nester_tokens = { opening: tokens[0], closing: tokens[tokens.length - 1] };
              this._set_children_from_tokens(tokens.slice(1, -1));
          }
      }
      _set_children_from_tokens(tokens) {
          const revered_tokens = [...tokens].reverse();
          let token;
          while (revered_tokens.length > 0) {
              token = revered_tokens.pop();
              if (!token) {
                  break;
              }
              if (!token.nesting) {
                  this._add_child([token]);
                  continue;
              }
              if (token.nesting !== 1) {
                  throw new Error("Invalid token nesting");
              }
              const nested_tokens = [token];
              let nesting = 1;
              while (revered_tokens.length > 0 && nesting !== 0) {
                  token = revered_tokens.pop();
                  if (token) {
                      nested_tokens.push(token);
                      nesting += token.nesting;
                  }
              }
              if (nesting) {
                  throw new Error(`unclosed tokens starting: ${nested_tokens[0]}`);
              }
              this._add_child(nested_tokens);
          }
      }
      _add_child(tokens) {
          const child = new SyntaxTreeNode(tokens, false);
          child.parent = this;
          this.children.push(child);
      }
      /** Recover the linear token stream. */
      to_tokens() {
          function recursive_collect_tokens(node, token_list) {
              if (node.type === "root") {
                  for (const child of node.children) {
                      recursive_collect_tokens(child, token_list);
                  }
              }
              else if (node.token) {
                  token_list.push(node.token);
              }
              else {
                  if (!node.nester_tokens) {
                      throw new Error("No nested token available");
                  }
                  token_list.push(node.nester_tokens.opening);
                  for (const child of node.children) {
                      recursive_collect_tokens(child, token_list);
                  }
                  token_list.push(node.nester_tokens.closing);
              }
          }
          const tokens = [];
          recursive_collect_tokens(this, tokens);
          return tokens;
      }
      /** Is the node a special root node? */
      get is_root() {
          return !(this.token || this.nester_tokens);
      }
      /** Is this node nested? */
      get is_nested() {
          return !!this.nester_tokens;
      }
      /** Get siblings of the node (including self). */
      get siblings() {
          if (!this.parent) {
              return [this];
          }
          return this.parent.children;
      }
      /** Recursively yield all descendant nodes in the tree starting at self.
       *
       * The order mimics the order of the underlying linear token stream (i.e. depth first).
       */
      *walk(include_self = true) {
          if (include_self) {
              yield this;
          }
          for (const child of this.children) {
              yield* child.walk(true);
          }
      }
      /** Get a string type of the represented syntax.
       *
        - "root" for root nodes
        - `Token.type` if the node represents an un-nested token
        - `Token.type` of the opening token, with "_open" suffix stripped, if
            the node represents a nester token pair
      */
      get type() {
          var _a, _b, _c;
          if (this.is_root) {
              return "root";
          }
          if (this.token) {
              return this.token.type;
          }
          if ((_a = this.nester_tokens) === null || _a === void 0 ? void 0 : _a.opening.type.endsWith("_open")) {
              return (_b = this.nester_tokens) === null || _b === void 0 ? void 0 : _b.opening.type.slice(0, -5);
          }
          if (this.nester_tokens) {
              return (_c = this.nester_tokens) === null || _c === void 0 ? void 0 : _c.opening.type;
          }
          throw new Error("no internal token");
      }
      attribute_token() {
          if (this.token) {
              return this.token;
          }
          if (this.nester_tokens) {
              return this.nester_tokens.opening;
          }
          throw new Error("Tree node does not have the accessed attribute");
      }
      get tag() {
          return this.attribute_token().tag;
      }
      get level() {
          return this.attribute_token().level;
      }
      get content() {
          return this.attribute_token().content;
      }
      get markup() {
          return this.attribute_token().markup;
      }
      get info() {
          return this.attribute_token().info;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get meta() {
          return this.attribute_token().meta;
      }
      get block() {
          return this.attribute_token().block;
      }
      get hidden() {
          return this.attribute_token().hidden;
      }
      get map() {
          return this.attribute_token().map;
      }
      get attrs() {
          return this.attribute_token().attrs;
      }
  }

  class ListTable extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 0;
          this.optional_arguments = 1;
          this.final_argument_whitespace = true;
          this.has_content = true;
          this.option_spec = {
              "header-rows": nonnegative_int,
              "stub-columns": nonnegative_int,
              width: length_or_percentage_or_unitless,
              widths: unchanged,
              class: class_option,
              name: unchanged,
              align: create_choice(["left", "center", "right"])
          };
      }
      run(data) {
          // TODO support all options (add colgroup for widths)
          // Parse content
          this.assert_has_content(data);
          const headerRows = (data.options["header-rows"] || 0);
          const listTokens = this.nestedParse(data.body, data.bodyMap[0]);
          // Check content is a list
          if (listTokens.length < 2 ||
              listTokens[0].type !== "bullet_list_open" ||
              listTokens[listTokens.length - 1].type !== "bullet_list_close") {
              throw new DirectiveParsingError("Content is not a single bullet list");
          }
          // generate tokens
          const tokens = [];
          // table opening
          const tableOpen = this.createToken("table_open", "table", 1, { map: data.bodyMap });
          if (data.options.align) {
              tableOpen.attrJoin("class", `align-${data.options.align}`);
          }
          if (data.options.class) {
              tableOpen.attrJoin("class", data.options.class.join(" "));
          }
          tokens.push(tableOpen);
          // add caption
          if (data.args.length && data.args[0]) {
              tokens.push(this.createToken("table_caption_open", "caption", 1));
              tokens.push(this.createToken("inline", "", 0, {
                  map: [data.map[0], data.map[0]],
                  content: data.args[0],
                  children: []
              }));
              tokens.push(this.createToken("table_caption_close", "caption", -1));
          }
          let colType = "th";
          if (headerRows) {
              tokens.push(this.createToken("thead_open", "thead", 1, { level: 1 }));
              colType = "th";
          }
          else {
              tokens.push(this.createToken("tbody_open", "tbody", 1, { level: 1 }));
              colType = "td";
          }
          let rowLength = undefined;
          let rowNumber = 0;
          for (const child of new SyntaxTreeNode(listTokens.slice(1, -1)).children) {
              rowNumber += 1;
              this.assert(child.type === "list_item", `list item ${rowNumber} not of type 'list_item': ${child.type}`);
              this.assert(child.children.length === 1 && child.children[0].type === "bullet_list", `list item ${rowNumber} content not a nested bullet list`);
              const row = child.children[0].children;
              if (rowLength === undefined) {
                  rowLength = row.length;
              }
              else {
                  this.assert(row.length === rowLength, `list item ${rowNumber} does not contain the same number of columns as previous items`);
              }
              if (headerRows && rowNumber === headerRows + 1) {
                  tokens.push(this.createToken("thead_close", "thead", -1, { level: 1 }));
                  tokens.push(this.createToken("tbody_open", "tbody", 1, { level: 1 }));
                  colType = "td";
              }
              tokens.push(this.createToken("tr_open", "tr", 1, { map: child.map, level: 2 }));
              for (const column of row) {
                  tokens.push(this.createToken(`${colType}_open`, colType, 1, { map: column.map, level: 3 }));
                  // TODO if the list is not tight then all paragraphs will be un-hidden maybe we don't want this?
                  tokens.push(...column.to_tokens().slice(1, -1));
                  tokens.push(this.createToken(`${colType}_close`, colType, -1, { level: 3 }));
              }
              tokens.push(this.createToken("tr_close", "tr", -1, { level: 2 }));
          }
          if (headerRows && rowNumber < headerRows) {
              throw new Error(`Insufficient rows (${rowNumber}) for required header rows (${headerRows})`);
          }
          // closing tokens
          if (colType === "td") {
              tokens.push(this.createToken("tbody_close", "tbody", -1, { level: 1 }));
          }
          else {
              tokens.push(this.createToken("thead_close", "thead", -1, { level: 1 }));
          }
          tokens.push(this.createToken("table_close", "table", -1));
          return tokens;
      }
  }
  const tables = {
      "list-table": ListTable
  };

  /** Math directive with a label
   */
  class Math$1 extends Directive {
      constructor() {
          super(...arguments);
          this.required_arguments = 0;
          this.optional_arguments = 0;
          this.final_argument_whitespace = false;
          this.has_content = true;
          this.option_spec = {
              label: unchanged
          };
      }
      run(data) {
          // TODO handle options
          this.assert_has_content(data);
          const token = this.createToken("math_block", "div", 0, {
              content: data.body,
              map: data.bodyMap,
              block: true
          });
          token.attrSet("class", "math block");
          if (data.options.label) {
              token.attrSet("id", data.options.label);
              const target = newTarget(this.state, token, TargetKind.equation, data.options.label, "");
              token.attrSet("number", `${target.number}`);
              token.info = data.options.label;
              token.meta = { label: data.options.label, numbered: true, number: target.number };
          }
          return [token];
      }
  }
  const math = {
      math: Math$1
  };

  const directivesDefault = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, admonitions), images), code), tables), math);

  function numberingRule(options) {
      return (state) => {
          const env = getDocState(state);
          env.references.forEach(ref => {
              const { label, tokens, contentFromTarget } = ref;
              const setError = (details, error) => {
                  tokens.open.attrJoin("class", "error");
                  tokens.open.tag = tokens.close.tag = "code";
                  if (contentFromTarget && error) {
                      tokens.content.content = contentFromTarget(error);
                  }
                  else {
                      tokens.content.content = details;
                  }
                  return true;
              };
              const target = env.targets[label];
              if (!target)
                  return setError(label, {
                      kind: ref.kind || "",
                      label,
                      title: label,
                      number: `"${label}"`
                  });
              if (ref.kind && target.kind !== ref.kind) {
                  return setError(`Reference "${label}" does not match kind "${ref.kind}"`);
              }
              tokens.open.attrSet("href", `#${target.label}`);
              if (target.title)
                  tokens.open.attrSet("title", target.title);
              if (contentFromTarget)
                  tokens.content.content = contentFromTarget(target).trim();
          });
          // TODO: Math that wasn't pre-numbered?
          return true;
      };
  }
  /**
   * Create a rule that runs at the end of a markdown-it parser to go through all
   * references and add their targets.
   *
   * This `Rule` is done *last*, as you may reference a figure/equation, when that `Target`
   * has not yet been created. The references call `resolveRefLater` when they are being
   * created and pass their tokens such that the content of those tokens can be
   * dynamically updated.
   *
   * @param options (none currently)
   * @returns The markdown-it Rule
   */
  function statePlugin(md, options) {
      md.core.ruler.push("docutils_number", numberingRule());
  }

  /** Default options for docutils plugin */
  const OptionDefaults = {
      parseRoles: true,
      replaceFences: true,
      rolesAfter: "inline",
      directivesAfter: "block",
      directives: directivesDefault,
      roles: rolesDefault
  };
  /**
   * A markdown-it plugin for implementing docutils style roles and directives.
   */
  function docutilsPlugin(md, options) {
      const fullOptions = Object.assign(Object.assign({}, OptionDefaults), options);
      md.use(rolePlugin, fullOptions);
      md.use(directivePlugin, fullOptions);
      md.use(statePlugin, fullOptions);
  }

  exports.Directive = Directive;
  exports.Role = Role;
  exports["default"] = docutilsPlugin;
  exports.directiveOptions = options;
  exports.directivePlugin = directivePlugin;
  exports.directivesDefault = directivesDefault;
  exports.docutilsPlugin = docutilsPlugin;
  exports.rolePlugin = rolePlugin;
  exports.rolesDefault = rolesDefault;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.js.map
