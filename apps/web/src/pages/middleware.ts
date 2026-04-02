import { NextRequest, NextResponse } from "next/server";

const LANGUAGE_STORAGE_KEY = "gamenode-language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "pt-BR"] as const;
type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function normalizeLanguage(language: string): SupportedLanguage | null {
  if (SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }

  const langPrefix = language.split("-")[0];
  const match = SUPPORTED_LANGUAGES.find((lang) =>
    lang.startsWith(langPrefix + "-"),
  );
  if (match) return match;

  if (SUPPORTED_LANGUAGES.includes(langPrefix as SupportedLanguage)) {
    return langPrefix as SupportedLanguage;
  }

  return null;
}

function getLanguageFromAcceptLanguage(
  acceptLanguage?: string | null,
): SupportedLanguage | null {
  if (!acceptLanguage) return null;

  const parts = acceptLanguage
    .split(",")
    .map((part) => part.trim())
    .map((part) => part.split(";")[0]);

  for (const part of parts) {
    const normalized = normalizeLanguage(part);
    if (normalized) return normalized;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookieLanguage = request.cookies.get(LANGUAGE_STORAGE_KEY)?.value;
  const normalizedCookieLanguage = cookieLanguage
    ? normalizeLanguage(cookieLanguage)
    : null;

  if (normalizedCookieLanguage) {
    return response;
  }

  const acceptLanguage = request.headers.get("accept-language");
  const detectedLanguage =
    getLanguageFromAcceptLanguage(acceptLanguage) || DEFAULT_LANGUAGE;

  response.cookies.set(LANGUAGE_STORAGE_KEY, detectedLanguage, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|assets|static|.*\\..*).*)"],
};
