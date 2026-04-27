import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";

export const useMyAssistantActionBar = () => {
  const createStyledText = (text: string, isBold = false, size = 24) => {
    return new TextRun({
      text: text.trim(),
      size,
      bold: isBold,
    });
  };

  const createHeadingParagraph = (
    text: string,
    level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
    size: number,
    spacing: { before: number; after: number }
  ) => {
    return new Paragraph({
      children: [createStyledText(text, true, size)],
      heading: level,
      spacing,
    });
  };

  const processHeadingElement = (element: Element, paragraphs: Paragraph[]) => {
    const text = element.textContent?.trim() || "";
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case "h1":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_1, 36, {
            before: 240,
            after: 120,
          })
        );
        break;
      case "h2":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_2, 32, {
            before: 200,
            after: 100,
          })
        );
        break;
      case "h3":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_3, 28, {
            before: 180,
            after: 90,
          })
        );
        break;
      case "h4":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_4, 26, {
            before: 160,
            after: 80,
          })
        );
        break;
      case "h5":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_5, 24, {
            before: 140,
            after: 70,
          })
        );
        break;
      case "h6":
        paragraphs.push(
          createHeadingParagraph(text, HeadingLevel.HEADING_6, 22, {
            before: 120,
            after: 60,
          })
        );
        break;
    }
  };

  const processListElement = (
    element: Element,
    paragraphs: Paragraph[],
    isOrdered: boolean
  ) => {
    element.querySelectorAll("li").forEach((li, index) => {
      const text = li.textContent?.trim() || "";
      paragraphs.push(
        new Paragraph({
          children: [createStyledText(text)],
          ...(isOrdered
            ? {
                numbering: {
                  reference: "default-numbering",
                  level: 0,
                },
              }
            : {
                bullet: {
                  level: 0,
                },
              }),
          spacing: { before: 60, after: 60 },
        })
      );
    });
  };

  const processBlockElement = (element: Element, paragraphs: Paragraph[]) => {
    const text = element.textContent?.trim() || "";
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case "p":
        paragraphs.push(
          new Paragraph({
            children: [createStyledText(text)],
            spacing: { before: 120, after: 120 },
          })
        );
        break;
      case "blockquote":
        paragraphs.push(
          new Paragraph({
            children: [createStyledText(text)],
            indent: { left: 720 },
            spacing: { before: 120, after: 120 },
            style: "Quote",
          })
        );
        break;
      case "hr":
        paragraphs.push(
          new Paragraph({
            children: [],
            spacing: { before: 240, after: 240 },
            border: {
              bottom: { style: "single", size: 1, color: "999999" },
            },
          })
        );
        break;
      case "pre":
      case "code":
        paragraphs.push(
          new Paragraph({
            children: [createStyledText(text)],
            spacing: { before: 120, after: 120 },
            style: "Code",
          })
        );
        break;
    }
  };

  const createWordDocument = (paragraphs: Paragraph[]) => {
    return new Document({
      numbering: {
        config: [
          {
            reference: "default-numbering",
            levels: [
              {
                level: 0,
                format: "decimal",
                text: "%1.",
                alignment: "start",
                style: {
                  paragraph: {
                    indent: { left: 720, hanging: 260 },
                  },
                },
              },
            ],
          },
        ],
      },
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });
  };

  const generateFileName = () => {
    const timestamp = new Date();
    const formattedDate = timestamp.toISOString().replace(/[:.]/g, "-");
    return `radiology-report-${formattedDate}.docx`;
  };

  const downloadDocument = async (doc: Document, fileName: string) => {
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownload = async (messageId: string) => {
    const messageContainer = document.querySelector(
      `div[data-message-id="${messageId}"]`
    );
    const messageElement = messageContainer?.querySelector(
      `div[data-status="complete"]`
    );

    if (!messageElement) return;

    const paragraphs: Paragraph[] = [];

    // Process each element
    Array.from(messageElement.children).forEach((element) => {
      const tagName = element.tagName.toLowerCase();
      switch (true) {
        case /^h[1-6]$/.test(tagName):
          processHeadingElement(element, paragraphs);
          break;
        case tagName === "ul":
          processListElement(element, paragraphs, false);
          break;
        case tagName === "ol":
          processListElement(element, paragraphs, true);
          break;
        default:
          processBlockElement(element, paragraphs);
      }
    });

    const doc = createWordDocument(paragraphs);
    const fileName = generateFileName();
    await downloadDocument(doc, fileName);
  };
  return {
    handleDownload,
  };
};
