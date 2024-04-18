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

// each listener == fn
type Listener = (projects: Project[]) => void;

// SINGLETON
class ProjectState {
  private static instance: ProjectState;

  private projects: Project[] = [];
  private listeners: Listener[] = [];

  private constructor() {} // NOTE: still req for initialization **

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState();
    }
    return this.instance;
  }

  addListener(listener: Listener) {
    this.listeners.push(listener);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      ProjectStatus.Active, // active by default
      Math.random().toString(),
      title,
      description,
      people
    );
    this.projects.push(newProject);

    /* INVOKE EACH LISTENER **
    (w/ shallow copy of full projects array) */
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }
}
const projectState = ProjectState.getInstance();

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const originalMethod = descriptor.value;

  const newDescriptor: PropertyDescriptor = {
    get() {
      return originalMethod.bind(this);
    }
  };
  return newDescriptor;
}

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

// NOTE: abstract classes —> strictly inheritance (no instantiation) **
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
      this.newElem.id = newId // applies CSS styling
    }

    this.attach(position);
  }

  private attach(position: InsertPosition /* native TS enum (not string) */) {
    this.host.insertAdjacentElement(position, this.newElem);
  }

  /* abstract methods
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

      compare each below, w/ vs. w/o type casting!
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

  // NOTE: handler —> wrong "this" context (initially) **
  @AutoBind
  private handleSubmit(e: Event) {
    e.preventDefault();

    // "this" == elem from which event originated (i.e. this.form) **
    console.log(this); // <form id="user-input"></form> **
    console.log(`title: ${ this.title.value }`);

    // validate inputs
    const userInputs = this.getUserInputs();
    if (Array.isArray(userInputs)) {
      const [ title, description, people ] = userInputs;

      projectState.addProject(title, description, people);

      console.log(`title: "${ title }", description: "${ description }", people: "${ people }"`);
    }

    this.clearInputs();
  }

  // NOTE: returns tuple OR void (w/ alert)
  private getUserInputs(): [ string, string, number ] | void {
    const inputTitle = this.title.value;
    const inputDescription = this.description.value;
    const inputPeople = this.people.value;

    const validTitle: Validatable = {
      value: inputTitle,
      required: true
    };
    const validDescription: Validatable = {
      value: inputDescription,
      required: true,
      minLength: 5
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

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'completed') {
    super('project-list', 'app', 'beforeend', `${ type }-projects`);

    this.assignedProjects = [];

    /* arrow fn —> "this" == obj from which outer fn called
    (i.e. constructor) */
    projectState.addListener((projects: Project[]) => {
      /* first listener added to projectState's list of listeners (at runtime)

        NOTE: does not actually EXEC until ProjectState.addProject invoked! **
        (when each listener passed full list of projects)
      */
      this.assignedProjects = projects.filter(project => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Completed;
      });

      this.renderProjects();
    });

    this.renderContent();
  }

  configure() {}

  renderContent() {
    this.newElem.querySelector('ul')!.id = `${ this.type }-projects-list`;
    this.newElem.querySelector('h2')!.textContent = `${ this.type.toUpperCase() } PROJECTS`;
  }

  private renderProjects() {
    const list = document.getElementById(`${ this.type }-projects-list`)! as HTMLUListElement;

    list.innerHTML = ''; // NOTE: ensures each list renders w/ most up-to-date data & avoids duplicates **

    for (const project of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = project.title;

      list.appendChild(listItem);
    }
  }
}
const inputs = new ProjectForm();
const activeProjects = new ProjectList('active');
const completedProjects = new ProjectList('completed');
