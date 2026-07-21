import { id } from 'vuetify/locale';
import { newElementId } from './util';

export type ConnectorID_T = string;
export type StatementID_T = string;
export type ElementID_T = ConnectorID_T | StatementID_T;
export type ElementTypes_T = 'statement' | 'connector';
export type Direction_T = 'left' | 'right';
export type Orientation_T = 'row' | 'column';
export type AnswerContent_T = { [key: ElementID_T]: string };

export class AnswerAreaData_T {
  #rootConnectorID_set: Set<ConnectorID_T> = new Set();
  #rootStatementID_set: Set<StatementID_T> = new Set();

  #allConnectors: { [key: ConnectorID_T]: Connector_T } = {};
  #allStatements: { [key: StatementID_T]: Statement_T } = {};

  // This maps two things:
  // - Element IDs to their content - strangely, this is using numbers rather than strings. I think it should be using strings.
  // - Sequential numbers to each concatenation of the answers.
  #answerContent: { [key: ElementID_T]: string } = {};

  #undoStack: AnswerAreaState_T[] = [];
  #redoStack: AnswerAreaState_T[] = [];
  #currentState: AnswerAreaState_T = {
    rootConnectorID_set: [],
    rootStatementID_set: [],
    allConnectors: {},
    allStatements: {},
    answerContent: {},
    // connectorCount: 0,
    // rootConnectorID: null,
    // left: number;
    // top: number;
  };
  #ignoreStateChanges: boolean = false;
  #activeHover: { id: ElementID_T | null; depth: number } = {
    id: null,
    depth: -1,
  };

  static fromJSON(data: AnswerAreaData_T): AnswerAreaData_T {
    return Object.assign(new AnswerAreaData_T(), {
      ...data,
      allConnectors: Object.entries(data.allConnectors).map(([_, connector]) =>
        Connector_T.fromJSON(connector),
      ),
      allStatements: Object.entries(data.allStatements).map(([_, statement]) =>
        Statement_T.fromJSON(statement),
      ),
    });
  }
  public getConnector(id: ConnectorID_T): Connector_T {
    return this.allConnectors[id];
  }
  public getStatement(id: StatementID_T): Statement_T {
    return this.allStatements[id];
  }
  public resetUndoStack() {
    this.#undoStack = [];
  }
  public resetRedoStack() {
    this.#redoStack = [];
  }
  public clearActiveHover() {
    this.#activeHover.id = null;
    this.#activeHover.depth = -1;
  }
  public deleteRootStatementID(id: StatementID_T) {
    this.rootStatementIDs.delete(id);
  }
  public deleteRootConnectorID(id: StatementID_T) {
    this.rootConnectorIDs.delete(id);
  }
  /**
   * If the new connector has the same id as an existing connector,
   * the existing connector will be written over.
   */
  public addConnector(connector: Connector_T) {
    this.allConnectors[connector.Id] = connector;
  }
  public hasRootConnectorID(id: ConnectorID_T): boolean {
    return this.rootConnectorIDs.has(id);
  }
  get allStatements() {
    return this.#allStatements;
  }
  get allConnectors() {
    return this.#allConnectors;
  }
  get rootConnectorIDs() {
    return this.#rootConnectorID_set;
  }
  get rootStatementIDs() {
    return this.#rootStatementID_set;
  }
  set activeHover({ id, depth }: { id: ElementID_T | null; depth: number }) {
    this.#activeHover.id = id;
    this.#activeHover.depth = depth;
  }
  get activeHoverID() {
    return this.#activeHover.id;
  }
  get answerContent() {
    return this.#answerContent;
  }
  get undoStack() {
    return this.#undoStack;
  }
  get redoStack() {
    return this.#redoStack;
  }
  get state() {
    return new AnswerAreaState_T(
      // this.connectorCount,
      Array.from(this.rootConnectorIDs),
      Array.from(this.rootStatementIDs),
      this.allConnectors,
      this.allStatements,
      this.answerContent,
    );
  }

  // #connectorCount: number = 0;
  // rootConnectorID: ConnectorID_T | null = null;
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

export class ExNetPackage_T {
  exnet_name: string = '';
  exnet_working_answer_json: ExNet_T = {};
  exnet_correct_answer_json: ExNet_T = {};
  exflow_working_answer_json: ExFlow_T = {};
  static fromJSON(exNetPackage: ExNetPackage_T) {
    return Object.assign(new ExNetPackage_T(), { ...exNetPackage, ExNet_T });
  }
}

