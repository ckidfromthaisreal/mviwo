import { NotificationService } from './../notification/notification.service';
import {
	Injectable
} from '@angular/core';
import {
	CrudService
} from './crud.service';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';

const ELEMENT = 'metric-group';
const URL = '/api/metric-group';

@Injectable({
	providedIn: 'root'
})
export class MetricGroupCrudService extends CrudService {
	constructor(http: HttpClient, auth: AuthenticationService, notification: NotificationService) {
		super(ELEMENT, URL, http, auth, notification);
	}
}
