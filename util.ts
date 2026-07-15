import _ from 'lodash';

/**
 * @returns A new element id. The format is a 15-digit number stored as a string.
 */
export function newElementId(): string {
  return _.random(100_000_000_000_000, 999_999_999_999_999).toString();
}

export function validParentID(id: string | number | null): boolean {
  return id !== null && id !== -1;
}
