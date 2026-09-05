import { toRaw } from 'vue';
import { newElementId } from './util';
import _ from 'lodash';

export type ConnectorID_T = string;
export type StatementID_T = string;
export type ScaffoldID_T = string;
export type ElementID_T = ConnectorID_T | StatementID_T | ScaffoldID_T;
export type ElementTypes_T = 'statement' | 'connector' | 'scaffold';
export type Direction_T = 'left' | 'right';
export type Orientation_T = 'row' | 'column';
export type AnswerContent_T = { [key: ElementID_T]: string };

// ---------------------------------------------------------------------------
// AnswerAreaData_T  (updated to include scaffolds)
// ---------------------------------------------------------------------------

export class AnswerAreaData_T {
  private stateStack: StateStack_T = {
    undoStack: [],
    redoStack: [],
    currentState: {
      rootConnectorID_set: [],
      rootStatementID_set: [],
      rootScaffoldID_set: [],
      allConnectors: {},
      allStatements: {},
      allScaffolds: {},
      answerContent: {},
    },
    ignoreStateChanges: false,
  };
  private rootConnectorID_set: Set<ConnectorID_T> = new Set();
  private rootStatementID_set: Set<StatementID_T> = new Set();
  private rootScaffoldID_set: Set<ScaffoldID_T> = new Set();

  private allConnectors: { [key: ConnectorID_T]: Connector_T } = {};
  private allStatements: { [key: StatementID_T]: Statement_T } = {};
  private allScaffolds: { [key: ScaffoldID_T]: Scaffold_T } = {};

  private answerContent: { [key: ElementID_T]: string } = {};

  private activeHover: { id: ElementID_T | null; depth: number } = {
    id: null,
    depth: -1,
  };

  static fromJSON(data: AnswerAreaData_T): AnswerAreaData_T {
    const d: AnswerAreaData_T = Object.assign(new AnswerAreaData_T(), {
      ...data,
      allConnectors: Object.fromEntries(
        Object.entries(data.allConnectors).map(([id, connector]) => [
          id,
          Connector_T.fromJSON(connector),
        ]),
      ),
      allStatements: Object.fromEntries(
        Object.entries(data.allStatements).map(([id, statement]) => [
          id,
          Statement_T.fromJSON(statement),
        ]),
      ),
      allScaffolds: Object.fromEntries(
        Object.entries(data.allScaffolds ?? {}).map(([id, scaffold]) => [
          id,
          Scaffold_T.fromJSON(scaffold),
        ]),
      ),
    });
    return d;
  }

  // --- Connectors ---

  public getConnector(id: ConnectorID_T): Connector_T {
    return this.connectors[id];
  }
  public addConnector(connector: Connector_T) {
    this.connectors[connector.Id] = connector;
  }
  public deleteConnector(id: ConnectorID_T) {
    delete this.connectors[id];
  }

  // --- Statements ---

  public getStatement(id: StatementID_T): Statement_T {
    return this.statements[id];
  }
  public addStatement(statement: Statement_T) {
    this.statements[statement.Id] = statement;
  }
  public deleteStatement(id: StatementID_T) {
    delete this.statements[id];
  }

  // --- Scaffolds ---

  public getScaffold(id: ScaffoldID_T): Scaffold_T {
    return this.allScaffolds[id];
  }
  public addScaffold(scaffold: Scaffold_T) {
    this.allScaffolds[scaffold.Id] = scaffold;
  }
  public deleteScaffold(id: ScaffoldID_T) {
    delete this.allScaffolds[id];
  }

  // --- Root ID sets ---

  public deleteRootStatementID(id: StatementID_T) {
    this.rootStatementIDs.delete(id);
  }
  public deleteRootConnectorID(id: ConnectorID_T) {
    this.rootConnectorIDs.delete(id);
  }
  public deleteRootScaffoldID(id: ScaffoldID_T) {
    this.rootScaffoldIDs.delete(id);
  }
  public hasRootConnectorID(id: ConnectorID_T): boolean {
    return this.rootConnectorIDs.has(id);
  }
  public hasRootStatementID(id: StatementID_T): boolean {
    return this.rootStatementIDs.has(id);
  }
  public hasRootScaffoldID(id: ScaffoldID_T): boolean {
    return this.rootScaffoldIDs.has(id);
  }
  public addRootConnectorID(id: ConnectorID_T) {
    this.rootConnectorIDs.add(id);
  }
  public addRootStatementID(id: StatementID_T) {
    this.rootStatementIDs.add(id);
  }
  public addRootScaffoldID(id: ScaffoldID_T) {
    this.rootScaffoldIDs.add(id);
  }

