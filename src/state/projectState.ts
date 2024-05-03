import { Project, ProjectStatus } from '../models/Project';

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}

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
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }

  addProject(title: string, description: string, people: number) {
    const project = this.projects.find(project => project.title === title);

    if (!project) {
      const newProject = new Project(
        ProjectStatus.Active,
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
    const project = this.projects.find(
      project => project.id === projectId
    );

    if (project && project.status !== newStatus) {
      project.status = newStatus;
    }

    this.updateListeners();
  }
}

/* NOTE: code from imported modules only run ONCE **
  (regardless of num of imports)
*/
console.log('RUNNING...');

export const projectState = ProjectState.getInstance();