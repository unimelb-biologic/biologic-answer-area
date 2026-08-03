export function globalConsoleLog(category = 'any', ...args) {
  const allowedCategories = ['geom', 'undo', 'any', 'net', 'conn'];

  if (allowedCategories.includes(category)) {
    console.log(`[${category}]`, ...args); // Spread to preserve multiple arguments
  }
}

// Fisher-Yates shuffle algorithm to generate a random order of choices for each choice list in the originalFacts array
export function generateChoiceDisplayOrder(
  originalFacts,
  random = Math.random,
) {
  let hasChoiceList = false;
  const choiceDisplayOrder = originalFacts.map((fact) => {
    if (!Array.isArray(fact)) {
      return null;
    }

    hasChoiceList = true;
    const indexes = Array.from({ length: fact.length }, (_, index) => index);

    // If the first element is a placeholder, keep it in the first position
    const firstShuffledIndex =
      typeof fact[0] === 'string' && fact[0].startsWith('--') ? 1 : 0;

    for (let index = indexes.length - 1; index > firstShuffledIndex; index--) {
      const swapIndex =
        firstShuffledIndex +
        Math.floor(random() * (index - firstShuffledIndex + 1));
      [indexes[index], indexes[swapIndex]] = [
        indexes[swapIndex],
        indexes[index],
      ];
    }

    return indexes;
  });

  return hasChoiceList ? choiceDisplayOrder : undefined;
}

// Validates that the choiceDisplayOrder is a valid permutation of the originalFacts
export function isValidChoiceDisplayOrder(originalFacts, choiceDisplayOrder) {
  if (
    !Array.isArray(originalFacts) ||
    !Array.isArray(choiceDisplayOrder) ||
    originalFacts.length !== choiceDisplayOrder.length
  ) {
    return false;
  }

  let hasChoiceList = false;

  for (let factIndex = 0; factIndex < originalFacts.length; factIndex++) {
    const fact = originalFacts[factIndex];
    const displayOrder = choiceDisplayOrder[factIndex];

    if (!Array.isArray(fact)) {
      if (displayOrder !== null) {
        return false;
      }
      continue;
    }

    hasChoiceList = true;
    if (!Array.isArray(displayOrder) || displayOrder.length !== fact.length) {
      return false;
    }

    const seenIndexes = new Set();
    for (let index = 0; index < displayOrder.length; index++) {
      const originalIndex = displayOrder[index];
      if (
        !Number.isInteger(originalIndex) ||
        originalIndex < 0 ||
        originalIndex >= fact.length ||
        seenIndexes.has(originalIndex)
      ) {
        return false;
      }
      seenIndexes.add(originalIndex);
    }

    const hasPlaceholder =
      typeof fact[0] === 'string' && fact[0].startsWith('--');
    if (hasPlaceholder && displayOrder[0] !== 0) {
      return false;
    }
  }

  return hasChoiceList;
}
