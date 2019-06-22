
// tslint:disable:no-console

import { AutoWired, Singleton } from 'typescript-ioc';
import { BaseService } from '../base/BaseService';
import { ICommandResult } from '../interfaces';

@Singleton
@AutoWired
export class Logger extends BaseService {

  public async init(client) {
    super.init(client);

    this.watchGlobalUncaughtExceptions();
  }

  log(...args) {
    console.log(this.timeStamp(), ...args);
  }

  logCommandResult(result: ICommandResult) {
    if (!result || (result && !result.result && !result.resultString)) { return; }
    this.log(result);
  }

  error(...args) {
    console.error(this.timeStamp(), ...args);
  }

  private timeStamp() {
    return new Date();
  }

  private watchGlobalUncaughtExceptions() {
    process.on('uncaughtException', (e) => {
      this.error(e);
      process.exit(0);
    });
  }
}
