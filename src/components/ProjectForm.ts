import { Component } from './Component';
import { Validatable, validate } from '../util/validation';
import { AutoBind } from '../decorators/Autobind';
import { projectState } from '../state/projectState';

export class ProjectForm
  extends Component<HTMLDivElement, HTMLFormElement> {

  title: HTMLInputElement;
  description: HTMLInputElement;
  people: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input');

    this.title = this.newElem.querySelector('#title') as HTMLInputElement;
    this.description = this.newElem.querySelector('#description') as HTMLInputElement;
    this.people = this.newElem.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.renderContent();
  }

  configure() {
    this.newElem.addEventListener('submit', this.handleSubmit);
  }

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
      required: true
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

  @AutoBind
  private handleSubmit(e: Event) {
    e.preventDefault();

    const userInputs = this.getUserInputs();

    if (Array.isArray(userInputs)) {
      const [ title, description, people ] = userInputs;
      projectState.addProject(title, description, people);
    }

    this.clearInputs();
  }

  renderContent() {
    this.host.insertAdjacentElement('afterbegin', this.newElem);
   }
}