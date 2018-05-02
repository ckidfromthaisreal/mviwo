import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanLoad {
	constructor(private auth: AuthenticationService, private router: Router) {}

	canActivate() {
		if (!this.auth.isLoggedIn()) {
			this.router.navigateByUrl('/login');
			return false;
		}

		return true;
	}

	canLoad() {
		if (!this.auth.isLoggedIn()) {
			this.router.navigateByUrl('/login');
			return false;
		}

		return true;
	}
}
