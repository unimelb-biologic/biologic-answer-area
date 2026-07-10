export type ConnectorID_T = string;
export type StatementID_T = string;
export type ElementID_T = ConnectorID_T | StatementID_T;

export interface AnswerAreaData_T {
  connectorCount: 0;
  rootConnectorID_set: Set<ConnectorID_T>;
  rootStatementID_set: Set<StatementID_T>;
  rootConnectorID: string | null;

  allConnectors: { [key: ConnectorID_T]: Connector_T };
  allStatements: { [key: StatementID_T]: Statement_T };
  left: number;
  top: number;

  moveX: number;
  moveY: number;

  // This maps two things:
  // - Element IDs to their content - strangely, this is using numbers rather than strings. I think it should be using strings.
  // - Sequential numbers to each concatenation of the answers.
  answerContent: { [key: number]: string };

  undoStack: Array<AnswerAreaState_T>;
  redoStack: Array<AnswerAreaState_T>;
  currentState: AnswerAreaState_T | null;
  ignoreStateChanges: false;
  activeHover: { id: ElementID_T | null; depth: number };

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
  leftID: ElementID_T;
  leftType: string; // 'statement' or 'connector'
  rightID: ElementID_T;
  rightType: string; // 'statement' or 'connector'
  leftContent: string;
  rightContent: string;
  parent: string;
  connectorID: string;
  clickCount: number;
  orientation: string;
  top: number;
  left: number;
}

export interface Statement_T {
  statementType: String; // unique per statement
  id: String;
  statementIdentifier: String; // may be shared between statements
  content: ExNetStatementContent_T;
}

export interface ExNetStatementContent_T {
  originalFacts: Array<string>;
  // statement_free stores userInput as a string.
  // All other classes store userInput as a list of strings.
  userInput: Array<string> | string;
}

export interface AnswerAreaState_T {
  connectorCount: number;
  rootConnectorID_set: Array<ConnectorID_T>;
  rootConnectorID: ConnectorID_T | null;
  rootStatementID_set: Array<StatementID_T>;
  allConnectors: { [key: ConnectorID_T]: Connector_T };
  allStatements: { [key: StatementID_T]: Statement_T };
  left: number;
  top: number;
  moveX: number;
  moveY: number;
  answerContent: { [key: number]: string };

  //! Unused
  // statementFlag: this.statementFlag,
  // statementsType: this.statementsType,
  // rootContent: this.rootContent,
  // moveItem: this.moveItem,
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
