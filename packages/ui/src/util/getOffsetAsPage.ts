export function getOffsetAsPage(offset: number, limit: number) {
  return offset >= limit ? Math.ceil((offset + 1) / limit) : 1;
}

export function getPageAsOffset(page: number, limit: number) {
  return (page - 1) * limit;
}
