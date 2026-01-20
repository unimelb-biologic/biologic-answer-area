/**
 *
 * @param {str} option
 * @returns {bool} Whether the option is a placeholder option.
 */
export function isPlaceHolderOption(option) {
  return option.startsWith('--');
}
