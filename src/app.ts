enum ProjectStatus { Active, Completed }

class Project {
  constructor(
    public status: ProjectStatus,
    public id: string,
    public title: string,
    public description: string,
    public people: number
  ) {}
}

type Listener<T> = (items: T[]) => void; // listener fns —> type safety

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

// SINGLETON
class ProjectState extends State<Project> {
  private static instance: ProjectState;

  private projects: Project[] = [];

  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState();
    }
    return this.instance;
  }

  private updateListeners() {
    /* INVOKE EACH LISTENER **
    (w/ shallow copy of full projects array) */
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }

  addProject(title: string, description: string, people: number) {
    // check if project title already exists
    const project = this.projects.find(project => project.title === title);

    if (!project) {
      const newProject = new Project(
        ProjectStatus.Active, // active by default
        Math.random().toString(),
        title,
        description,
        people
      );
      this.projects.push(newProject);

      this.updateListeners();
    }
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(project => project.id === projectId);

    if (project && project.status !== newStatus /* same list —> no rerender */) {
      project.status = newStatus;
    }

    this.updateListeners();
  }
}
const projectState = ProjectState.getInstance();

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(input: Validatable) {
  let isValid = true;

  if (input.required) {
    isValid &&= input.value.toString().trim().length > 0;
  }

  if (
    input.minLength != null && // NOTE: LOOSE —> (null | undefined) **
    typeof input.value === 'string'
  ) {
    isValid &&= input.value.length > input.minLength;
  }

  if (
    input.maxLength != null &&
    typeof input.value === 'string'
  ) {
    isValid &&= input.value.length < input.maxLength;
  }

  if (
    input.min != null &&
    typeof input.value === 'number'
  ) {
    isValid &&= input.value > input.min;
  }

  if (
    input.max != null &&
    typeof input.value === 'number'
  ) {
    isValid &&= input.value < input.max;
  }

  return isValid;
}

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  const newDescriptor: PropertyDescriptor = {
    get() {
      return originalMethod.bind(this);
    }
  };
  return newDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  template: HTMLTemplateElement;
  host: T;
  newElem: U;

  constructor(
    templateId: string,
    hostId: string,
    position: 'afterbegin' | 'beforeend',
    newId?: string
  ) {
    this.template = document.getElementById(templateId)! as HTMLTemplateElement;
    this.host = document.getElementById(hostId)! as T;

    /* document.importNode(externalNode, deep)
      • [ deep ]: boolean flag —> include children & descendants
        (default === false)
    */
    const importedNode = document.importNode(this.template.content, true);

    this.newElem = importedNode.firstElementChild as U;
    if (newId) {
      this.newElem.id = newId; // applies CSS styling **
    }

    this.attach(position);
  }

  private attach(position: InsertPosition /* native TS enum (not str!) */) {
    this.host.insertAdjacentElement(position, this.newElem);
  }

  /* ABSTRACT METHODS
  (NOTE: cannot define privately in classes) */
  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
  title: HTMLInputElement;
  description: HTMLInputElement;
  people: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input');

    /* NOTE: querySelector() vs. getElementById()
      • querySelector —> Element | null
      • getElementById —> HTMLElement | null

      compare each below, w/ vs. w/o type-casting!
    */
    this.title = this.newElem.querySelector('#title') as HTMLInputElement;
    this.description = this.newElem.querySelector('#description') as HTMLInputElement;
    this.people = this.newElem.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.renderContent();
  }

  configure() {
    this.newElem.addEventListener('submit', this.handleSubmit);

    /* NOTE: arrow fn —> outer "this" (obj from which "configure" called)
    this.newElem.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      const userInputs = this.getUserInputs();
      if (Array.isArray(userInputs)) {
        const [ title, description, people ] = userInputs;

        projectState.addProject(title, description, people);
      }

      this.clearInputs();
    });
    */
  }

  renderContent() {
    /* Element.insertAdjacentElement(position, elem)
      • [ position ]: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
      • [ elem ]: insertion elem
    */
   this.host.insertAdjacentElement('afterbegin', this.newElem);
  }

  @AutoBind
  private handleSubmit(e: Event) {
    e.preventDefault();

    // "this" == elem from which event originated (i.e. this.form) **
    // console.log(this); // <form id="user-input"></form> **
    // console.log(`title: ${ this.title.value }`);

    // VALIDATION
    const userInputs = this.getUserInputs();
    if (Array.isArray(userInputs)) {
      const [ title, description, people ] = userInputs;

      projectState.addProject(title, description, people);

      // console.log(`title: "${ title }", description: "${ description }", people: "${ people }"`);
    }

    this.clearInputs();
  }

  private getUserInputs(): [ string, string, number ] | void {
    const inputTitle = this.title.value;
    const inputDescription = this.description.value;
    const inputPeople = this.people.value;

    // NOTE: arbitrary validation params
    const validTitle: Validatable = {
      value: inputTitle,
      required: true
    };
    const validDescription: Validatable = {
      value: inputDescription,
      required: true,
      // minLength: 5
    };
    const validPeople: Validatable = {
      value: +inputPeople,
      required: true,
      min: 0,
      max: 10
    };

    if (
      validate(validTitle) &&
      validate(validDescription) &&
      validate(validPeople)
    ) {
      return [ inputTitle, inputDescription, +inputPeople ];
    } else {
      alert('Invalid input — please try again!');
      return;
    }
  }

  private clearInputs() {
    this.title.value = '';
    this.description.value = '';
    this.people.value = '';
  }
}

