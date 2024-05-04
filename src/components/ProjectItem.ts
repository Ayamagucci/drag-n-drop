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

  constructor(hostId: string, newProject: Project) {
    super(
      'single-project',
      hostId,
      'beforeend',
      newProject.id
    );
    this.project = newProject;

    this.configure();
    this.renderContent();
  }

  configure() {
    // add listeners to draggable elem
    this.newElem.addEventListener('dragstart', this.handleStart);
    this.newElem.addEventListener('dragend', this.handleEnd);
  }

  @AutoBind
  handleStart(e: DragEvent) {
    console.log(e);

    // DataTransfer.setData(format, data)
    e.dataTransfer!.setData('text/plain', this.project.id);

    // DataTransfer.effectAllowed = 'none' | 'move' | 'copy' | 'link' | 'copyMove' | 'copyLink' | 'linkMove' | 'all';
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