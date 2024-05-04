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

  constructor(private listType: 'active' | 'completed') {
    super(
      'project-list',
      'app',
      'beforeend',
      `${ listType }-projects`
    );

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(
        project => this.listType === 'active'
          ? project.status === ProjectStatus.Active
          : project.status === ProjectStatus.Completed
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
      this.listType === 'active'
        ? ProjectStatus.Active
        : ProjectStatus.Completed
    );
  }

  // NOTE: each DataTransfer obj exists only during their corresponding drag-drop operation **

  private renderProjects() {
    const list = document.getElementById(
      `${ this.listType }-projects-list`
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
    this.newElem.querySelector('ul')!.id = `${ this.listType }-projects-list`;
    this.newElem.querySelector('h2')!.textContent = `${ this.listType.toUpperCase() } PROJECTS`;
  }
}