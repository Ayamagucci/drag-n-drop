export enum ProjectStatus { Active, Completed }

export class Project {
  constructor(
    public status: ProjectStatus,
    public id: string,
    public title: string,
    public description: string,
    public people: number
  ) {}
}