export class ExNet_T {
  activeExNetQuestionPack?: { prompt_text: AnswerAreaData_T[] } = {
    prompt_text: [],
  };
  static fromJSON(exNet: ExNet_T) {
    if (!exNet.activeExNetQuestionPack) {
      return new ExNet_T();
    }
    if (
      !Array.isArray(exNet.activeExNetQuestionPack.prompt_text) ||
      exNet.activeExNetQuestionPack.prompt_text.length != 2
    ) {
      return Object.assign(new ExNet_T(), exNet);
    }
    return Object.assign(new ExNet_T(), {
      ...exNet,
      activeExNetQuestionPack: {
        prompt_text: [
          exNet.activeExNetQuestionPack.prompt_text[0],
          exNet.activeExNetQuestionPack.prompt_text[1],
        ],
      },
    });
  }
}

export class ExFlow_T {}

export abstract class Element_T {
  #parent: ConnectorID_T;
  top?: number;
  left?: number;
  constructor(parent: ConnectorID_T) {
    this.#parent = parent;
  }
  public hasParent() {
    return this.parent !== -1;
  }
  public removeParent() {
    this.parent = -1;
  }
  get parent() {
    return this.#parent;
  }
  set parent(parent: ConnectorID_T) {
    this.#parent = parent;
  }
  set exNetPosition(pos: number[]) {
    if (pos.length !== 2) {
      console.error('Invalid position array');
      return;
    }
    this.left = pos[0];
    this.top = pos[1];
  }
  abstract get Id(): ElementID_T;
  abstract set Id(id: ElementID_T);
}

export class Connector_T extends Element_T {
  connectorContentID: number; // corresponds to CONNECTOR_TYPES
  connectorContent: Array<String | null>;
  selectedPhrase: number;
  leftID?: ElementID_T;
  leftType?: ElementTypes_T;
  leftContent?: string;
  rightID?: ElementID_T;
  rightType?: ElementTypes_T;
  rightContent?: string;
  connectorID: ConnectorID_T;
  clickCount: number;
  orientation: 'row' | 'column';
  // leftStatementIdentifier: string // not really relevant - can just query the element itself
  constructor(parent: string) {
    super(parent);
    this.connectorContentID = 0;
    this.connectorContent = [];
    this.selectedPhrase = 0;
    this.parent = parent;
    this.connectorID = newElementId();
    this.clickCount = 0;
    this.orientation = 'row';
  }
  static fromJSON(connector: Connector_T) {
    return Object.assign(
      new Connector_T(connector.parent),
      structuredClone(connector),
    );
  }
  public deleteLeftChild() {
    this.deleteChild('left');
  }
  public deleteRightChild() {
    this.deleteChild('right');
  }
  public deleteChild(direction: Direction_T) {
    this[`${direction}ID`] = undefined;
    this[`${direction}Type`] = undefined;
    this[`${direction}Content`] = undefined;
    // con[`${direction}StatementIdentifier`] = undefined;
  }
  public addChild(
    direction: Direction_T,
    id: ElementID_T,
    type: ElementTypes_T,
    content: string,
  ) {
    if (direction !== 'left' && direction !== 'right') {
      console.error('Invalid child direction');
      return;
    }
    this[`${direction}ID`] = id;
    this[`${direction}Type`] = type;
    this[`${direction}Content`] = content;
    // con[`${direction}StatementIdentifier`] = undefined;
  }
  public resetClickCount() {
    this.clickCount = 0;
  }
  public resetOrientation() {
    this.orientation = 'row';
  }
  get Id() {
    return this.connectorID;
  }
  set Id(id: ConnectorID_T) {
    this.connectorID = id;
  }
}

export class Statement_T extends Element_T {
  statementType: string; // unique per statement
  id: StatementID_T;
  statementIdentifier: StatementID_T; // may be shared between statements
  content: {
    originalFacts: string[];
    // statement_free stores userInput as a string.
    // All other classes store userInput as a list of strings.
    userInput: string[] | string;
  };
  side?: Direction_T;
  position?: string;
  showPopup: boolean;
  collapsed: boolean;
  constructor(
    parent: ConnectorID_T,
    statementIdentifier: StatementID_T | null = null,
  ) {
    super(parent);
    this.id = newElementId();
    this.statementType = ''; // todo - document types
    this.statementIdentifier = statementIdentifier || newElementId();
    this.content = { originalFacts: [], userInput: [] };
    this.showPopup = false;
    this.collapsed = false;
  }
  static fromJSON(statement: Statement_T) {
    return Object.assign(
      new Statement_T(statement.parent),
      structuredClone(statement),
    );
  }
  get Id() {
    return this.id;
  }
  set Id(id: StatementID_T) {
    this.id = id;
  }
}
export class AnswerAreaState_T {
  constructor(
    public rootConnectorID_set: ConnectorID_T[],
    public rootStatementID_set: StatementID_T[],
    public allConnectors: { [key: ConnectorID_T]: Connector_T },
    public allStatements: { [key: StatementID_T]: Statement_T },
    public answerContent: AnswerContent_T,
  ) {}

  //! Unused
  // public connectorCount: number,
  // rootConnectorID: ConnectorID_T | null;
  // left: number;
  // top: number;
  // moveX: number;
  // moveY: number;
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
