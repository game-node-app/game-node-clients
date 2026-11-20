"use strict";

/**
 * `gamenode/no-hard-coded-colors`
 *
 * Guards the theme token system: components and styles must use tokens
 * (`var(--gn-…)` or the Tailwind token utilities) instead of color literals,
 * so every theme can repaint them.
 *
 * Reported:
 *  - hex, `rgb()`/`rgba()`/`hsl()`/`hsla()` (and the other CSS color
 *    functions) in JSX attributes and style objects;
 *  - strings that are exactly a color literal anywhere in the file, which is
 *    how design-token maps and CSS variable maps are usually written;
 *  - Tailwind arbitrary color classes (`bg-[#1a1a1a]`,
 *    `text-[rgb(…)]`, `[color:#fff]`), including variants (`hover:`).
 *
 * Not reported: token references such as `var(--gn-brand)`,
 * `bg-paper-2`/`text-brand-5`, named CSS colors (the spec guard is about hex
 * and functional literals) and hash fragments inside larger strings (URLs,
 * prose).
 *
 * Exemptions:
 *  `// theme-exempt: <reason>` or `{/* theme-exempt: <reason> *\/}` suppresses
 *  the report for its own line, the next line, or the whole JSX element /
 *  object / statement that follows it. The reason is mandatory. Exemptions are
 *  only for content artwork (game art, recap/awards artwork, platform brand
 *  marks); UI chrome must be tokenized.
 *
 * CSS files (`.css`, CSS Modules) are not covered: this repo runs ESLint, not
 * stylelint. Keep those on generated variables by review.
 */

const HEX_COLOR =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-fA-F])/;

const FUNCTIONAL_COLOR = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\(/i;

const FUNCTIONAL_COLOR_FULL =
  /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\([^)]*\)/i;

const COLOR_ONLY =
  /^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\s*\([^)]*\))$/;

const TAILWIND_ARBITRARY_COLOR =
  /(?:^|[\s"'`])(?:[a-z0-9-]+:)*(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|divide|placeholder|caret|accent|drop-shadow)-\[[^\]]*(?:#|\b(?:rgba?|hsla?)\s*\()[^\]]*\](?:\/(?:\d+|\[[^\]]*\])?)?/i;

const TAILWIND_ARBITRARY_PROPERTY =
  /\[(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke|text-decoration-color|caret-color|accent-color)\s*:\s*(?:#|\b(?:rgba?|hsla?)\s*\()[^\]]*\]/i;

const STYLE_PROPERTY =
  /(?:^--|color$|colour$|background|border|fill|stroke|shadow|gradient|outline|caret|accent|decoration|backdrop|filter)/i;

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

/**
 * Attributes whose string values are references, not paint. Without this,
 * `<a href="#fade">` (a valid 4-digit hex shape) would be reported.
 */
const NON_COLOR_JSX_ATTRIBUTES = new Set([
  "action",
  "alt",
  "cite",
  "d",
  "download",
  "formAction",
  "height",
  "href",
  "htmlFor",
  "id",
  "name",
  "placeholder",
  "points",
  "poster",
  "rel",
  "role",
  "size",
  "sizes",
  "src",
  "srcSet",
  "target",
  "title",
  "to",
  "transform",
  "type",
  "value",
  "viewBox",
  "width",
]);

function getPropertyKeyName(property) {
  if (!property || property.computed) return null;

  if (property.key.type === "Identifier") return property.key.name;
  if (property.key.type === "Literal" && typeof property.key.value === "string") {
    return property.key.value;
  }

  return null;
}

function getJsxAttribute(node) {
  let current = node.parent;

  while (current) {
    if (current.type === "JSXAttribute") return current;
    current = current.parent;
  }

  return null;
}

function isNonColorJsxAttribute(attribute) {
  const name = attribute.name && attribute.name.name;

  if (typeof name !== "string") return false;
  if (name.startsWith("data-") || name.startsWith("aria-")) return true;

  return NON_COLOR_JSX_ATTRIBUTES.has(name);
}

function isInsideStyleObject(node) {
  let current = node.parent;

  while (current) {
    if (current.type === "JSXAttribute" && current.name.name === "style") {
      return true;
    }

    if (current.type === "Property") {
      const key = getPropertyKeyName(current);
      if (key && STYLE_PROPERTY.test(key)) return true;
    }

    current = current.parent;
  }

  return false;
}

function findColorLiteral(value) {
  const trimmed = value.trim();

  if (COLOR_ONLY.test(trimmed)) return trimmed;

  const hex = HEX_COLOR.exec(value);
  if (hex) return hex[0];

  const functional = FUNCTIONAL_COLOR_FULL.exec(value);
  if (functional) return functional[0];
  if (FUNCTIONAL_COLOR.test(value)) return value.trim().slice(0, 40);

  return null;
}

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow hard-coded colors in favour of theme tokens (var(--gn-…), Tailwind token utilities)",
      recommended: false,
    },
    schema: [],
    messages: {
      hardCodedColor:
        "Hard-coded color '{{color}}' is not themeable. Use a theme token instead (for example var(--gn-brand), var(--gn-surface-2) or a Tailwind token utility such as bg-paper-2/text-brand-5).",
      hardCodedColorClass:
        "Hard-coded color in Tailwind class '{{className}}'. Use a token utility (for example bg-paper-2, text-brand-5 or border-line) instead.",
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

    function checkValue(node, value) {
      if (typeof value !== "string" || value.length === 0) return;

      const jsxAttribute = getJsxAttribute(node);
      if (jsxAttribute && isNonColorJsxAttribute(jsxAttribute)) return;

      const tailwindMatch =
        TAILWIND_ARBITRARY_COLOR.exec(value) ||
        TAILWIND_ARBITRARY_PROPERTY.exec(value);

      if (tailwindMatch) {
        pushViolation(node, "hardCodedColorClass", {
          className: tailwindMatch[0].trim(),
        });
        return;
      }

      const color = findColorLiteral(value);
      if (!color) return;

      const isColorOnly = COLOR_ONLY.test(value.trim());
      const inColorContext = jsxAttribute !== null || isInsideStyleObject(node);

      if (!isColorOnly && !inColorContext) return;

      pushViolation(node, "hardCodedColor", { color });
    }

    function isStandaloneComment(comment) {
      const line = sourceCode.lines[comment.loc.start.line - 1] || "";
      const before = line.slice(0, comment.loc.start.column).trim();
      // JSX comments are written as `{/* … */}`; the opening brace is not code
      // for this purpose.
      return before === "" || before === "{";
    }

    return {
      "*"(node) {
        allNodes.push(node);
      },

      Literal(node) {
        checkValue(node, node.value);
      },

      TemplateElement(node) {
        checkValue(node, node.value.raw);
      },

      "Program:exit"() {
        for (const comment of exemptions) {
          exemptRanges.push({
            start: comment.range[0],
            end: comment.range[1],
          });

          // A comment always exempts its own line. Only a standalone comment
          // (nothing but whitespace before it) also exempts the next line and
          // the following construct, so a trailing exemption cannot leak into
          // unrelated code below it.
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
