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
type Listener = (projects: Project[]) => void;

// singleton
class ProjectState {
  private projects: Project[] = [];
  private static instance: ProjectState;

  /* array of listener fns
  STATE CHANGE —> INVOKE LISTENERS */
  private listeners: Listener[] = [];

  private constructor() {}

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

    // iterate thru listeners
    for (const listener of this.listeners) {
      // pass shallow copy of projects
      listener(this.projects.slice());
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState();
    }
    return this.instance;
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
    input.minLength != null && // NOTE: LOOSE inequality —> null | undefined
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

class ProjectInputs {
  template: HTMLTemplateElement;
  host: HTMLDivElement;
  form: HTMLFormElement;

  // inputs
  title: HTMLInputElement;
  description: HTMLInputElement;
  people: HTMLInputElement;

  constructor() {
    this.template = document.getElementById('project-input')! as HTMLTemplateElement;
    this.host = document.getElementById('app')! as HTMLDivElement;

    /* document.importNode(externalNode, deep)
      • [ deep ]: boolean flag —> include entire DOM subtree
        (default === false)
    */
    const template = document.importNode(this.template.content, true);

    this.form = template.firstElementChild as HTMLFormElement;
    this.form.id = 'user-input'; // applies CSS styling

    /* NOTE: querySelector() vs. getElementById()
      • querySelector() —> Element | null
      • getElementById() —> HTMLElement | null

      compare each below, w/ vs. w/o type casting!
    */
    this.title = this.form.querySelector('#title') as HTMLInputElement;
    this.description = this.form.querySelector('#description') as HTMLInputElement;
    this.people = this.form.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private attach() {
    /*  NOTE: arrow fn —> outer "this" (obj from which "attach" method called)
    this.form.addEventListener('submit', (e: Event) => {
      e.preventDefault();

      console.log(this); // ProjectInputs { ... }
      console.log(`title: ${ this.title.value }`);
    });
    */

    /* Element.insertAdjacentElement(position, elem)
      • [ position ]: 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
      • [ elem ]: insertion elem
    */
    this.host.insertAdjacentElement('afterbegin', this.form);
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

  private configure() {
    this.form.addEventListener('submit', this.handleSubmit);
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

class ProjectList {
  template: HTMLTemplateElement;
  host: HTMLDivElement;
  section: HTMLElement;

  assignedProjects: Project[];

  constructor(private type: 'active' | 'completed') {
    this.template = document.getElementById('project-list')! as HTMLTemplateElement;
    this.host = document.getElementById('app')! as HTMLDivElement;

    const template = document.importNode(this.template.content, true);

    this.section = template.firstElementChild as HTMLElement;
    this.section.id = `${ this.type }-projects`;

    this.assignedProjects = [];

    // arrow fn —> "this" == obj from which outer fn called
    projectState.addListener((projects: Project[]) => {
      /* first listener added to projectState's list of listeners
        • NOTE: does not actually EXEC until projectState.addProject invoked! **
          (when list iterated over —> each listener passed full list of projects)
      */
      this.assignedProjects = projects.filter(project => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Completed;
      });
      this.renderProjects();
    });

    this.attach();
    this.styleLists();
  }

  private attach() {
    this.host.insertAdjacentElement('beforeend', this.section);
  }

  private styleLists() {
    this.section.querySelector('ul')!.id = `${ this.type }-projects-list`;
    this.section.querySelector('h2')!.textContent = `${ this.type.toUpperCase() } PROJECTS`;
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
const inputs = new ProjectInputs();
const activeProjects = new ProjectList('active');
const completedProjects = new ProjectList('completed');
