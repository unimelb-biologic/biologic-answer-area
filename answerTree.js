const IMAGE_FILE_PATTERN = /\.(png|jpe?g)$/i;
const ROOT_STATEMENT_TYPE = 0;
const CONCLUSION_SIDE_BY_CONNECTOR_TYPE = {
  0: 'left',
  1: 'right',
  2: 'right',
};
const ROTATION_CONFIG = Object.freeze({
  left: Object.freeze({ childSide: 'right', transferSide: 'left' }),
  right: Object.freeze({ childSide: 'left', transferSide: 'right' }),
});

const isRootParent = (parentID) =>
  parentID === undefined || parentID === null || Number(parentID) === -1;

const cloneAnswer = (answer) =>
  JSON.parse(
    JSON.stringify({
      ...answer,
      rootConnectorID_set: Array.from(answer?.rootConnectorID_set || []),
      rootStatementID_set: Array.from(answer?.rootStatementID_set || []),
    }),
  );

const getStatementText = (answer, statementID) => {
  const statement = answer?.allStatements?.[String(statementID)];
  const content = statement?.content || {};

  if (statement?.statementType === 3) {
    return String(content.userInput ?? '');
  }

  const originalFacts = content.originalFacts;
  if (!Array.isArray(originalFacts)) {
    return '';
  }

  const userInput = Array.isArray(content.userInput) ? content.userInput : [];
  let inputIndex = 0;
  return originalFacts.reduce((text, fact) => {
    if (Array.isArray(fact)) {
      const savedValue = userInput[inputIndex];
      inputIndex += 1;
      const defaultValue =
        typeof fact[0] === 'string' &&
        fact[0].startsWith('--') &&
        fact.length > 1
          ? fact[1]
          : fact[0];
      return `${text}${savedValue || defaultValue || ''} `;
    }

    if (typeof fact === 'string' && !IMAGE_FILE_PATTERN.test(fact)) {
      return `${text}${fact} `;
    }

    return text;
  }, '');
};

const getConnectorPhrase = (connector) =>
  connector?.connectorContent?.[connector?.selectedPhrase ?? 0] || [];

const joinConnectorText = (connector, leftText, rightText) => {
  const phrase = getConnectorPhrase(connector);
  return [
    phrase[0] ?? '',
    leftText,
    phrase[1] ?? '',
    rightText,
    phrase[2] ?? '',
  ].join('');
};

const renderNodeReadout = (answer, id, type, context) => {
  if (id === undefined || id === null || !type) return '...';

  const key = `${type}:${String(id)}`;
  if (context.memo.has(key)) return context.memo.get(key);
  if (context.visiting.has(key)) {
    throw new Error('The answer tree contains a cycle.');
  }
  context.visiting.add(key);

  let text;
  if (type === 'statement') {
    text = getStatementText(answer, id);
    if (context.updateCache) answer.answerContent[String(id)] = text;
  } else if (type === 'connector') {
    const connector = answer?.allConnectors?.[String(id)];
    if (!connector) throw new Error(`Connector ${String(id)} was not found.`);

    const leftText = renderNodeReadout(
      answer,
      connector.leftID,
      connector.leftType,
      context,
    );
    const rightText = renderNodeReadout(
      answer,
      connector.rightID,
      connector.rightType,
      context,
    );

    if (context.updateCache) {
      connector.leftContent = leftText;
      connector.rightContent = rightText;
      connector.leftStatementIdentifier =
        connector.leftType === 'statement'
          ? answer.allStatements[String(connector.leftID)]?.statementIdentifier
          : undefined;
      connector.rightStatementIdentifier =
        connector.rightType === 'statement'
          ? answer.allStatements[String(connector.rightID)]?.statementIdentifier
          : undefined;
    }

    text = joinConnectorText(connector, leftText, rightText);
    if (context.updateCache) answer.answerContent[String(id)] = text;
  } else {
    throw new Error(`Unknown child type: ${type}`);
  }

  context.visiting.delete(key);
  context.memo.set(key, text);
  return text;
};

const createRenderContext = (updateCache) => ({
  memo: new Map(),
  visiting: new Set(),
  updateCache,
});

const getNodeReadout = (answer, id, type) =>
  renderNodeReadout(answer, id, type, createRenderContext(false));

const rebuildAnswerContent = (answer) => {
  answer.answerContent = { ...(answer.answerContent || {}) };
  const context = createRenderContext(true);
  Object.keys(answer.allStatements || {}).forEach((id) =>
    renderNodeReadout(answer, id, 'statement', context),
  );
  Object.keys(answer.allConnectors || {}).forEach((id) =>
    renderNodeReadout(answer, id, 'connector', context),
  );
};

