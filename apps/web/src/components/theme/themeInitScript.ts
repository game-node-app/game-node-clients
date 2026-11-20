import { DEFAULT_THEME_ID, THEME_CATALOG } from "@repo/ui";
import { GN_THEME_COOKIE, GN_THEME_STORAGE_KEY } from "./themeStorage";

/**
 * Inline bootstrap for static pages (design decision 5).
 *
 * Pages without `getServerSideProps` are prerendered without the request, so
 * `_document` can only emit the default theme there. This script runs in the
 * head before the first paint and:
 *
 * - validates the `gn-theme` cookie (then the localStorage mirror) against the
 *   generated catalog and sets `data-theme`, so colors are right immediately;
 * - records the server-rendered value in `data-theme-ssr` when it is missing,
 *   which is what `AppThemeProvider` uses for its first client render;
 * - sets `data-experience-pending` when the stored theme needs a lazy
 *   experience, hiding `main` until the pack mounts or the timeout expires;
 * - keeps `<meta name="theme-color">` in sync with the selected theme.
 *
 * The script only contains ids/colors from the generated catalog, so it is
 * identical on every request and never blocks static optimization.
 */
const EXPERIENCE_PENDING_TIMEOUT_MS = 300;

function buildThemeInitScript(): string {
  const ids = JSON.stringify(THEME_CATALOG.map((entry) => entry.id));
  const colors = JSON.stringify(
    Object.fromEntries(
      THEME_CATALOG.map((entry) => [entry.id, entry.preview.background]),
    ),
  );
  const needsExperience = JSON.stringify(
    Object.fromEntries(
      THEME_CATALOG.map((entry) => [
        entry.id,
        entry.experience !== "default" || entry.screens !== null,
      ]),
    ),
  );

  return `(function(){try{
var d=document,root=d.documentElement;
var ids=${ids},colors=${colors},needsExperience=${needsExperience},def=${JSON.stringify(
    DEFAULT_THEME_ID,
  )};
function valid(v){return typeof v==="string"&&ids.indexOf(v)!==-1;}
function fromCookie(){
  var m=d.cookie.match(/(?:^|;\\s*)${GN_THEME_COOKIE}=([^;]+)/);
  if(!m)return null;
  var v=m[1];
  try{v=decodeURIComponent(v);}catch(e){}
  return valid(v)?v:null;
}
function fromStorage(){
  try{var v=window.localStorage.getItem(${JSON.stringify(
    GN_THEME_STORAGE_KEY,
  )});return valid(v)?v:null;}catch(e){return null;}
}
var ssr=root.getAttribute("data-theme-ssr");
if(!ssr){ssr=root.getAttribute("data-theme")||def;root.setAttribute("data-theme-ssr",ssr);}
var theme=fromCookie()||fromStorage()||(valid(ssr)?ssr:def);
root.setAttribute("data-theme",theme);
if(theme!==ssr&&needsExperience[theme]){
  root.setAttribute("data-experience-pending","");
  window.setTimeout(function(){
    root.removeAttribute("data-experience-pending");
  },${EXPERIENCE_PENDING_TIMEOUT_MS});
}else{
  root.removeAttribute("data-experience-pending");
}
var meta=d.querySelector('meta[name="theme-color"]');
if(meta)meta.setAttribute("content",colors[theme]||colors[def]);
}catch(e){}})();`;
}

/** Stable script string; computed once per process. */
export function getThemeInitScript(): string {
  return THEME_INIT_SCRIPT;
}

const THEME_INIT_SCRIPT = buildThemeInitScript();
