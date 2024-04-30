export abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  template: HTMLTemplateElement;
  host: T;
  newElem: U;

  constructor(
    templateId: string,
    hostId: string,
    position: 'afterbegin' | 'beforeend',
    newId?: string
  ) {
    this.template = document.getElementById(templateId)! as HTMLTemplateElement;
    this.host = document.getElementById(hostId)! as T;

    const importedNode = document.importNode(this.template.content, true);

    this.newElem = importedNode.firstElementChild as U;
    if (newId) {
      this.newElem.id = newId;
    }

    this.attach(position);
  }

  private attach(position: InsertPosition /* native TS enum */) {
    this.host.insertAdjacentElement(position, this.newElem);
  }

  abstract configure(): void;
  abstract renderContent(): void;
}