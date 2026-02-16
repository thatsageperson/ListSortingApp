/**
 * Recursively walks a TipTap JSON document and extracts plain text.
 * Block-level elements are separated by newlines.
 */
export function extractPlainText(doc) {
  if (!doc || !doc.content) return "";
  return extractFromNodes(doc.content).trim();
}

function extractFromNodes(nodes) {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((node) => {
      if (node.type === "text") return node.text || "";
      if (node.content) {
        const inner = extractFromNodes(node.content);
        // Block-level nodes get a newline after them
        const isBlock = [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "listItem",
          "blockquote",
          "codeBlock",
          "horizontalRule",
        ].includes(node.type);
        return isBlock ? inner + "\n" : inner;
      }
      if (node.type === "horizontalRule") return "---\n";
      if (node.type === "hardBreak") return "\n";
      return "";
    })
    .join("");
}
