// utils/markdownToPortableText.ts
import { unified } from "unified";
import remarkParse from "remark-parse";

interface PortableTextChild {
  _type: "span";
  text: string;
  marks: string[];
}

interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: string;
  markDefs: unknown[];
  children: PortableTextChild[];
}

export function markdownToPortableText(md: string): PortableTextBlock[] {
  const tree = unified().use(remarkParse).parse(md);
  const blocks: PortableTextBlock[] = [];

  function walk(node: any) {
    if (node.type === "heading") {
      const text = node.children.map((c: any) => c.value || "").join("");
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: `h${node.depth}`,
        markDefs: [],
        children: [{ _type: "span", text, marks: [] }],
      });
    } else if (node.type === "paragraph") {
      const text = node.children.map((c: any) => c.value || "").join("");
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        markDefs: [],
        children: [{ _type: "span", text, marks: [] }],
      });
    } else if (node.children) {
      node.children.forEach(walk);
    }
  }

  walk(tree);
  return blocks;
}
