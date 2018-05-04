import { MviwoSnackbarComponent } from './../../material/mviwo-snackbar/mviwo-snackbar.component';
import {
	MatSnackBar
} from '@angular/material';
import {
	Injectable
} from '@angular/core';

@Injectable()
export class NotificationService {

	constructor(
		private snackbar: MatSnackBar
	) {}

	public openSnackbar(message?: string, action?: string, duration?: number, extraClasses?: string) {
		this.snackbar.open(message, action, {
			duration: duration || 2000,
			extraClasses: extraClasses || ['mviwo-snackbar-dark']
		});
	}

	public openCustomSnackbar(message?: string, action?: string, duration?: number, extraClasses?: string) {
		this.snackbar.openFromComponent(MviwoSnackbarComponent, {
			data: {
				message: message,
				action: action
			},
			duration: duration || 2000,
			extraClasses: extraClasses || ['mviwo-snackbar-dark']
		});
	}
}
