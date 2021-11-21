import * as fs from 'fs';
import { resolvePath } from "./resolve_path";
import { StateManager } from './state_manager';

export class ConfigManager extends StateManager {
	public object: any;

	constructor() {
		super('../config.json');
		this.object = this.readSync();
	}
}