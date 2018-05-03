import { AuthenticationService } from './../../services/authentication/authentication.service';
import {
	BrowserService
} from './../../services/browser/browser.service';
import {
	Component,
	OnInit
} from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

declare interface RouteInfo {
	path: string;
	title: string;
	icon: string;
	class: string;
}

export const ROUTES: RouteInfo[] = [
	{ path: '/dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
	{ path: '/metrics', title: 'Metrics', icon: '', class: '' },
	{ path: '/metric-groups', title: 'Metric Groups', icon: '', class: '' },
	{ path: '/examinations', title: 'Examinations', icon: '', class: '' },
	// { path: '/'}
];

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
	menuItems: any[];

	constructor(
		public browser: BrowserService,
		private auth: AuthenticationService,
		private location: Location,
	) {}

	ngOnInit() {
		this.menuItems = ROUTES.filter(menuItem => menuItem);
	}

	isMobile(): boolean {
		return this.browser.isMobile();
	}

	logout(): void {
		this.auth.logout();
	}

	getPath(): string {
		let title = this.location.prepareExternalUrl(this.location.path());

		if (title.charAt(0) === '#') {
			title = title.slice(2);
		}

		for (let i = 0; i < ROUTES.length; i++) {
			if (ROUTES[i].path === title || ROUTES[i].path === title.split('/')[1]) {
				return ROUTES[i].path;
			}
		}

		return '';
	}
}
