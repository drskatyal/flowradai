const normalizeText = (text: string): string => {
  return text
    // Replace various dash characters with standard ASCII hyphen-minus (U+002D)
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-');
};

export const copyText = (element: HTMLElement | null, afterCopy?: Function) => {
  if (element) {
    const range = document.createRange();
    range.selectNodeContents(element);

    const clonedSelection = range.cloneContents();
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(clonedSelection);

    const html = normalizeText(tempDiv.innerHTML);
    const plain = normalizeText(tempDiv.innerText);

    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ])
      .then(() => afterCopy?.())
      .catch(() => {
        const tempTextArea = document.createElement("textarea");
        tempTextArea.value = plain;
        tempTextArea.setAttribute("readonly", "");
        tempTextArea.style.position = "fixed";
        tempTextArea.style.left = "-9999px";
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand("copy");
        document.body.removeChild(tempTextArea);
        afterCopy?.();
      });
  }
};

export const copyTextPlainOnly = (element: HTMLElement | null, afterCopy?: Function) => {
  if (element) {
    const plain = normalizeText(element.innerText);

    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ])
      .then(() => afterCopy?.());
  }
};
