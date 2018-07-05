import {
	Injectable
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class StringsService {
	dePascal(pascal: string): string {
		pascal = pascal.trim();
		const words = pascal.match(/[A-Z]{1}[a-z0-9]*/g);
		return words.join(' ');
	}

	deCamel(camel: string): string {
		camel = camel.trim();
		return this.dePascal(camel.charAt(0).toUpperCase() + camel.slice(1));
	}

	constructor() {}
}
