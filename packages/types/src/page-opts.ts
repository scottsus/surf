export interface PageOpts {
  href: string;
  hostname: string;
  includeIdInQuerySelector: boolean;
  useWithSubmit: boolean;
}

export function getPageOpts(href: string): PageOpts {
  const hostname = extractDomainFromUrl(href);

  const ignoreIdInQuerySelectorWebsites = ["amazon.com"];
  const includeIdInQuerySelector = !ignoreIdInQuerySelectorWebsites.some(
    (target) => hostname.includes(target),
  );

  const dontUseWithSubmitWebsites = ["opentable.com"];
  const useWithSubmit = !dontUseWithSubmitWebsites.some((target) =>
    hostname.includes(target),
  );

  return { href, hostname, includeIdInQuerySelector, useWithSubmit };
}

function extractDomainFromUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    console.error(`extractDomainFromUrl: ${url}`);
    return "";
  }
}
