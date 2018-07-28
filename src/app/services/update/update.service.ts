import {
	Injectable
} from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { NotificationService } from '../notification/notification.service';

@Injectable({
	providedIn: 'root'
})
export class UpdateService {
	constructor(private updates: SwUpdate, private notification: NotificationService) {
		this.updates.available.subscribe(event => {
			console.log(event);

			this.notification.openCustomSnackbar(
				'mviwo update ready to install',
				'install',
				Number.MAX_SAFE_INTEGER
			).subscribe(() => {
				this.updates.activateUpdate().then(() => document.location.reload());
			});
		});
	}
}
