import {
	Injectable
} from '@angular/core';

@Injectable()
export class BrowserService {
	constructor() {}

	isMobile(): boolean {
		return this.width() <= 991;
	}

	isWindows(): boolean {
		return navigator.platform.indexOf('Win') > -1;
	}

	isMac(): boolean {
		return navigator.platform.toUpperCase().indexOf('MAC') > -1 ||
			navigator.platform.toUpperCase().indexOf('IPAD') > -1;
	}

	doesMatchMinWidth(width: number) {
		return window.matchMedia(`(min-width: ${width}px)`).matches;
	}

	width(): number {
		return Math.max(
			document.documentElement['clientWidth'],
			document.body['scrollWidth'],
			document.documentElement['scrollWidth'],
			document.body['offsetWidth'],
			document.documentElement['offsetWidth']
		);
	}
}
