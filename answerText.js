const MISSING_ANSWER_PLACEHOLDER = '...';

export function formatAnswerText(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return MISSING_ANSWER_PLACEHOLDER;
  }

  const textWithoutWhitespaceBeforePunctuation = text.replace(
    /\s+([.,;:!?])/g,
    '$1',
  );

  const capitalizedText = textWithoutWhitespaceBeforePunctuation.replace(
    /^(\s*[^\p{L}\p{N}]*)(\p{Ll})/u,
    (_, leadingCharacters, firstLetter) =>
      leadingCharacters + firstLetter.toUpperCase(),
  );

  const textWithoutTrailingWhitespace = capitalizedText.trimEnd();
  if (/[.!?]$/u.test(textWithoutTrailingWhitespace)) {
    return textWithoutTrailingWhitespace;
  }

  return textWithoutTrailingWhitespace + '.';
}
