import {
	Injectable
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { NotificationService } from '../notification/notification.service';
import { CrudService } from './crud.service';

const ELEMENT = 'record';
const URL = '/api/record';

@Injectable({
	providedIn: 'root'
})
export class RecordCrudService extends CrudService {
	constructor(
		http: HttpClient
		, auth: AuthenticationService
		, notification: NotificationService
	) {
		super(ELEMENT, URL, http, auth, notification);
	}
}
