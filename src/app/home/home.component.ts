import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy, PopStateEvent } from '@angular/common';
import 'rxjs/add/operator/filter';
import { NavbarComponent } from '../navigation/navbar/navbar.component';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import PerfectScrollbar from 'perfect-scrollbar';

import { BrowserService } from './../services/browser/browser.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
	private _router: Subscription;
	private lastPoppedUrl: string;
	private yScrollStack: number[] = [];

	constructor(
		private browser: BrowserService,
		public location: Location,
		private router: Router
	) {}

	ngOnInit() {
		if (this.browser.isWindows() && !document.getElementsByTagName('body')[0].classList.contains('sidebar-mini')) {
			// if we are on windows OS we activate the perfectScrollbar function
			document.getElementsByTagName('body')[0].classList.add('perfect-scrollbar-on');
		} else {
			document.getElementsByTagName('body')[0].classList.remove('perfect-scrollbar-off');
		}

		const elemMainPanel = <HTMLElement> document.querySelector('.main-panel');
		const elemSidebar = <HTMLElement> document.querySelector('.sidebar .sidebar-wrapper');

		this.location.subscribe((ev: PopStateEvent) => {
			this.lastPoppedUrl = ev.url;
		});

		this.router.events.subscribe((event: any) => {
			if (event instanceof NavigationStart) {
				// tslint:disable-next-line:triple-equals
				if (event.url != this.lastPoppedUrl) {
					this.yScrollStack.push(window.scrollY);
				}
			} else if (event instanceof NavigationEnd) {
				// tslint:disable-next-line:triple-equals
				if (event.url == this.lastPoppedUrl) {
					this.lastPoppedUrl = undefined;
					window.scrollTo(0, this.yScrollStack.pop());
				} else {
					window.scrollTo(0 , 0);
				}
			}
		});

		this._router = this.router.events.filter(event => event instanceof NavigationEnd).subscribe((event: NavigationEnd) => {
			elemMainPanel.scrollTop = 0;
			elemSidebar.scrollTop = 0;
		});

		if (this.browser.doesMatchMinWidth(960) && !this.browser.isMac()) {
			let ps = new PerfectScrollbar(elemMainPanel);
			ps = new PerfectScrollbar(elemSidebar);
		}
	}

	ngAfterViewInit() {
		this.runOnRouteChange();
	}

	private runOnRouteChange(): void {
		if (this.browser.doesMatchMinWidth(960) && !this.browser.isMac()) {
			const elemMainPanel = <HTMLElement> document.querySelector('.main-panel');
			const ps = new PerfectScrollbar(elemMainPanel);
			ps.update();
		}
	}
}
