/** Resolves dynamic route params (Next.js 14 sync + Next.js 15 Promise). */
export async function getRouteParam(
  params: Promise<{ id: string }> | { id: string },
  key: "id"
): Promise<string> {
  const resolved = params instanceof Promise ? await params : params;
  return decodeURIComponent(resolved[key]);
}