  // --- Undo / redo ---

  public resetUndoStack() {
    this.stateStack.undoStack = [];
  }
  public resetRedoStack() {
    this.stateStack.redoStack = [];
  }
  public saveState() {
    this.stateStack.currentState = this.state;
  }
  set currentState(state: AnswerAreaState_T) {
    this.stateStack.currentState = state;
  }
  get currentState() {
    return this.stateStack.currentState;
  }
  get undoStack() {
    return this.stateStack.undoStack;
  }
  get redoStack() {
    return this.stateStack.redoStack;
  }

  // --- State ignore ---

  public ignoreStateChanges() {
    this.stateStack.ignoreStateChanges = true;
  }
  public unignoreStateChanges() {
    this.stateStack.ignoreStateChanges = false;
  }
  get ignoringStateChanges() {
    return this.stateStack.ignoreStateChanges;
  }

  // --- Hover ---

  public clearActiveHover() {
    this.activeHover.id = null;
    this.activeHover.depth = -1;
  }
  get hoverInfo() {
    return this.activeHover;
  }
  set hoverInfo({ id, depth }: { id: ElementID_T | null; depth: number }) {
    this.activeHover.id = id;
    this.activeHover.depth = depth;
  }
  get activeHoverID() {
    return this.activeHover.id;
  }

  // --- Getters ---

  get statements() {
    return this.allStatements;
  }
  get connectors() {
    return this.allConnectors;
  }
  get scaffolds() {
    return this.allScaffolds;
  }
  get rootConnectorIDs() {
    return this.rootConnectorID_set;
  }
  get rootStatementIDs() {
    return this.rootStatementID_set;
  }
  get rootScaffoldIDs() {
    return this.rootScaffoldID_set;
  }
  get allAnswerContent() {
    return this.answerContent;
  }

  // --- Snapshot ---

  get state(): AnswerAreaState_T {
    return JSON.parse(
      JSON.stringify(
        new AnswerAreaState_T(
          Array.from(this.rootConnectorIDs),
          Array.from(this.rootStatementIDs),
          Array.from(this.rootScaffoldIDs),
          this.connectors,
          this.statements,
          this.allScaffolds,
          this.allAnswerContent,
        ),
      ),
    );
  }

  // --- Load from snapshot ---

  public loadFromPreviousAnswer(snapshot: AnswerAreaState_T) {
    this.rootConnectorID_set = new Set(snapshot.rootConnectorID_set || []);
    this.rootStatementID_set = new Set(snapshot.rootStatementID_set || []);
    this.rootScaffoldID_set = new Set(snapshot.rootScaffoldID_set || []);
    this.allConnectors = snapshot.allConnectors || {};
    this.allStatements = snapshot.allStatements || {};
    this.allScaffolds = snapshot.allScaffolds || {};
    this.answerContent = snapshot.answerContent || {};
  }
}

// ---------------------------------------------------------------------------
// AnswerAreaState_T  (updated snapshot class)
// ---------------------------------------------------------------------------

class AnswerAreaState_T {
  constructor(
    public rootConnectorID_set: ConnectorID_T[],
    public rootStatementID_set: StatementID_T[],
    public rootScaffoldID_set: ScaffoldID_T[],
    public allConnectors: { [key: ConnectorID_T]: Connector_T },
    public allStatements: { [key: StatementID_T]: Statement_T },
    public allScaffolds: { [key: ScaffoldID_T]: Scaffold_T },
    public answerContent: AnswerContent_T,
  ) {}
  static fromJSON() {}
}

// ---------------------------------------------------------------------------
// StateStack_T  (updated to include scaffold root set)
// ---------------------------------------------------------------------------

interface StateStack_T {
  undoStack: AnswerAreaState_T[];
  redoStack: AnswerAreaState_T[];
  currentState: AnswerAreaState_T;
  ignoreStateChanges: boolean;
}

// ---------------------------------------------------------------------------
// Element_T, Connector_T, Statement_T — unchanged from original
// (reproduced here in full so the file remains self-contained)
// ---------------------------------------------------------------------------

