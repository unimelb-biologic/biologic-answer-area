const MISSING_ANSWER_PLACEHOLDER = '...';

const decapitalizeFirstWord = (text) =>
  text.replace(
    /^(\s*[^\p{L}\p{N}]*)(\p{L})/u,
    (_, leadingCharacters, firstLetter) =>
      leadingCharacters + firstLetter.toLowerCase(),
  );

const isMidSentence = (text) => {
  const precedingText = text.trimEnd();
  const textBeforeClosingPunctuation = precedingText.replace(
    /["'’”\)\]\}]+$/u,
    '',
  );
  return (
    textBeforeClosingPunctuation !== '' &&
    !/[.!?]$/u.test(textBeforeClosingPunctuation)
  );
};

export function buildCollapsedContent({
  connectorID,
  allConnectors,
  allStatements,
}) {
  let text = '';
  const visitingConnectorIDs = new Set();

  const appendStatement = (connector, side) => {
    const statementID = connector[`${side}ID`];
    let statementText =
      connector[`${side}Content`] ?? MISSING_ANSWER_PLACEHOLDER;
    const allowCaseAdjustment =
      allStatements?.[String(statementID)]?.content?.autoCaseOnCollapse ===
      true;
    if (allowCaseAdjustment && isMidSentence(text)) {
      statementText = decapitalizeFirstWord(statementText);
    }
    text += statementText;
  };

  const appendChild = (connector, side) => {
    const childID = connector[`${side}ID`];
    const childType = connector[`${side}Type`];
    if (childID === undefined || childID === null || !childType) {
      text += MISSING_ANSWER_PLACEHOLDER;
    } else if (childType === 'statement') {
      appendStatement(connector, side);
    } else if (childType === 'connector') {
      appendConnector(childID);
    }
  };

  const appendConnector = (id) => {
    const key = String(id);
    const connector = allConnectors?.[key];
    if (!connector || visitingConnectorIDs.has(key)) {
      text += MISSING_ANSWER_PLACEHOLDER;
      return;
    }

    visitingConnectorIDs.add(key);
    const phrase =
      connector.connectorContent?.[connector.selectedPhrase ?? 0] || [];
    text += phrase[0] ?? '';
    appendChild(connector, 'left');
    text += phrase[1] ?? '';
    appendChild(connector, 'right');
    text += phrase[2] ?? '';
    visitingConnectorIDs.delete(key);
  };

  appendConnector(connectorID);
  return text;
}

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
