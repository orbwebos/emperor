export class EmperorCommand {
  public data: any;
  public executer: (interaction: any) => Promise<any>;

  constructor(inputData: any, inputExecuter: (interaction: any) => Promise<any>) {
    this.data = inputData;
    this.executer = inputExecuter;
  }
}
