// safeHref — the theme's scheme guard for merchant-supplied link destinations
// (WR-06, T-11-09).
//
// Every `href` in this theme is a merchant-controlled string written verbatim
// into the DOM. React escapes the VALUE but does not inspect the SCHEME, so
// `javascript:`, `vbscript:` and `data:` URIs are accepted and execute in a
// visitor's browser on click. The phase plan recorded this as accepted on the
// grounds that the value comes from an authenticated merchant and matches the
// theme-wide posture; the nav-link submenu then multiplied the surface by 8 per
// nav item (up to 64 sinks at maxBlocks: 8), which is enough to be worth the
// one-line guard.
//
// Deliberately NOT a full URL parser. It is a scheme denylist, matched against
// the string AFTER stripping the characters a browser itself ignores while
// resolving a URL — whitespace and control characters. Those are the standard
// way to smuggle a blocked scheme past a naive prefix test (" javascript:...",
// "java<newline>script:alert(1)"). Everything else passes through UNCHANGED, so
// relative paths, fragments, mailto:, tel: and absolute http(s) URLs behave
// exactly as before.
//
// The fallback is `#`, matching the schema default every url setting already
// uses: a blocked value degrades to an inert link rather than vanishing, so the
// merchant can still see and fix the nav item.
//
// Rollout note: applied to `nav-link` here, where this phase added the new
// sinks. The remaining theme-wide anchors still write their href verbatim —
// routing them through this helper is the follow-up the phase plan promised,
// and it is now a mechanical change against one shared function rather than an
// open decision.
//
// No imports — this must stay dependency-free (nothing new may be bundled).
const BLOCKED_SCHEME = /^(?:javascript|vbscript|data):/i;

// Whitespace (\s) plus the Unicode "control" category (\p{Cc}, which covers the
// C0/C1 ranges and DEL) — written as classes rather than codepoint escapes so
// no literal control character ever lands in this source file.
const IGNORED_CHARS = /[\s\p{Cc}]/gu;

export const safeHref = (url?: string): string => {
  if (!url) return "#";
  const normalized = url.replace(IGNORED_CHARS, "");
  if (!normalized) return "#";
  return BLOCKED_SCHEME.test(normalized) ? "#" : url;
};
