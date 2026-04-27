import HtmlToDocx from "html-to-docx";

class ReportExportService {
  async generateDocxFromHtml(htmlString: string): Promise<ArrayBuffer | Blob> {
    const cleanedHtml = htmlString
      .replace(/<colgroup>.*?<\/colgroup>/g, "") // remove colgroup
      .replace(/style="min-width:\s*\d+px;?"/g, "") // remove inline styles
      .replace(/<div class="tableWrapper">/g, "")
      .replace(/<\/div>/g, "");

    const cssStyles = `
      tr {
        page-break-inside: avoid;
      }
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
      }
      td, th {
        padding: 8px;
        vertical-align: top;
      }
    `;

    const documentOptions = {
      orientation: "portrait" as any,
      margins: { top: 720, right: 720, bottom: 720, left: 720 }, // optional: control padding
      table: { row: { cantSplit: true } },
      css: cssStyles,
    };

    const buffer = await HtmlToDocx(
      cleanedHtml,
      "", // headerHTML
      documentOptions,
      "" // footerHTML
    );

    return buffer;
  }
}

export default new ReportExportService();
