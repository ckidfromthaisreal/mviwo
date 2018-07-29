import { AuthenticationService } from './../../../services/authentication/authentication.service';
import {
	BrowserService
} from './../../../services/browser/browser.service';
import {
	Component,
	OnInit
} from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';

declare interface RouteInfo {
	path: string;
	title: string;
	icon: string;
	class: string;
}

export const ROUTES: RouteInfo[] = [
	{ path: '/dashboard', title: 'Dashboard', icon: 'dashboard', class: '' },
	{ path: '/metrics', title: 'Metrics', icon: 'scatter_plot', class: '' },
	{ path: '/metric-groups', title: 'Metric Groups', icon: 'timeline', class: '' },
	{ path: '/patients', title: 'Patients', icon: 'airline_seat_recline_extra', class: '' },
	{ path: '/locations', title: 'Locations', icon: 'location_on', class: '' },
	{ path: '/sessions', title: 'Sessions', icon: 'event', class: '' },
	{ path: '/records', title: 'Records', icon: 'how_to_vote', class: '' },
	// { path: '/users', title: 'Users', icon: 'group', class: '' },
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
		private router: Router,
		private notification: NotificationService
	) {}

	ngOnInit() {
		this.menuItems = ROUTES.filter(menuItem => this.hasPermission(menuItem.title));

		// if (!this.menuItems.length) {
		// 	this.notification.openCustomSnackbar('Oops! you\'re unauthurized to proceed.');
		// 	this.auth.logout();
		// }

		// if (!this.menuItems.map(elem => elem.title).includes('Dashboard')) {
		// 	this.router.navigateByUrl(this.menuItems[0].path);
		// }
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

	hasPermission(element: String): boolean {
		return this.auth.hasPermission(element, 'getMany');
	}
}
