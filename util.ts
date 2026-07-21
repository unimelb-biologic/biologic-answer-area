import _ from 'lodash';
import { Direction_T } from './AnswerAreaTypes';

/**
 * @returns A new element id. The format is a 15-digit number stored as a string.
 */
export function newElementId(): string {
  return _.random(100_000_000_000_000, 999_999_999_999_999).toString();
}

export function validDirection(dir: Direction_T): boolean {
  return dir === 'left' || dir === 'right';
}
