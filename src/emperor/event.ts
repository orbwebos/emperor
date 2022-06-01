export class EmperorEvent {
  name: string;
  once: boolean;

  constructor(name: string, once: boolean) {
    this.name = name;
    this.once = once;
  }
}
