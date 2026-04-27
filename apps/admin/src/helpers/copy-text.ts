export const copyText = (element: HTMLElement | null, afterCopy?: Function) => {
  if (element) {
    const range = document.createRange();
    range.selectNodeContents(element);

    const clonedSelection = range.cloneContents();
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(clonedSelection);

    const html = tempDiv.innerHTML;
    const plain = tempDiv.innerText;

    navigator.clipboard
      .write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ])
      .then(() => afterCopy?.());
  }
};
