type ClearbitCompany = {
  name?: string;
  domain?: string;
  logo?: string;
};

const CLEARBIT_COMPANY_SUGGEST_API =
  "https://autocomplete.clearbit.com/v1/companies/suggest";

const COMMON_DOMAIN_SUFFIXES = ["com", "io", "ai", "app", "co", "in"] as const;

const sanitizeName = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const normalizeToken = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildDomainCandidates = (name: string): string[] => {
  const compact = normalizeToken(name);
  const words = sanitizeName(name)
    .split(" ")
    .map(normalizeToken)
    .filter(Boolean);

  const bases = Array.from(
    new Set([
      compact,
      words.join(""),
      words[0],
      words.slice(0, 2).join(""),
    ].filter((value): value is string => Boolean(value)))
  );

  return bases.flatMap((base) =>
    COMMON_DOMAIN_SUFFIXES.map((suffix) => `${base}.${suffix}`)
  );
};

const pickBestCompany = (
  companies: ClearbitCompany[],
  subscriptionName: string
): ClearbitCompany | undefined => {
  if (companies.length === 0) return undefined;

  const normalizedName = normalizeToken(subscriptionName);

  const exactMatch = companies.find((company) => {
    const companyName = normalizeToken(company.name ?? "");
    const companyDomain = normalizeToken(company.domain ?? "");
    return (
      companyName === normalizedName ||
      companyDomain === normalizedName ||
      companyDomain.startsWith(normalizedName)
    );
  });

  return exactMatch ?? companies[0];
};

export const getUniversalIcon = async (name: string): Promise<string> => {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return "https://www.google.com/s2/favicons?sz=128&domain_url=https://www.google.com";
  }

  try {
    const response = await fetch(
      `${CLEARBIT_COMPANY_SUGGEST_API}?query=${encodeURIComponent(trimmedName)}`
    );

    if (response.ok) {
      const companies = (await response.json()) as ClearbitCompany[];
      const bestCompany = pickBestCompany(companies, trimmedName);

      if (bestCompany?.logo && bestCompany.logo.trim().length > 0) {
        return bestCompany.logo.trim();
      }
    }
  } catch {
    console.warn("Icon lookup failed, using favicon fallback.");
  }

  const [firstDomainCandidate = "google.com"] = buildDomainCandidates(trimmedName);
  return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(
    `https://${firstDomainCandidate}`
  )}`;
};
