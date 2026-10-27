const STOPWORDS = new Set(
  (
    // English
    "the and for are but not you your yours was were been being have has had having does did doing " +
    "can could would should will shall may might must this that these those with without from into onto " +
    "about above after again against all any because before below between both down during each few " +
    "further here how its more most other our out over own same some such than then there their them they " +
    "through under until very what when where which while who whom why also just only into per via " +
    // German
    "der die das den dem des ein eine einen einem einer eines und oder aber nicht ist sind war waren wird " +
    "werden wurde wurden hat haben hatte hatten kann können muss müssen soll sollen mit ohne von vom zum " +
    "zur für auf aus bei nach über unter vor wie was wer wann wo warum welche welcher welches wieviel " +
    "viele sich sein ihre ihr ihren als auch noch nur schon dass diese dieser dieses"
  ).split(" "),
);

const MAX_TERMS = 12;
const MIN_LENGTH = 3;
const MIN_PART_LENGTH = 2;

/**
 * Picks the words of a question worth searching for by keyword: no stop words, no very short
 * words. Identifiers such as "claims@example.com" stay in one piece, because full-text search
 * treats them as single tokens. A hyphenated code such as "SCH-7B" is kept and also split into its
 * parts ("sch", "7b"), because the database indexes it in pieces and the whole form may not match.
 */
export function extractKeywordTerms(question: string): string[] {
  const terms: string[] = [];
  const seen = new Set<string>();
  const add = (term: string) => {
    if (terms.length >= MAX_TERMS || seen.has(term)) return;
    seen.add(term);
    terms.push(term);
  };

  for (const raw of question.toLowerCase().split(/\s+/)) {
    // Trim surrounding punctuation, keep inner @ . - / _ so identifiers survive.
    const word = raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (word.length < MIN_LENGTH || STOPWORDS.has(word)) continue;
    add(word);
    if (/[-_]/.test(word) && !word.includes("@")) {
      for (const part of word.split(/[-_]+/)) {
        if (part.length >= MIN_PART_LENGTH && !STOPWORDS.has(part)) add(part);
      }
    }
  }
  return terms;
}