export abstract class Element_T {
  parent: ConnectorID_T;
  top?: number;
  left?: number;
  constructor(parent: ConnectorID_T) {
    this.parent = parent;
  }
  public static validParentId(id: any) {
    return id !== -1;
  }
  public hasParent() {
    return Element_T.validParentId(this.parent);
  }
  public deleteParent() {
    this.parent = -1;
  }
  public resetExNetPosition() {
    this.left = undefined;
    this.top = undefined;
  }
  get exNetPosition(): number[] {
    return [this.left ?? 0, this.top ?? 0];
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
  connectorContentID: number;
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
      new Connector_T(
        connector.parent || connector.parentID || connector.parentId,
      ),
      _.cloneDeep(connector),
    );
  }
  public toJSON() {
    return { ...this, parent: this.parent };
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
  }
  public resetClickCount() {
    this.clickCount = 0;
  }
  public incrementClickCount() {
    this.clickCount++;
  }
  public resetOrientation() {
    this.orientation = 'row';
  }
  public toggleOrientation() {
    this.orientation = this.orientation === 'column' ? 'row' : 'column';
  }
  get Id() {
    return this.connectorID;
  }
  set Id(id: ConnectorID_T) {
    this.connectorID = id;
  }
}

export class Statement_T extends Element_T {
  statementType: string;
  id: StatementID_T;
  statementIdentifier: StatementID_T;
  content: {
    originalFacts: string[];
    userInput: string[] | string;
  };
  side?: Direction_T;
  position?: string;
  showPopup: boolean;
  collapsed: boolean;
  zIndex?: number;
  visible?: boolean;
  constructor(
    parent: ConnectorID_T,
    statementIdentifier: StatementID_T | null = null,
  ) {
    super(parent);
    this.id = newElementId();
    this.statementType = '';
    this.statementIdentifier = statementIdentifier || newElementId();
    this.content = { originalFacts: [], userInput: [] };
    this.showPopup = false;
    this.collapsed = false;
  }
  static fromJSON(statement: Statement_T) {
    return Object.assign(
      new Statement_T(statement.parent),
      _.cloneDeep(statement),
    );
  }
  public toJSON() {
    return { ...this, parent: this.parent };
  }
  public toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
  public toggleShowPopup() {
    this.showPopup = !this.showPopup;
  }
  get Id() {
    return this.id;
  }
  set Id(id: StatementID_T) {
    this.id = id;
  }
}

// ---------------------------------------------------------------------------
// ScaffoldChild_T
// Represents a single labelled slot in a Scaffold.
// ---------------------------------------------------------------------------

export class ScaffoldChild_T {
  /** Instructor-defined prompt shown above this slot, e.g. "How do you boil water?" */
  label: string;
  /** ID of the child ExNet element occupying this slot, or undefined if empty. */
  childID?: ElementID_T;
  /** Type of the child element, or undefined if empty. */
  childType?: ElementTypes_T;
  /**
   * Cached text content of the child (mirrors leftContent/rightContent
   * on Connector_T — used for the collapsed text view).
   */
  childContent?: string;

  constructor(label: string = '') {
    this.label = label;
  }

  static fromJSON(data: ScaffoldChild_T): ScaffoldChild_T {
    return Object.assign(new ScaffoldChild_T(), _.cloneDeep(data));
  }

  public isEmpty(): boolean {
    return this.childID === undefined;
  }

  public deleteChild() {
    this.childID = undefined;
    this.childType = undefined;
    this.childContent = undefined;
  }

  public setChild(id: ElementID_T, type: ElementTypes_T, content?: string) {
    this.childID = id;
    this.childType = type;
    this.childContent = content;
  }
}

// ---------------------------------------------------------------------------
// Scaffold_T
// A multi-child ordered ExNet element with a title and per-slot labels.
// Extends Element_T so it participates in the tree identically to
// Connector_T and Statement_T.
// ---------------------------------------------------------------------------

export class Scaffold_T extends Element_T {
  scaffoldID: ScaffoldID_T;
  /** Instructor-defined heading shown at the top of the scaffold. */
  title: string;
  /** Ordered list of labelled child slots. */
  children: ScaffoldChild_T[];
  /** Whether the scaffold is rendered in collapsed (text-only) form. */
  collapsed: boolean;
  /** Absolute position within the answer area (root scaffolds only). */
  position?: string;

  constructor(
    parent: ConnectorID_T,
    title: string = '',
    children: ScaffoldChild_T[] = [],
  ) {
    super(parent);
    this.scaffoldID = newElementId();
    this.title = title;
    this.children = children.length > 0 ? children : [new ScaffoldChild_T()];
    this.collapsed = false;
  }

  static fromJSON(data: Scaffold_T): Scaffold_T {
    return Object.assign(new Scaffold_T(data.parent, data.title), {
      ..._.cloneDeep(data),
      children: (data.children ?? []).map(ScaffoldChild_T.fromJSON),
    });
  }

  public toJSON() {
    return { ...this, parent: this.parent };
  }

  // --- Identity ---

  get Id(): ScaffoldID_T {
    return this.scaffoldID;
  }

