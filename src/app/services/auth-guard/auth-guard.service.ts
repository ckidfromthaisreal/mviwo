import { Injectable } from '@angular/core';
import { CanActivate, Router, CanLoad } from '@angular/router';

import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class AuthGuardService implements CanActivate, CanLoad {
	constructor(protected auth: AuthenticationService, protected router: Router) {}

	canActivate(): boolean {
		if (!this.auth.isLoggedIn()) {
			this.router.navigateByUrl('/login');
			return false;
		}

		return true;
	}

	canLoad(): boolean {
		if (!this.auth.isLoggedIn()) {
			this.router.navigateByUrl('/login');
			return false;
		}

		return true;
	}

	defaultPage(): string {
		return this.auth.hasPermission('dashboard') ? 'dashboard' : 'records';
	}
}
