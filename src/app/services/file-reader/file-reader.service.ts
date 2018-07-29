import {
	Injectable
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class FileReaderService {

	constructor() {}

	readJSON(file: File): Promise<Object> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = (event: any) => {
				// if ((event.target as any).readyState === FileReader.DONE) {
					resolve(JSON.parse((event.target as any).result));
				// }

				// reject('read error');
			};

			reader.readAsText(file);
		});
	}

	readCSV(file: File): any {
		console.error('UNIMPLEMENTED FUNCTION!');
	}
}
