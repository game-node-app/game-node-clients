export const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL as string;
export const searchUrl = process.env.NEXT_PUBLIC_SEARCH_URL as string;

const urls = [serverUrl, searchUrl];
if (urls.some((url) => url == undefined)) {
    throw new Error("NEXT_PUBLIC_SERVER_URL is not defined");
}
