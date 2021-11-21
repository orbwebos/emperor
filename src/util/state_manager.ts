import * as fs from 'fs';
import { resolvePath } from "./resolve_path";

export class StateManager {
	public readonly path: string;

	constructor(relativePath: string) {
		this.path = resolvePath(relativePath);
	}

	public async read() {
		return new Promise<any>((resolve, reject) => {
			fs.readFile(this.path, function read(err, data) {
				if (err) {
					reject(err);
				}
				let reply: any;
				try {
					reply = JSON.parse(data.toString());
				}
				catch(e) {
					reject(e);
				}
				resolve(reply);
			});
		});
	}

	public readSync() {
		try {
			const data = fs.readFileSync(this.path);
			const reply = JSON.parse(data.toString());
			return reply;
		}
		catch(err) {
			throw new Error(err);
		}
	}

	public async edit(object: any): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			const pathToWrite = this.path
			fs.writeFile(pathToWrite, JSON.stringify(object), function writeJSON(err) {
				if (err) {
					reject(err);
				}
				resolve(`Wrote to ${pathToWrite}: ${JSON.stringify(object)}`);
			});
		});
	}
}