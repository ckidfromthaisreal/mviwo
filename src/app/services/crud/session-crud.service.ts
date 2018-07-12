import {
	Injectable
} from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { AuthenticationService } from '../authentication/authentication.service';
import { NotificationService } from '../notification/notification.service';
import { CrudService, Deleteable } from './crud.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MetricGroup } from '../../models/metric-group.model';

const ELEMENT = 'session';
const URL = '/api/session';

@Injectable({
	providedIn: 'root'
})
export class SessionCrudService extends CrudService {
	constructor(
		http: HttpClient
		, auth: AuthenticationService
		, notification: NotificationService
	) {
		super(ELEMENT, URL, http, auth, notification);
	}

	/**
	 * deletes many instances from database.
	 * @param deleteables
	 */
	deleteMany(deleteables: Deleteable[]) {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('deleteMany', 'delete many')) !== null) {
			return authChk;
		}

		if (!deleteables || !deleteables.length) {
			this.notification.openCustomSnackbar(`no resources were passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:deleteMany: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		const body = [];

		deleteables.forEach(d => {
			let metrics = [];

			if (d.groups) {
				d.groups.map((group: MetricGroup) => group.metrics.map(metric => metric._id)).forEach(metArr => {
					metArr.forEach(met => {
						if (!metrics.includes(met)) {
							metrics = [...metrics, met];
						}
					});
				});
			}

			body.push({
				_id: d._id,
				groups: d.groups ? d.groups.map(g => g._id) : undefined,
				metrics: d.groups && metrics.length ? metrics : undefined
			});
		});

		let req = new HttpRequest('DELETE', this.url);
		req = req.clone({ headers: headers, body: body });

		return this.http.request(req)
			.pipe(
				// tap(e => console.log(e)),
				catchError(this.handleError)
			);
	}

	/**
	 * deletes an instance from database.
	 * @param deleteable
	 */
	deleteOne(deleteable: Deleteable) {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('deleteOne', 'delete a')) !== null) {
			return authChk;
		}

		if (!deleteable) {
			this.notification.openCustomSnackbar(`no resources were passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:deleteOne: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		let metrics = [];

		if (deleteable.groups) {
			deleteable.groups.map((group: MetricGroup) => group.metrics.map(metric => metric._id)).forEach(metArr => {
				metArr.forEach(met => {
					if (!metrics.includes(met)) {
						metrics = [...metrics, met];
					}
				});
			});
		}

		const body = {
			groups: deleteable.groups ? deleteable.groups.map(g => g._id) : undefined,
			metrics: deleteable.groups && metrics.length ? metrics : undefined
		};

		let req = new HttpRequest('DELETE', `${this.url}/${deleteable._id}`);
		req = req.clone({ headers: headers, body: body, responseType: 'json' });

		return this.http.request(req)
			.pipe(
				catchError(this.handleError)
			).filter(e => e instanceof HttpResponse);
	}
}
