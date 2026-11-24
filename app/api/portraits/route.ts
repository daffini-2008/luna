import { NextResponse } from "next/server";
import { celebrities } from "@/lib/data";

type MetadataField = { value?: unknown };
type CommonsImageInfo = {
  thumburl?: unknown;
  descriptionurl?: unknown;
  extmetadata?: {
    Artist?: MetadataField;
    LicenseShortName?: MetadataField;
    LicenseUrl?: MetadataField;
    Credit?: MetadataField;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReusableLicense(name: string) {
  const license = name.toUpperCase();
  return license.startsWith("CC0") || license.startsWith("CC BY ") || license.startsWith("CC BY-SA ") || license.includes("PUBLIC DOMAIN");
}

function normalizeName(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const name = new URL(request.url).searchParams.get("name");
  if (!name || !celebrities.some((celebrity) => celebrity.name === name)) {
    return NextResponse.json({ error: "Unknown profile." }, { status: 400 });
  }

  const searchName = name === "Chico Lachowski" ? "Francisco Lachowski" : name;
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `file:"${searchName}"`,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "700",
    format: "json",
  });
  const response = await fetch(
    `https://commons.wikimedia.org/w/api.php?${params.toString()}`,
    {
      headers: {
        "User-Agent": "LunasMatrimonyDemo/1.0 (licensed entertainment portrait attribution)",
      },
      next: { revalidate: 86400 },
    },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "Portrait unavailable." }, { status: 502 });
  }

  const result: unknown = await response.json();
  if (!isRecord(result) || !isRecord(result.query) || !isRecord(result.query.pages)) {
    return NextResponse.json({ error: "Portrait unavailable." }, { status: 404 });
  }

  const nameParts = searchName.split(/\s+/);
  const requiredNameParts = [...new Set([nameParts[0], nameParts[nameParts.length - 1]].map(normalizeName))];
  const image = Object.values(result.query.pages)
    .filter(isRecord)
    .filter((page) => {
      const title = typeof page.title === "string" ? normalizeName(page.title) : "";
      const isTarget = requiredNameParts.every((part) => title.includes(part));
      const isWaxwork = ["wax", "waxwork", "madame tussauds", "musee grevin"].some((term) => title.includes(term));
      return isTarget && !isWaxwork;
    })
    .flatMap((page) => Array.isArray(page.imageinfo)
      ? page.imageinfo.filter(isRecord).map((info) => info as CommonsImageInfo)
      : [])
    .find((info) => {
      const license = info.extmetadata?.LicenseShortName?.value;
      return typeof info.thumburl === "string" &&
        info.thumburl.startsWith("https://") &&
        typeof info.descriptionurl === "string" &&
        typeof license === "string" &&
        isReusableLicense(license);
    });

  if (!image) {
    return NextResponse.json({ error: "No freely licensed portrait is available." }, { status: 404 });
  }

  const metadata = image.extmetadata;
  const value = (field: MetadataField | undefined) =>
    typeof field?.value === "string" ? field.value.replace(/<[^>]*>/g, "").trim() : "";
  return NextResponse.json({
    image: image.thumburl,
    filePage: image.descriptionurl,
    license: value(metadata?.LicenseShortName),
    licenseUrl: metadata?.LicenseUrl?.value,
    artist: value(metadata?.Artist) || value(metadata?.Credit),
  });
}
