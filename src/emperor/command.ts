export class EmperorCommand {
  public data: unknown;
  public executer: (interaction: any) => Promise<any>;

  constructor(
    inputData: unknown,
    inputExecuter: (interaction: any) => Promise<any>
  ) {
    this.data = inputData;
    this.executer = inputExecuter;
  }
}
