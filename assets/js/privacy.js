/*
 * STEM 207 — a privacy check for words students write that leave their device (pure; no network).
 * Before a student's website is saved for their teacher or shared with the class, this looks for things that
 * point to a real person: an email address, a phone number, a street address, a link to another website, or
 * phrases like "my name is" or "I go to". It can't catch everything, so the teacher still approves sharing.
 *
 *   SE.privacy.scan(text) → [{ kind, at, length, text, say }]   at: where it is in the text
 */
(function () {
  "use strict";
  const SE = (window.SE = window.SE || {});
  const RULES = [
    { kind: "email", re: /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, say: "an email address" },
    { kind: "phone", re: /(?<![\w#])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}(?!\w)/g, say: "a phone number" },
    { kind: "address", re: /\b\d{1,5}\s+(?:[A-Z][a-z]+\s+){1,3}(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Way|Court|Ct|Boulevard|Blvd|Place|Pl)\b\.?/g, say: "a street address" },
    { kind: "link", re: /\bhttps?:\/\/[^\s"'<>]+|\bwww\.[^\s"'<>]+/gi, say: "a link to another website" },
    { kind: "about-me", re: /\b(?:my (?:full |last |real )?name is|i live (?:on|at|in)|my address|i go to|my school is|my phone|call me at|text me at|my birthday is)\b/gi, say: "something about who you are or where you live" }
  ];
  function scan(text) {
    const s = String(text || ""), out = [];
    RULES.forEach((r) => {
      r.re.lastIndex = 0;
      let m;
      while ((m = r.re.exec(s))) out.push({ kind: r.kind, at: m.index, length: m[0].length, text: m[0], say: r.say });
    });
    return out.sort((a, b) => a.at - b.at);
  }
  SE.privacy = { scan, RULES };
})();