/* DRAG & DROP
(NOTE: <li> "draggable" attr —> true) */
interface Draggable {
  handleStart(e: DragEvent): void;
  handleEnd(e: DragEvent): void;
}

interface DragTarget {
  dragOver(e: DragEvent): void;
  dragLeave(e: DragEvent): void;
  drop(e: DragEvent): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    return this.project.people === 1 ? '1 person' : `${ this.project.people } people`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, 'beforeend', project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @AutoBind
  handleStart(e: DragEvent) {
    console.log(e);

    // e.dataTransfer —> provides info about draggable to drop target **
    e.dataTransfer!.setData('text/plain', this.project.id);
    e.dataTransfer!.effectAllowed = 'move'; // specifies behavior on drop
  }

  handleEnd(_: DragEvent) {
    console.log('Drag ends here!');
  }

  configure() {
    this.newElem.addEventListener('dragstart', this.handleStart);
    this.newElem.addEventListener('dragend', this.handleEnd);
  }

  renderContent() {
    this.newElem.querySelector('h2')!.textContent = this.project.title;
    this.newElem.querySelector('h3')!.textContent = `${ this.persons } assigned`; // NOTE: getter accessed like prop
    this.newElem.querySelector('p')!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'completed') {
    super('project-list', 'app', 'beforeend', `${ type }-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @AutoBind
  drop(e: DragEvent) {
    const projectId = e.dataTransfer!.getData('text/plain');

    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Completed // type —> drop location **
    );
  }

  // NOTE: dragOver + dragLeave —> visual feedback

  @AutoBind
  dragOver(e: DragEvent) {
    if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
      e.preventDefault(); // NOTE: most browsers prohibit dropping by default **

      const list = this.newElem.querySelector('ul')!;
      list.classList.add('droppable');
    }
  }

  @AutoBind
  dragLeave(_: DragEvent) {
    const list = this.newElem.querySelector('ul')!;
    list.classList.remove('droppable');
  }

  configure() {
    this.newElem.addEventListener('dragover', this.dragOver);
    this.newElem.addEventListener('dragleave', this.dragLeave);
    this.newElem.addEventListener('drop', this.drop);

    // arrow fn —> "this" == obj from which "configure" called
    projectState.addListener((projects: Project[]) => {
      /* 1st listener —> added to projectState's list of listeners (at runtime)

        NOTE: does not EXEC until ProjectState.updateListeners invoked! **
        (when each listener passed full list of projects)
      */
      this.assignedProjects = projects.filter(project => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }8
        return project.status === ProjectStatus.Completed;
      });

      this.renderProjects();
    });
  }

  private renderProjects() {
    const list = document.getElementById(`${ this.type }-projects-list`)! as HTMLUListElement;

    list.innerHTML = ''; // clear list before rendering **

    for (const project of this.assignedProjects) {
      /*
      const listItem = document.createElement('li');
      listItem.textContent = project.title;

      list.appendChild(listItem);
      */

      new ProjectItem(this.newElem.querySelector('ul')!.id, project);
    }
  }

  renderContent() {
    this.newElem.querySelector('ul')!.id = `${ this.type }-projects-list`;
    this.newElem.querySelector('h2')!.textContent = `${ this.type.toUpperCase() } PROJECTS`;
  }
}
const inputs = new ProjectForm();
const activeProjects = new ProjectList('active');
const completedProjects = new ProjectList('completed');

/* WEBPACK — TSCONFIG
  Considerations: target, module, outDir
  • NOTE: changed module to "ES6"
    (from "commonjs")

  rootDir no longer necessary
*/