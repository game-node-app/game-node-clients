export const english = {
  id: "123e4567-e89b-42d3-a456-426614174000",
  title: "English review",
  content:
    '<h2>Review</h2><p>English body <a href="https://example.com">source</a></p><img src="https://media.example/inline.webp" alt="Gameplay">',
  excerpt: "English excerpt",
  profileUserId: "author",
  tags: [{ id: "review", name: "Review" }],
  review: { gameId: 42, rating: 0 },
  cover: { url: "https://media.example/cover.webp", alt: "English cover" },
  publishedAt: "2026-10-28T12:00:00Z",
  requestedLocale: "en",
  resolvedLocale: "en",
  availableLocales: ["en", "pt-BR"],
};
export const portuguese = {
  ...english,
  title: "Análise em português",
  content: "<p>Conteúdo em português</p>",
  excerpt: "Resumo",
  cover: { ...english.cover, alt: "Capa" },
  requestedLocale: "pt-BR",
  resolvedLocale: "pt-BR",
};
export const fallback = {
  ...english,
  requestedLocale: "pt-BR",
  availableLocales: ["en"],
};
export const draft = {
  ...portuguese,
  title: "Rascunho privado",
  status: "draft",
  publishedAt: null,
  availableLocales: ["en"],
};
export const unavailable = {
  statusCode: 503,
  message: "Blog CMS is unavailable",
};
