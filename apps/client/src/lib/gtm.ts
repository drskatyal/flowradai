export const GTM_ID = "GTM-5JQPCF83";

export const pageview = (url: string) => {
    window.dataLayer?.push({
      event: "pageview",
      page: url,
    });
};