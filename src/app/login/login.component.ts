import { NotificationService } from './../services/notification/notification.service';
import { Router } from '@angular/router';
import { AuthenticationService } from './../services/authentication/authentication.service';
import { Component, OnInit, Renderer2, ViewChild, ChangeDetectionStrategy, SimpleChanges, OnChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material';

interface RegisterFormValue {
	username: string;
	email: string;
	password1: string;
	password2: string;
}

interface LoginFormValue {
	login: string;
	password: string;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
	error: string;

	@ViewChild('flipContainer') private container;
	flip = true;

	constructor(
		private auth: AuthenticationService,
		private router: Router,
		private renderer: Renderer2,
		// public snackbar: MatSnackBar
		public notification: NotificationService,
	) {
		if (auth.isLoggedIn()) {
			router.navigateByUrl('/');
		}
	}

	ngOnInit() {}

	/**
	 * attempts to login with given user credentials.
	 */
	onLoginClick(value: LoginFormValue) {
		this.auth.login({ login: value.login, password: value.password }).subscribe(
			res => {
				this.notification.openCustomSnackbar(`welcome back ${this.auth.getUserDetails().username}!`, 'OK!');
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

	onRegisterClick(value: RegisterFormValue) {
		this.auth.register({ username: value.username, email: value.email, password: value.password1 }).subscribe(
			res => {
				this.notification.openCustomSnackbar(`welcome aboard ${this.auth.getUserDetails().username}!`, 'OK!');
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
	}
}
