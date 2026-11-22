"use strict";

/**
 * `gamenode/no-unsafe-theme-pairs`
 *
 * Companion of `no-hard-coded-colors`. That rule stops colors that bypass the
 * theme; this one stops valid tokens from being paired unsafely. A solid
 * filled accent/brand/status surface (`bg-brand`, `var(--gn-brand)`, ...)
 * carries its own foreground (the `*-filled-text` tokens) and repaints with
 * the theme. Body/muted text tokens (`text-foreground`, `var(--gn-text)`,
 * `var(--gn-dimmed)`, ...) are meant for page surfaces: in a dark theme they
 * happen to be light, so white-on-brand looks fine, but in a light theme such
 * as Ruins they turn dark and the same component becomes dark-on-dark.
 *
 * Reported:
 *  - Tailwind class lists that combine a solid filled background utility
 *    (`bg-brand`, `bg-brand-5`, `bg-accent`, `bg-tertiary`,
 *    `bg-status-danger-strong`, `bg-state-played`, `bg-premium`) with a
 *    body/muted text utility (`text-foreground`, `text-body`, `text-muted`,
 *    `text-text-muted`, `text-dimmed`…, `text-subtle`, `text-soft`,
 *    `text-quiet`, `text-faint`, `text-bright`, `text-chalk`, `text-pale`).
 *    Classes are compared within the same variant prefix only (`hover:` with
 *    `hover:`, `data-[active]:` with `data-[active]:`), and translucent tints
 *    (`bg-brand/15`, `bg-premium/20`) are allowed because the page surface
 *    still shows through.
 *  - Style/CSS-variable objects (including `style={{ … }}` and Mantine `styles`
 *    objects) that pair a solid filled background token
 *    (`var(--gn-brand)`, `var(--gn-brand-5)`, `var(--gn-accent)`,
 *    `var(--gn-tertiary)`, `var(--gn-status-danger-strong)`, `var(--gn-danger)`,
 *    `var(--gn-state-played)`, `var(--gn-premium)`) on `background`,
 *    `backgroundColor`, `--button-bg`, `--badge-bg` or `--bg` with a
 *    body/muted text token (`var(--gn-text)`, `var(--gn-text-color)`,
 *    `var(--gn-text-muted)`, `var(--gn-dimmed)`…, `var(--mantine-color-text)`,
 *    `var(--mantine-color-dimmed)`) on `color`, `--button-color`,
 *    `--button-hover-color`, `--badge-color` or `--color-selected`.
 *    `color-mix(...)` tints and values containing `transparent` are allowed.
 *
 * Exemptions: `// theme-exempt: <reason>` or `{/* theme-exempt: <reason> *\/}`
 * works like in `no-hard-coded-colors` — its own line, the next line, or the
 * whole JSX element / object / statement that follows it.
 *
 * Authored stylesheets are covered by `css-colors.js` (same pair check), since
 * this repo runs ESLint only on JS/TS.
 */

const SOLID_BACKGROUND_CLASSES = new Set([
  "bg-brand",
  "bg-brand-5",
  "bg-accent",
  "bg-tertiary",
  "bg-status-danger-strong",
  "bg-state-played",
  "bg-premium",
]);

const BODY_TEXT_CLASSES = new Set([
  "text-foreground",
  "text-body",
  "text-muted",
  "text-text-muted",
  "text-dimmed",
  "text-dimmed-0",
  "text-dimmed-1",
  "text-dimmed-2",
  "text-dimmed-3",
  "text-subtle",
  "text-soft",
  "text-quiet",
  "text-faint",
  "text-bright",
  "text-chalk",
  "text-pale",
]);

/** Callees whose string arguments are one class list. */
const CLASS_LIST_HELPERS = new Set([
  "cn",
  "cx",
  "clsx",
  "classnames",
  "twJoin",
  "twMerge",
]);

const SOLID_BACKGROUND_KEYS = new Set([
  "background",
  "backgroundColor",
  "--button-bg",
  "--badge-bg",
  "--bg",
]);