  set Id(id: ScaffoldID_T) {
    this.scaffoldID = id;
  }

  // --- Child slot management ---

  /**
   * Returns the index of the first empty slot, or -1 if all slots are occupied.
   */
  public firstEmptySlotIndex(): number {
    return this.children.findIndex((c) => c.isEmpty());
  }

  /**
   * Returns true if there is at least one empty slot.
   */
  public hasEmptySlot(): boolean {
    return this.firstEmptySlotIndex() !== -1;
  }

  public getChild(index: number): ScaffoldChild_T {
    return this.children[index];
  }

  public setChild(
    index: number,
    id: ElementID_T,
    type: ElementTypes_T,
    content?: string,
  ) {
    if (index < 0 || index >= this.children.length) {
      console.error(`Scaffold.setChild: index ${index} out of range`);
      return;
    }
    // Replace the element entirely so Vue detects the change
    const newChild = ScaffoldChild_T.fromJSON(this.children[index]);
    newChild.setChild(id, type, content);
    this.children = [
      ...this.children.slice(0, index),
      newChild,
      ...this.children.slice(index + 1),
    ];
  }

  public clearChild(index: number) {
    if (index < 0 || index >= this.children.length) {
      console.error(`Scaffold.clearChild: index ${index} out of range`);
      return;
    }
    // Replace the element entirely so Vue detects the change
    const newChild = ScaffoldChild_T.fromJSON(this.children[index]);
    newChild.deleteChild();
    this.children = [
      ...this.children.slice(0, index),
      newChild,
      ...this.children.slice(index + 1),
    ];
  }

  /**
   * Returns the slot index that contains the given child ID,
   * or -1 if not found.
   */
  public indexOfChild(childID: ElementID_T): number {
    return this.children.findIndex((c) => c.childID === childID);
  }

  // --- Collapse ---

  public toggleCollapsed() {
    this.collapsed = !this.collapsed;
  }
}

// ---------------------------------------------------------------------------
// Remaining types — unchanged
// ---------------------------------------------------------------------------

export interface ConnectorEmittedInfo_T {
  connectorID: ConnectorID_T;
  statementID: StatementID_T;
  scaffoldID: ScaffoldID_T;
  content: string;
  event: DragEvent;
  data: any;
  selectedPhrase: number;
  direction: Direction_T;
  statement: Statement_T;
  /** For scaffold drops: which slot index was the target. */
  slotIndex?: number;
}

export class ExNetPackage_T {
  exnet_name: string = '';
  exnet_working_answer_json: ExNet_T = {};
  exnet_correct_answer_json: ExNet_T = {};
  exflow_working_answer_json: ExFlow_T = {};
  static fromJSON(exNetPackage: ExNetPackage_T): ExNetPackage_T {
    const c = Object.assign(new ExNetPackage_T(), {
      ...exNetPackage,
      exnet_working_answer_json: ExNet_T.fromJSON(
        JSON.parse(exNetPackage.exnet_working_answer_json),
      ),
      exnet_correct_answer_json: ExNet_T.fromJSON(
        JSON.parse(exNetPackage.exnet_correct_answer_json),
      ),
      exflow_working_answer_json: JSON.parse(
        exNetPackage.exflow_working_answer_json,
      ),
    });
    return c;
  }
}

export class ExNet_T {
  activeExNetQuestionPack?: {
    assignmentName?: string;
    exNetName?: string;
    exNetRelativePath?: string;
    statementElements?: Statement_T[];
    subjectName?: string;
    promptText?: AnswerAreaData_T[];
  } = { promptText: [] };
  static fromJSON(exNet: ExNet_T) {
    if (!exNet.activeExNetQuestionPack) return new ExNet_T();
    if (
      !Array.isArray(exNet.activeExNetQuestionPack.promptText) ||
      exNet.activeExNetQuestionPack.promptText.length != 2
    ) {
      return Object.assign(new ExNet_T(), exNet);
    }
    return Object.assign(new ExNet_T(), {
      ...exNet,
      activeExNetQuestionPack: {
        ...exNet.activeExNetQuestionPack,
        promptText: [
          exNet.activeExNetQuestionPack.promptText[0],
          AnswerAreaData_T.fromJSON(
            exNet.activeExNetQuestionPack.promptText[1],
          ),
        ],
        flagShowingConversionwWorked: true,
      },
    });
  }
}

export class ExFlow_T {}

const CONNECTOR_TYPES = {
  0: 'because',
  1: 'so',
  2: 'shows that',
  3: 'and',
  4: 'whereas',
  5: 'and',
  6: 'so',
  7: 'e.g.',
  8: 'i.e.',
};
