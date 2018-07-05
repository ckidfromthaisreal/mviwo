import {
	Injectable
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { NotificationService } from '../notification/notification.service';
import { CrudService } from './crud.service';

const ELEMENT = 'patient';
const URL = '/api/patient';

@Injectable({
	providedIn: 'root'
})
export class PatientCrudService extends CrudService {
	constructor(
		http: HttpClient
		, auth: AuthenticationService
		, notification: NotificationService
	) {
		super(ELEMENT, URL, http, auth, notification);
	}
}
