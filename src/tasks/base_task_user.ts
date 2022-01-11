import * as fs from 'fs';
import * as thelp from './helpers';
import { contexts } from './contexts';
import { fileExists } from '../util/file_existence_checker';
import { resolvePathFromSource } from '../util/resolve_path';
import { StateManager } from '../util/state_manager';

export class BaseTaskUser {
  id: string;

  constructor(userId: string) {
    this.id = userId;
  }

  isRegistered(): boolean {
    return thelp.getAllUsers().indexOf(this.id) >= 0;
  }

  async register(timeZone: string): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      if (!this.isRegistered()) {
        try {
          fs.mkdirSync(resolvePathFromSource(`../data/tasks/${this.id}`));
        }
        catch(e) {
          reject(e);
        }
      }

      const toWrite = { id: this.id, time_zone: timeZone, tasks_remind_by_default: false, group_by: 'none', remove_requires_options: true };
      const manager = new StateManager(`../data/tasks/${this.id}/userConfig.json`);
      manager.edit(toWrite)
      .then(async response => {
        if (response.includes('Wrote to')) {
          for (const i in contexts) {
            const folderPath = `../data/tasks/${this.id}/${contexts[i]}`
            let doesIt: boolean;
            try {
              doesIt = await fileExists(folderPath);
            }
            catch(e) {
              reject(e);
            }
    
            if (!doesIt) {
              try {
                fs.mkdirSync(resolvePathFromSource(`../data/tasks/${this.id}/${contexts[i]}`))
              }
              catch(e) {
                reject(e);
              }
            }
          }
          resolve('USER_REGISTERED');
        }
      })
      .catch(e => reject(`Couldn't create userConfig.json: ${e}`));
    });
  }
}
