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

	copyTextToClipboard(input: string): void {
		const selBox = document.createElement('textarea');
		selBox.style.position = 'fixed';
		selBox.style.left = '0';
		selBox.style.top = '0';
		selBox.style.opacity = '0';
		selBox.value = input;
		document.body.appendChild(selBox);
		selBox.focus();
		selBox.select();
		document.execCommand('copy');
		document.body.removeChild(selBox);
	}

	copyInputToClipboard(input: any): void {
		input.focus();
		input.select();
		document.execCommand('copy');
		input.setSelectionRange(0, 0);
	}
}
