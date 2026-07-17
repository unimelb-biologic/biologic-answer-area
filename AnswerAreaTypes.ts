import { newElementId } from './util';

export type ConnectorID_T = string;
export type StatementID_T = string;
export type ElementID_T = ConnectorID_T | StatementID_T;
export type ElementTypes_T = 'statement' | 'connector';
export type Direction_T = 'left' | 'right';
export type Orientation_T = 'row' | 'column';
export type AnswerContent_T = { [key: ElementID_T]: string };

export interface AnswerAreaData_T {
  connectorCount: number;
  rootConnectorID_set: Set<ConnectorID_T>;
  rootStatementID_set: Set<StatementID_T>;
  rootConnectorID: ConnectorID_T | null;

  allConnectors: { [key: ConnectorID_T]: Connector_T };
  allStatements: { [key: StatementID_T]: Statement_T };

  // This maps two things:
  // - Element IDs to their content - strangely, this is using numbers rather than strings. I think it should be using strings.
  // - Sequential numbers to each concatenation of the answers.
  answerContent: { [key: ElementID_T]: string };

  undoStack: Array<AnswerAreaState_T>;
  redoStack: Array<AnswerAreaState_T>;
  currentState: AnswerAreaState_T;
  ignoreStateChanges: boolean;
  activeHover: { id: ElementID_T | null; depth: number };

  // left: number;
  // top: number;
  // moveX: number;
  // moveY: number;
  // moveItem: null; // I don't think this is ever used...
  // data_Object: {}; // unused
  // localTestProp: 1; // written to but never read
  // isFullscreen: false; // written to but never used. Same deal on BuilderQuestionPage actually
  // None of the values in globalTooltipState are actually ever used (they are set but never read).
  // Connector.vue does at one point set globalTooltipState.animal to 'cat' and 'mouse',
  // but these values are never used.
  // Similarly, globalTooltipState.showTooltips is toggled but never read.
  // globalTooltipState: {
  //   showTooltips: true;
  // };
}

export interface Connector_T {
  connectorContentID: number; // corresponds to CONNECTOR_TYPES
  connectorContent: Array<String | null>;
  selectedPhrase: number;
  leftID?: ElementID_T;
  leftType?: ElementTypes_T;
  leftContent?: string;
  rightID?: ElementID_T;
  rightType?: ElementTypes_T;
  rightContent?: string;
  parent: string; // can also be -1...
  connectorID: ConnectorID_T;
  clickCount: number;
  orientation: 'row' | 'column';
  top?: number;
  left?: number;
  // leftStatementIdentifier: string // not really relevant - can just query the element itself
  // constructor(parent: string) {
  //   this.connectorContentID = 0;
  //   this.connectorContent = [];
  //   this.selectedPhrase = 0;
  //   this.parent = parent;
  //   this.connectorID = newElementId();
  //   this.clickCount = 0;
  //   this.orientation = 'row';
  // }
  // public deleteLeftChild() {
  //   this.deleteChild('left');
  // }
  // public deleteRightChild() {
  //   this.deleteChild('right');
  // }
  // public deleteChild(direction: Directions_T) {
  //   this[`${direction}ID`] = undefined;
  //   this[`${direction}Type`] = undefined;
  //   this[`${direction}Content`] = undefined;
  //   // con[`${direction}StatementIdentifier`] = undefined;
  // }
}

export interface Statement_T {
  statementType: string; // unique per statement
  id: StatementID_T;
  statementIdentifier: StatementID_T; // may be shared between statements
  content: {
    originalFacts: Array<string>;
    // statement_free stores userInput as a string.
    // All other classes store userInput as a list of strings.
    userInput: Array<string> | string;
  };
  parent: ConnectorID_T;
  side: Direction_T;
  position?: string;
  top?: number;
  left?: number;
  showPopup: boolean;
  collapsed: boolean;
}

export interface AnswerAreaState_T {
  connectorCount: number;
  rootConnectorID_set: Array<ConnectorID_T>;
  rootConnectorID: ConnectorID_T | null;
  rootStatementID_set: Array<StatementID_T>;
  allConnectors: { [key: ConnectorID_T]: Connector_T };
  allStatements: { [key: StatementID_T]: Statement_T };
  // left: number;
  // top: number;
  // moveX: number;
  // moveY: number;
  answerContent: AnswerContent_T;

  //! Unused
  // statementFlag: this.statementFlag,
  // statementsType: this.statementsType,
  // rootContent: this.rootContent,
  // moveItem: this.moveItem,
}

export interface ConnectorEmittedInfo_T {
  connectorID: ConnectorID_T;
  statementID: StatementID_T;
  content: string;
  event: DragEvent;
  data: any;
  selectedPhrase: number;
  direction: Direction_T;
  statement: Statement_T;
}

const CONNECTOR_TYPES = {
  0: 'because',
  1: 'so',
  2: 'shows that',
  3: 'and',
  4: 'whereas',
  5: 'and', // furthermore - outdated connector type
  6: 'so', // conditional - outdated connector type
  7: 'e.g.',
  8: 'i.e.',
};
