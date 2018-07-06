import { AuthenticationService } from './../authentication/authentication.service';
import {
	Injectable
} from '@angular/core';
import { AuthGuardService } from './auth-guard.service';
import { Router } from '@angular/router';

@Injectable({
	providedIn: 'root'
})
export class RedirectAuthGuardService extends AuthGuardService {
	constructor(auth: AuthenticationService, router: Router) {
		super(auth, router);
	}

	canActivate(): boolean {
		if (!super.canActivate()) {
			return false;
		}

		if (this.auth.hasPermission('dashboard')) {
			this.router.navigateByUrl('/dashboard');
		} else {
			this.router.navigateByUrl('/records');
		}

		return true;
	}
}
