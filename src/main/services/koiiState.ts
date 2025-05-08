import { Task } from 'main/type';

type AddedTask = {
  contractId: string;
  activated: boolean;
};

class KoiiState {
  private state: any;

  private addedTasks: AddedTask[];

  constructor(state: any, addedTasks: AddedTask[]) {
    this.state = state;
    this.addedTasks = addedTasks;
  }

  getState(): any {
    return this.state;
  }

  setState(state: any) {
    this.state = state;
  }

  getAddedTasks(): AddedTask[] {
    return this.addedTasks || [];
  }

  setAddedTasks(addedTasks: AddedTask[]) {
    this.addedTasks = addedTasks;
  }

  getTasks() {
    return this.state.tasks || [];
  }

  findTask(transactionId: string): Task | null {
    if (!(this.state.tasks instanceof Array)) return null;

    // eslint-disable-next-line no-restricted-syntax
    for (const task of this.state.tasks) {
      if (task.txId === transactionId) return task;
    }

    return null;
  }
}

export default new KoiiState({}, []);
