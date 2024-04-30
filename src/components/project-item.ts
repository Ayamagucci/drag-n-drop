import { Component } from './base-component';
import { Draggable } from '../models/drag-drop';
import { Project } from '../models/project';
import { AutoBind } from '../decorators/autobind';

export class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
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

    e.dataTransfer!.setData('text/plain', this.project.id);
    e.dataTransfer!.effectAllowed = 'move';
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