import _ from 'lodash';
import {
  Connector_T,
  ConnectorID_T,
  Direction_T,
  ElementID_T,
  ElementTypes_T,
  Orientation_T,
  Statement_T,
} from './AnswerAreaTypes';

/**
 * @returns A new element id. The format is a 15-digit number stored as a string.
 */
export function newElementId(): string {
  return _.random(100_000_000_000_000, 999_999_999_999_999).toString();
}

/**
 *
 * @returns True if the id is valid
 */
export function validParentID(id: string | number | null): boolean {
  return id !== null && id !== -1;
}

/**
 *
 * @returns A copy of the passed connector with its left or right child removed
 * (depending on the passed direction). Returns an unmodified copy of the original
 * if an invalid direction is passed.
 */
export function deleteChild(
  connector: Connector_T,
  direction: Direction_T,
): Connector_T {
  if (direction !== 'left' && direction !== 'right') {
    console.error('Invalid child direction');
    return { ...connector };
  }
  const con = {
    ...connector,
  };
  con[`${direction}ID`] = undefined;
  con[`${direction}Type`] = undefined;
  con[`${direction}Content`] = undefined;
  // con[`${direction}StatementIdentifier`] = undefined;
  return con;
}

export function addChild(
  connector: Connector_T,
  direction: Direction_T,
  id: ElementID_T,
  type: ElementTypes_T,
  content: string,
): Connector_T {
  if (direction !== 'left' && direction !== 'right') {
    console.error('Invalid child direction');
    return { ...connector };
  }
  const con = {
    ...connector,
  };
  con[`${direction}ID`] = id;
  con[`${direction}Type`] = type;
  con[`${direction}Content`] = content;
  // con[`${direction}StatementIdentifier`] = undefined;
  return con;
}

export function setConnectorID(
  connector: Connector_T,
  id: ConnectorID_T,
): Connector_T {
  return {
    ...connector,
    connectorID: id,
  };
}

export function setConnectorParentID(
  connector: Connector_T,
  id: ElementID_T,
): Connector_T {
  return {
    ...connector,
    parent: id,
  };
}

export function setConnectorOrientation(
  connector: Connector_T,
  orientation: Orientation_T,
): Connector_T {
  return { ...connector, orientation: orientation };
}

export function setConnectorClickCount(
  connector: Connector_T,
  clickCount: number,
): Connector_T {
  return {
    ...connector,
    clickCount: clickCount,
  };
}

export function setConnectorPosition(
  connector: Connector_T,
  position: number[],
): Connector_T {
  if (position.length !== 2) {
    console.error('Invalid position array');
    return connector;
  }
  return {
    ...connector,
    left: position[0],
    top: position[1],
  };
}

export function getStatementParentID(statement: Statement_T): ConnectorID_T {
  return statement['parent'];
}
