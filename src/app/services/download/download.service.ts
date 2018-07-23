import {
	Injectable
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DownloadService {
	constructor() {}

	asCSV(data, filename): void {
		const blob = new Blob([data], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);

		if (navigator.msSaveOrOpenBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			const a = document.createElement('a');
			a.href = url;
			a.download = `${filename}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}

		window.URL.revokeObjectURL(url);
	}

	asJSON(data, filename): void {
		const blob = new Blob([JSON.stringify(data)], { type: 'text/json' });
		const url = window.URL.createObjectURL(blob);

		if (navigator.msSaveOrOpenBlob) {
			navigator.msSaveBlob(blob, filename);
		} else {
			const a = document.createElement('a');
			a.href = url;
			a.download = `${filename}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		}

		window.URL.revokeObjectURL(url);
	}
}