export const rotateAnswerTree = (answer, connectorID, direction) => {
  const rotation = ROTATION_CONFIG[direction];
  if (!rotation) {
    return { ok: false, reason: 'Direction must be left or right.' };
  }

  const rotatedAnswer = cloneAnswer(answer);
  const pivot = rotatedAnswer.allConnectors?.[String(connectorID)];
  const { childSide, transferSide } = rotation;
  if (!pivot || pivot[`${childSide}Type`] !== 'connector') {
    return {
      ok: false,
      reason: `A ${childSide} connector is required.`,
    };
  }

  const promoted = rotatedAnswer.allConnectors[String(pivot[`${childSide}ID`])];
  if (!promoted) {
    return {
      ok: false,
      reason: `The ${childSide} connector was not found.`,
    };
  }

  const pivotID = pivot.connectorID ?? connectorID;
  const promotedID = promoted.connectorID ?? pivot[`${childSide}ID`];
  let originalReadout;
  try {
    originalReadout = getNodeReadout(answer, connectorID, 'connector');
  } catch (error) {
    return { ok: false, reason: error.message };
  }
  const previousParent = pivot.parent;
  let parentSide = null;
  if (!isRootParent(previousParent)) {
    const parent = rotatedAnswer.allConnectors[String(previousParent)];
    if (
      parent?.leftType === 'connector' &&
      String(parent.leftID) === String(pivotID)
    ) {
      parentSide = 'left';
    } else if (
      parent?.rightType === 'connector' &&
      String(parent.rightID) === String(pivotID)
    ) {
      parentSide = 'right';
    } else {
      return { ok: false, reason: 'The connector parent link is invalid.' };
    }
  }
  const transferredID = promoted[`${transferSide}ID`];
  const transferredType = promoted[`${transferSide}Type`];

  pivot.parent = promotedID;
  pivot[`${childSide}ID`] = transferredID;
  pivot[`${childSide}Type`] = transferredType;
  promoted.parent = previousParent;
  promoted[`${transferSide}ID`] = pivotID;
  promoted[`${transferSide}Type`] = 'connector';

  if (parentSide) {
    const parent = rotatedAnswer.allConnectors[String(previousParent)];
    parent[`${parentSide}ID`] = promotedID;
    parent[`${parentSide}Type`] = 'connector';
    parent[`${parentSide}StatementIdentifier`] = undefined;
  }

  if (
    transferredID !== undefined &&
    transferredID !== null &&
    transferredType
  ) {
    const collection =
      transferredType === 'statement'
        ? rotatedAnswer.allStatements
        : rotatedAnswer.allConnectors;
    const transferred = collection?.[String(transferredID)];
    if (transferred) {
      transferred.parent = pivotID;
      if (transferredType === 'statement') transferred.side = childSide;
    }
  }

  const replacedRoot = rotatedAnswer.rootConnectorID_set.some(
    (id) => String(id) === String(pivotID),
  );
  rotatedAnswer.rootConnectorID_set = rotatedAnswer.rootConnectorID_set.map(
    (id) => (String(id) === String(pivotID) ? promotedID : id),
  );
  if (replacedRoot && rotatedAnswer.rootConnectorID_set.length === 1) {
    rotatedAnswer.rootConnectorID = promotedID;
  } else if (String(rotatedAnswer.rootConnectorID) === String(pivotID)) {
    rotatedAnswer.rootConnectorID = promotedID;
  }
  if (isRootParent(previousParent)) {
    promoted.top = pivot.top;
    promoted.left = pivot.left;
  }

  try {
    rebuildAnswerContent(rotatedAnswer);
    const rotatedReadout = getNodeReadout(
      rotatedAnswer,
      promotedID,
      'connector',
    );
    if (rotatedReadout !== originalReadout) {
      return {
        ok: false,
        reason: 'Rotation would change the answer read-out.',
      };
    }
  } catch (error) {
    return { ok: false, reason: error.message };
  }

  return {
    ok: true,
    answer: rotatedAnswer,
    promotedConnectorID: promotedID,
  };
};

export const canRotateAnswerTree = (answer, connectorID, direction) => {
  const result = rotateAnswerTree(answer, connectorID, direction);
  return result.ok
    ? { allowed: true, reason: '' }
    : { allowed: false, reason: result.reason };
};

export const findConclusionSideWarnings = (answer) => {
  const warnings = [];
  const allStatements = answer?.allStatements || {};
  const allConnectors = answer?.allConnectors || {};

  Object.entries(allStatements).forEach(([statementID, statement]) => {
    if (statement?.statementType !== ROOT_STATEMENT_TYPE) return;

    let childID = statementID;
    let childType = 'statement';
    let parentID = statement.parent;
    const visitedConnectorIDs = new Set();

    while (!isRootParent(parentID)) {
      const connectorID = String(parentID);
      const connector = allConnectors[connectorID];
      if (!connector || visitedConnectorIDs.has(connectorID)) return;
      visitedConnectorIDs.add(connectorID);

      const expectedConclusionSide =
        CONCLUSION_SIDE_BY_CONNECTOR_TYPE[Number(connector.connectorContentID)];
      let actualConclusionSide = null;
      if (
        String(connector.leftID) === String(childID) &&
        connector.leftType === childType
      ) {
        actualConclusionSide = 'left';
      } else if (
        String(connector.rightID) === String(childID) &&
        connector.rightType === childType
      ) {
        actualConclusionSide = 'right';
      }

      if (
        expectedConclusionSide &&
        actualConclusionSide &&
        actualConclusionSide !== expectedConclusionSide
      ) {
        warnings.push({
          type: 'conclusion-side-mismatch',
          connectorID,
          connectorContentID: Number(connector.connectorContentID),
          conclusionStatementID: statementID,
          expectedConclusionSide,
          actualConclusionSide,
        });
      }

      childID = connectorID;
      childType = 'connector';
      parentID = connector.parent;
    }
  });

  return warnings;
};
