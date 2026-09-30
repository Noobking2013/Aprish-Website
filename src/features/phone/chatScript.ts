import type { ChatScript } from "@/content/copy";

/**
 * Free-text handling for the scripted demo (docs/06, section B.4).
 *
 * The composer tests what the visitor typed against the active script's keyword
 * regexes. Kept pure on purpose: no DOM, no React, so the matching rule can be
 * checked on its own.
 */
export function matchKeyword(script: ChatScript, text: string): number | null {
  const value = text.trim();
  if (value === "") return null;

  for (const keyword of script.keywords) {
    // The keyword regexes carry no /g flag, so test() cannot leak state between calls.
    if (keyword.match.test(value) && script.options[keyword.option]) {
      return keyword.option;
    }
  }

  return null;
}

const TOKEN_NUMBER = /(Token #\d+)/g;

/**
 * Splits a confirmation into plain and mono runs so the token number can be set in
 * Space Mono (docs/06, section B.5). Splitting the real string keeps those words out
 * of the components.
 */
export function tokenSegments(text: string): string[] {
  return text.split(TOKEN_NUMBER);
}
