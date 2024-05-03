import { Component } from './Component';
import { Draggable } from '../models/Draggable-DragTarget';
import { Project } from '../models/Project';
import { AutoBind } from '../decorators/Autobind';

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {

  private project: Project;

  get persons() {
    return this.project.people === 1
      ? '1 person'
      : `${ this.project.people } people`;
  }

  constructor(hostId: string, project: Project) {
    super('single-project', hostId, 'beforeend', project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure() {
    this.newElem.addEventListener('dragstart', this.handleStart);
    this.newElem.addEventListener('dragend', this.handleEnd);
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

  renderContent() {
    this.newElem.querySelector('h2')!.textContent = this.project.title;
    this.newElem.querySelector('h3')!.textContent = `${ this.persons } assigned`;
    this.newElem.querySelector('p')!.textContent = this.project.description;
  }
}