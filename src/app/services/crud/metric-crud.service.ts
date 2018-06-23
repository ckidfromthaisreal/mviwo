import { NotificationService } from './../notification/notification.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CrudService } from './crud.service';
import { AuthenticationService } from '../authentication/authentication.service';

const ELEMENT = 'metric';
const URL = '/api/metric';

@Injectable({ providedIn: 'root' })
export class MetricCrudService extends CrudService {
	constructor(
		http: HttpClient
		, auth: AuthenticationService
		, notification: NotificationService
	) {
		super(ELEMENT, URL, http, auth, notification);
	}
}
