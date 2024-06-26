import { Component } from './Component';
import { DropTarget } from '../models/Draggable-DropTarget';
import { Project, ProjectStatus } from '../models/Project';
import { AutoBind } from '../decorators/Autobind';
import { projectState } from '../state/projectState';
import { ProjectItem } from './ProjectItem';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DropTarget {

  assignedProjects: Project[] = [];

  constructor(private type: 'active' | 'completed') {
    super(
      'project-list',
      'app',
      'beforeend',
      `${ type }-projects`
    );

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(
        prj => this.type === 'active'
          ? prj.status === ProjectStatus.Active
          : prj.status === ProjectStatus.Completed
      );

      this.renderProjects();
    });

    this.newElem.addEventListener('dragover', this.dragOver);
    this.newElem.addEventListener('dragleave', this.dragLeave);
    this.newElem.addEventListener('drop', this.drop);
  }

  @AutoBind
  dragOver(e: DragEvent) {
    if (
      e.dataTransfer &&
      e.dataTransfer.types[0] === 'text/plain'
    ) {
      e.preventDefault(); // prevent default to allow drop! **

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

  // NOTE: each DataTransfer obj only exists during their corresponding drag-drop operation **

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

  renderContent() {
    this.newElem.querySelector('ul')!.id = `${ this.type }-projects-list`;
    this.newElem.querySelector('h2')!.textContent = `${ this.type.toUpperCase() } PROJECTS`;
  }
}