import { Component } from './Component';
import { DragTarget } from '../models/Draggable-DragTarget';
import { Project, ProjectStatus } from '../models/Project';
import { AutoBind } from '../decorators/Autobind';
import { projectState } from '../state/projectState';
import { ProjectItem } from './ProjectItem';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {

  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'completed') {
    super('project-list', 'app', 'beforeend', `${ type }-projects`);

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(
        project => this.type === 'active'
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Completed
      );

      this.renderProjects();
    });

    this.newElem.addEventListener('dragover', this.dragOver);
    this.newElem.addEventListener('dragleave', this.dragLeave);
    this.newElem.addEventListener('drop', this.drop);
  }

  private renderProjects() {
    const list = document.getElementById(
      `${ this.type }-projects-list`
    )! as HTMLUListElement;

    list.innerHTML = '';

    for (const project of this.assignedProjects) {
      new ProjectItem(
        this.newElem.querySelector('ul')!.id,
        project
      );
    }
  }

  @AutoBind
  dragOver(e: DragEvent) {
    if (e.dataTransfer && e.dataTransfer.types[0] === 'text/plain') {
      e.preventDefault();

      const list = this.newElem.querySelector('ul')!;
      list.classList.add('droppable');
    }
  }

  @AutoBind
  dragLeave(_: DragEvent) {
    const list = this.newElem.querySelector('ul')!;
    list.classList.remove('droppable');
  }

  @AutoBind
  drop(e: DragEvent) {
    const projectId = e.dataTransfer!.getData('text/plain');

    projectState.moveProject(
      projectId,
      this.type === 'active'
        ? ProjectStatus.Active
        : ProjectStatus.Completed
    );
  }

  renderContent() {
    this.newElem.querySelector('ul')!.id = `${ this.type }-projects-list`;
    this.newElem.querySelector('h2')!.textContent = `${ this.type.toUpperCase() } PROJECTS`;
  }
}