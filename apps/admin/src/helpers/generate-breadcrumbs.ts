export const generateBreadcrumbs = (pathname: string) => {
  // Split pathname and create breadcrumb items
  const paths = pathname.split("/").filter(Boolean);
  return paths.map((path, index) => {
    const href = "/" + paths.slice(0, index + 1).join("/");
    // Transform hyphenated words and capitalize each word
    const label = path
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return {
      label,
      href: index === paths.length - 1 ? undefined : href,
    };
  });
};
