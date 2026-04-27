import { marked } from 'marked';
import TurndownService from 'turndown';
import { Extensions, generateHTML, generateJSON, JSONContent } from '@tiptap/react';

export const markdownToEditorJSON = (
  markdownText: string,
  extensions: Extensions
) => {
  if (typeof markdownText !== "string") {
    throw new TypeError("markdownText must be a string");
  }
  const html = marked.parse(markdownText, { async: false });
  return generateJSON(html, extensions);
};

export const editorJSONToMarkdown = (
  editorContent: JSONContent,
  extensions: Extensions
): string => {
  if (typeof editorContent !== "object" || editorContent === null) {
    throw new TypeError("editorContent must be a non-null object");
  }
  const html = generateHTML(editorContent, extensions);
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    hr: "---",
    br: "\n",
  });
  
  turndownService.addRule("strikethrough",{
    filter: ["del", "s"],
    replacement: (content: string) => `~~${content}~~`,
  })
  
  return turndownService.turndown(html);
};