const BODY_TEXT_KEYS = new Set([
  "color",
  "--button-color",
  "--button-hover-color",
  "--badge-color",
  "--color-selected",
]);

const SOLID_FILLED_TOKEN =
  /var\(\s*--gn-(?:brand|brand-5|accent|tertiary|status-danger-strong|danger|state-played|premium)(?![\w-])/;

const BODY_TEXT_TOKEN =
  /var\(\s*--gn-(?:text|text-color|text-muted|dimmed|dimmed-1|dimmed-2|dimmed-3)(?![\w-])|var\(\s*--mantine-color-(?:text|dimmed)(?![\w-])/;

/** Tints keep the page surface behind the fill, so body text stays readable. */
const TRANSLUCENT_VALUE = /color-mix\(|transparent/i;

/**
 * Removes `var(...)` references (nested fallbacks included) so a value that is
 * exactly one token (`var(--gn-brand)`) is a solid fill, while a gradient or a
 * multi-layer background built from the token is not.
 */
function stripVarReferences(value) {
  let result = "";
  let index = 0;

  while (index < value.length) {
    const start = value.indexOf("var(", index);

    if (start === -1) {
      result += value.slice(index);
      break;
    }

    result += value.slice(index, start);

    let depth = 1;
    let cursor = start + "var(".length;

    while (cursor < value.length && depth > 0) {
      if (value[cursor] === "(") depth += 1;
      if (value[cursor] === ")") depth -= 1;
      cursor += 1;
    }

    index = cursor;
  }

  return result;
}

function isSolidFill(value) {
  if (TRANSLUCENT_VALUE.test(value)) return false;
  if (!SOLID_FILLED_TOKEN.test(value)) return false;

  const residue = stripVarReferences(value).trim();

  return residue === "" || /^!important$/i.test(residue);
}

const EXEMPT_COMMENT = /theme-exempt\s*:\s*(.*)$/;

const EXEMPT_NODE_TYPES = new Set([
  "ArrayExpression",
  "AssignmentExpression",
  "CallExpression",
  "ClassProperty",
  "ConditionalExpression",
  "ExportDefaultDeclaration",
  "ExportNamedDeclaration",
  "ExpressionStatement",
  "JSXAttribute",
  "JSXElement",
  "JSXFragment",
  "ObjectExpression",
  "Property",
  "PropertyDefinition",
  "ReturnStatement",
  "TemplateLiteral",
  "TSAsExpression",
  "TSNonNullExpression",
  "VariableDeclaration",
  "VariableDeclarator",
]);

function getPropertyKeyName(property) {
  if (!property || property.computed) return null;

  if (property.key.type === "Identifier") return property.key.name;
  if (
    property.key.type === "Literal" &&
    typeof property.key.value === "string"
  ) {
    return property.key.value;
  }

  return null;
}

function getStaticStringValue(node) {
  if (!node) return null;

  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis.map((quasi) => quasi.value.raw).join("");
  }

  return null;
}

/**
 * Splits `hover:bg-brand` / `data-[active]:text-muted` into variant prefix and
 * utility. Colons inside brackets (`data-[state=on]`, arbitrary properties)
 * stay part of the prefix.
 */
function splitVariantPrefix(token) {
  let depth = 0;
  let split = -1;

  for (let index = 0; index < token.length; index += 1) {
    const char = token[index];

    if (char === "[" || char === "(") {
      depth += 1;
    } else if (char === "]" || char === ")") {
      depth = Math.max(0, depth - 1);
    } else if (char === ":" && depth === 0) {
      split = index;
    }
  }

  if (split === -1) return { prefix: "", utility: token };

  return {
    prefix: token.slice(0, split),
    utility: token.slice(split + 1),
  };
}

function getClassToken(rawToken) {
  const token = rawToken.trim();
  if (!token) return null;

  const { prefix, utility } = splitVariantPrefix(token);
  // Tailwind's important modifier may sit between the variants and the utility
  // (`hover:!bg-brand`).
  return { prefix, utility: utility.replace(/^!+/, "") };
}

function isSolidBackgroundClass(utility) {
  if (!utility.startsWith("bg-")) return false;
  // `bg-brand/15` is a tint: the page surface still shows through.
  if (utility.includes("/")) return false;

  return SOLID_BACKGROUND_CLASSES.has(utility);
}

function isBodyTextClass(utility) {
  if (!utility.startsWith("text-")) return false;
  if (utility.includes("/")) return false;

  return BODY_TEXT_CLASSES.has(utility);
}

function isClassListHelper(callee) {
  if (!callee) return false;

  if (callee.type === "Identifier") return CLASS_LIST_HELPERS.has(callee.name);

  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    CLASS_LIST_HELPERS.has(callee.property.name)
  );
}

/**
 * Literals of one `cn()`/`clsx()` call are one class list; separately written
 * strings (and strings inside conditionals, which are mutually exclusive) stay
 * their own list.
 */
function getClassContainer(node) {
  if (node.type === "TemplateElement") return node.parent;

  if (node.parent) {
    if (
      node.parent.type === "CallExpression" &&
      isClassListHelper(node.parent.callee)
    ) {
      return node.parent;
    }

    if (
      node.parent.type === "JSXExpressionContainer" &&
      node.parent.parent &&
      node.parent.parent.type === "JSXAttribute"
    ) {
      return node.parent.parent;
    }
  }

  return node;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow pairing solid filled accent/brand/status surfaces with body text tokens (unreadable in light themes)",
      recommended: false,
    },
    schema: [],
    messages: {
      unsafeThemePairClass:
        "Unsafe theme pair: solid fill '{{background}}' with body text '{{text}}'. Body text tokens are for page surfaces; on a filled brand/accent/status surface they become dark-on-dark (or light-on-light) in light themes such as Ruins. Use the filled-text token instead: text-on-brand, text-accent-contrast, text-[var(--gn-brand-filled-text)], text-[var(--gn-danger-filled-text)] or text-[var(--gn-state-played-filled-text)].",
      unsafeThemePairStyle:
        "Unsafe theme pair: '{{backgroundKey}}: {{background}}' with '{{textKey}}: {{text}}'. Body text tokens are for page surfaces; on a filled brand/accent/status surface they become dark-on-dark (or light-on-light) in light themes such as Ruins. Use the matching filled-text token instead: var(--gn-brand-filled-text), var(--gn-danger-filled-text), var(--gn-state-played-filled-text) or var(--gn-accent-contrast).",
      exemptionNeedsReason:
        "A theme exemption needs an artwork reason: // theme-exempt: <reason>.",
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();
    const violations = [];
    const allNodes = [];
    const exemptions = [];
    const exemptRanges = [];
    const exemptLines = new Set();
    const classContainers = new Map();

    for (const comment of sourceCode.getAllComments()) {
      const match = EXEMPT_COMMENT.exec(comment.value);
      if (!match) continue;

      const reason = match[1].replace(/\*\/\s*$/, "").trim();

      if (!reason) {
        context.report({
          loc: {
            line: comment.loc.start.line,
            column: comment.loc.start.column,
          },
          messageId: "exemptionNeedsReason",
        });
        continue;
      }

      exemptions.push(comment);
    }

    function pushViolation(node, messageId, data) {
      violations.push({ node, messageId, data });
    }

    function addClassString(node, value) {
      if (typeof value !== "string" || value.length === 0) return;
      if (!value.includes("bg-") && !value.includes("text-")) return;

      const container = getClassContainer(node);
      let tokens = classContainers.get(container);

      if (!tokens) {
        tokens = new Map();
        classContainers.set(container, tokens);
      }

      for (const rawToken of value.split(/\s+/)) {
        const token = getClassToken(rawToken);
        if (!token) continue;

        const key = `${token.prefix}\u0000${token.utility}`;
        if (tokens.has(key)) continue;

        // `raw` keeps the class as written (`hover:!bg-brand`) for messages.
        tokens.set(key, { ...token, raw: rawToken, node });
      }
    }

    function checkClassContainer(container) {
      const tokens = classContainers.get(container);
      if (!tokens) return;

      const byPrefix = new Map();

      for (const token of tokens.values()) {
        let group = byPrefix.get(token.prefix);

        if (!group) {
          group = { backgrounds: [], texts: [] };
          byPrefix.set(token.prefix, group);
        }

        if (isSolidBackgroundClass(token.utility)) {
          group.backgrounds.push(token);
        } else if (isBodyTextClass(token.utility)) {
          group.texts.push(token);
        }
      }

      for (const group of byPrefix.values()) {
        if (group.backgrounds.length === 0 || group.texts.length === 0) {
          continue;
        }

        const background = group.backgrounds[0];
        const text = group.texts[0];

        pushViolation(background.node, "unsafeThemePairClass", {
          background: background.raw,
          text: text.raw,
        });
      }
    }

    function checkStyleObject(node) {
      const backgrounds = [];
      const texts = [];

      for (const property of node.properties) {
        if (property.type !== "Property") continue;

        const key = getPropertyKeyName(property);
        if (!key) continue;

        const value = getStaticStringValue(property.value);
        if (!value) continue;

        if (SOLID_BACKGROUND_KEYS.has(key) && isSolidFill(value)) {
          backgrounds.push({ key, value, node: property });
        } else if (BODY_TEXT_KEYS.has(key) && BODY_TEXT_TOKEN.test(value)) {
          texts.push({ key, value, node: property });
        }
      }

      if (backgrounds.length === 0 || texts.length === 0) return;

      const background = backgrounds[0];
      const text = texts[0];

      pushViolation(background.node, "unsafeThemePairStyle", {
        backgroundKey: background.key,
        background: background.value,
        textKey: text.key,
        text: text.value,
      });
    }

    function isStandaloneComment(comment) {
      const line = sourceCode.lines[comment.loc.start.line - 1] || "";
      const before = line.slice(0, comment.loc.start.column).trim();
      return before === "" || before === "{";
    }

    return {
      "*"(node) {
        allNodes.push(node);
      },

      Literal(node) {
        addClassString(node, node.value);
      },

      TemplateElement(node) {
        addClassString(node, node.value.raw);
      },

      ObjectExpression(node) {
        checkStyleObject(node);
      },

      "Program:exit"() {
        for (const tokens of classContainers.keys()) {
          checkClassContainer(tokens);
        }

        for (const comment of exemptions) {
          exemptRanges.push({
            start: comment.range[0],
            end: comment.range[1],
          });

          exemptLines.add(comment.loc.start.line);

          if (!isStandaloneComment(comment)) continue;

          exemptLines.add(comment.loc.end.line + 1);

          let nextNode = null;
          for (const node of allNodes) {
            if (
              node.range[0] < comment.range[1] ||
              !EXEMPT_NODE_TYPES.has(node.type)
            ) {
              continue;
            }

            if (
              !nextNode ||
              node.range[0] < nextNode.range[0] ||
              (node.range[0] === nextNode.range[0] &&
                node.range[1] > nextNode.range[1])
            ) {
              nextNode = node;
            }
          }

          if (nextNode) {
            exemptRanges.push({
              start: nextNode.range[0],
              end: nextNode.range[1],
            });
          }
        }

        function isExempt(node) {
          if (exemptLines.has(node.loc.start.line)) return true;

          return exemptRanges.some(
            (range) =>
              node.range[0] >= range.start && node.range[1] <= range.end,
          );
        }

        for (const violation of violations) {
          if (isExempt(violation.node)) continue;

          context.report({
            node: violation.node,
            messageId: violation.messageId,
            data: violation.data,
          });
        }
      },
    };
  },
};
