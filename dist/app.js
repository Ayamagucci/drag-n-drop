"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Completed"] = 1] = "Completed";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(status, id, title, description, people) {
        this.status = status;
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
    }
}
class ProjectState {
    constructor() {
        this.projects = [];
        this.listeners = [];
    }
    addListener(listener) {
        this.listeners.push(listener);
    }
    addProject(title, description, people) {
        const newProject = new Project(ProjectStatus.Active, Math.random().toString(), title, description, people);
        this.projects.push(newProject);
        for (const listener of this.listeners) {
            listener(this.projects.slice());
        }
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProjectState();
        }
        return this.instance;
    }
}
const projectState = ProjectState.getInstance();
function AutoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const newDescriptor = {
        get() {
            return originalMethod.bind(this);
        }
    };
    return newDescriptor;
}
function validate(input) {
    let isValid = true;
    if (input.required) {
        isValid && (isValid = input.value.toString().trim().length > 0);
    }
    if (input.minLength != null &&
        typeof input.value === 'string') {
        isValid && (isValid = input.value.length > input.minLength);
    }
    if (input.maxLength != null &&
        typeof input.value === 'string') {
        isValid && (isValid = input.value.length < input.maxLength);
    }
    if (input.min != null &&
        typeof input.value === 'number') {
        isValid && (isValid = input.value > input.min);
    }
    if (input.max != null &&
        typeof input.value === 'number') {
        isValid && (isValid = input.value < input.max);
    }
    return isValid;
}
class ProjectInputs {
    constructor() {
        this.template = document.getElementById('project-input');
        this.host = document.getElementById('app');
        const template = document.importNode(this.template.content, true);
        this.form = template.firstElementChild;
        this.form.id = 'user-input';
        this.title = this.form.querySelector('#title');
        this.description = this.form.querySelector('#description');
        this.people = this.form.querySelector('#people');
        this.configure();
        this.attach();
    }
    attach() {
        this.host.insertAdjacentElement('afterbegin', this.form);
    }
    handleSubmit(e) {
        e.preventDefault();
        console.log(this);
        console.log(`title: ${this.title.value}`);
        const userInputs = this.getUserInputs();
        if (Array.isArray(userInputs)) {
            const [title, description, people] = userInputs;
            projectState.addProject(title, description, people);
            console.log(`title: "${title}", description: "${description}", people: "${people}"`);
        }
        this.clearInputs();
    }
    configure() {
        this.form.addEventListener('submit', this.handleSubmit);
    }
    getUserInputs() {
        const inputTitle = this.title.value;
        const inputDescription = this.description.value;
        const inputPeople = this.people.value;
        const validTitle = {
            value: inputTitle,
            required: true
        };
        const validDescription = {
            value: inputDescription,
            required: true,
            minLength: 5
        };
        const validPeople = {
            value: +inputPeople,
            required: true,
            min: 0,
            max: 10
        };
        if (validate(validTitle) &&
            validate(validDescription) &&
            validate(validPeople)) {
            return [inputTitle, inputDescription, +inputPeople];
        }
        else {
            alert('Invalid input — please try again!');
            return;
        }
    }
    clearInputs() {
        this.title.value = '';
        this.description.value = '';
        this.people.value = '';
    }
}
__decorate([
    AutoBind
], ProjectInputs.prototype, "handleSubmit", null);
class ProjectList {
    constructor(type) {
        this.type = type;
        this.template = document.getElementById('project-list');
        this.host = document.getElementById('app');
        const template = document.importNode(this.template.content, true);
        this.section = template.firstElementChild;
        this.section.id = `${this.type}-projects`;
        this.assignedProjects = [];
        projectState.addListener((projects) => {
            this.assignedProjects = projects.filter(project => {
                if (this.type === 'active') {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Completed;
            });
            this.renderProjects();
        });
        this.attach();
        this.styleLists();
    }
    attach() {
        this.host.insertAdjacentElement('beforeend', this.section);
    }
    styleLists() {
        this.section.querySelector('ul').id = `${this.type}-projects-list`;
        this.section.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    renderProjects() {
        const list = document.getElementById(`${this.type}-projects-list`);
        list.innerHTML = '';
        for (const project of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = project.title;
            list.appendChild(listItem);
        }
    }
}
const inputs = new ProjectInputs();
const activeProjects = new ProjectList('active');
const completedProjects = new ProjectList('completed');
