export function markdownToHtml(markdown: string): string {
  // Convert Markdown to HTML using regular expressions

  // Convert bold (**) or (__)
  markdown = markdown.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  markdown = markdown.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Convert italic (*) or (_)
  markdown = markdown.replace(/\*(.*?)\*/g, "<em>$1</em>");
  markdown = markdown.replace(/_(.*?)_/g, "<em>$1</em>");

  // Convert strikethrough (~~)
  markdown = markdown.replace(/~~(.*?)~~/g, "<del>$1</del>");

  // Convert links [text](url)
  markdown = markdown.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  // Convert headers (e.g., ## Header -> <h2>Header</h2>)
  markdown = markdown.replace(/^# (.*?)$/gm, "<h1>$1</h1>");
  markdown = markdown.replace(/^## (.*?)$/gm, "<h2>$1</h2>");
  markdown = markdown.replace(/^### (.*?)$/gm, "<h3>$1</h3>");

  // Convert lists (unordered lists with '-' or '*' and ordered lists with numbers)
  markdown = markdown.replace(/^(\*|\-)\s+(.*?)$/gm, "<ul><li>$2</li></ul>");
  markdown = markdown.replace(/^(\d+)\.\s+(.*?)$/gm, "<ol><li>$2</li></ol>");

  // Convert line breaks or newlines
  markdown = markdown.replace(/\n/g, "<br>");

  // Return the converted HTML string
  return markdown;
}
