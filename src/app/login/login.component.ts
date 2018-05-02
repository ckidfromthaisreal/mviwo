import { Router } from '@angular/router';
import { AuthenticationService } from './../services/authentication/authentication.service';
import { Component, OnInit, Renderer2, ViewChild, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
	// , OnChanges {
	password: string;
	login: string;

	username: string;
	email: string;
	password1: string;
	password2: string;

	error: string;

	@ViewChild('flipContainer') private container;
	flip = true;

	constructor(
		private auth: AuthenticationService,
		private router: Router,
		private renderer: Renderer2
	) {
		if (auth.isLoggedIn()) {
			router.navigateByUrl('/');
		}
	}

	ngOnInit() {
	}

	// ngOnChanges(change: SimpleChanges) {
	// 	this.onFlipClick();
	// }

	/**
	 * attempts to login with given user credentials.
	 */
	onLoginClick() {
		this.auth.login({ login: this.login, password: this.password }).subscribe(
			res => {
				this.router.navigateByUrl('/');
			},
			err => {
				console.error(err);

				this.error = err.error.message;
				setTimeout(() => {
					this.error = undefined;
				}, 5000);
			}
		);
	}

	onRegisterClick() {
		this.auth.register({ username: this.username, email: this.email, password: this.password1 }).subscribe(
			res => {
				this.router.navigateByUrl('/');
			},
			err => {
				console.error(err);

				this.error = err.error.message;
				setTimeout(() => {
					this.error = undefined;
				}, 5000);
			}
		);
	}

	/**
	 * performs a 180deg rotation front to back or back to front (depending on flip var state);
	 */
	onFlipClick() {
		if (this.flip) {
			this.renderer.addClass(this.container.nativeElement, 'rotate');
			this.flip = false;
		} else {
			this.renderer.removeClass(this.container.nativeElement, 'rotate');
			this.flip = true;
		}

		this.error = undefined;
		this.login = undefined;
		this.password = undefined;
		this.password1 = undefined;
		this.password2 = undefined;
		this.email = undefined;
		this.username = undefined;
	}
}
