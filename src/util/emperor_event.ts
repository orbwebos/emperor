export class EmperorEvent {
  name: string;
  once: boolean;
  executer: any;

  constructor(name: string, once: boolean, executer: any) {
    this.name = name;
    this.once = once;
    this.executer = executer;
  }
}
