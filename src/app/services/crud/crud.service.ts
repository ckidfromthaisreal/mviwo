import { NotificationService } from './../notification/notification.service';
import { AuthenticationService } from './../authentication/authentication.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/of';
import { tap, catchError } from 'rxjs/operators';

export abstract class CrudService {
	constructor(
		private element: string
		, private url: string
		, private http: HttpClient
		, private auth: AuthenticationService
		, private notification: NotificationService
	) {}

	/**
	 * fetches many instances of given element from server.
	 * @param filter filter results by.
	 * @param fields project only given fields. space seperated field names.
	 * @param options more headers. keys equal to other parameter names or 'Authorization' are ignored.
	 */
	getMany<T>(
		filter?: object
		, fields?: string
		, options?: object
	): Observable<T[]> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('getMany', 'fetch many')) !== null) {
			return authChk;
		}

		// localStorage.removeItem(`${this.element}s`);	// for testing purposes.

		// let elements;
		// if (elements = JSON.parse(localStorage.getItem(`mviwo-${this.element}s`))) {
		// 	return Observable.of(elements);
		// }

		let headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		if (filter) {
			headers = headers.set('filter', JSON.stringify(filter));
		}

		if (fields) {
			headers = headers.set('fields', fields);
		}

		if (options) {
			Object.keys(options).forEach(key => {
				if (!['Authorization', 'filter', 'fields'].includes(key)) {
					headers = headers.set(key, options['key']);
				}
			});
		}

		return this.http.get<T[]>(this.url, { headers: headers })
			.pipe(
				catchError(this.handleError),
				// tap(e => this.store(e)),
				tap(e => {
					let i = 0;
					e.forEach(elem => elem['position'] = ++i);
				})
			);
	}

	/**
	 * fetches an instance of given element from database.
	 * @param id objectid.
	 * @param fields project only given fields. space seperated field names.
	 * @param options more headers. keys equal to other parameter names or 'Authorization' are ignored.
	 */
	getOne<T>(
		id: string
		, fields?: string
		, options?: object
	): Observable<T> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('getOne', 'fetch a')) !== null) {
			return authChk;
		}

		// localStorage.removeItem(`${this.element}s`);	// for testing purposes.

		// let elements;
		// if (elements = JSON.parse(localStorage.getItem(`mviwo-${this.element}s`))) {
		// 	return Observable.of(elements);
		// }

		let headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		if (fields) {
			headers = headers.set('fields', fields);
		}

		if (options) {
			Object.keys(options).forEach(key => {
				if (!['Authorization', 'fields'].includes(key)) {
					headers = headers.set(key, options['key']);
				}
			});
		}

		return this.http.get<T>(`${this.url}/${id}`, { headers: headers })
			.pipe(
				catchError(this.handleError),
				// tap(e => this.store(e))
			);
	}

	/**
	 * inserts an instance of given element to database.
	 * @param insertable
	 */
	insertOne<T>(insertable: any): Observable<T> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('insertOne', 'insert a')) !== null) {
			return authChk;
		}

		if (!insertable) {
			this.notification.openCustomSnackbar(`no ${this.element} was passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:insertOne: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		return this.http.post<T>(`${this.url}/1`, insertable, { headers: headers }).pipe(
			// tap(e => console.log(e)),
			catchError(this.handleError)
		);
	}

	/**
	 * inserts many instances of given element to database.
	 * @param insertables
	 */
	insertMany<T>(insertables: any[]): Observable<T[]> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('insertMany', 'insert many')) !== null) {
			return authChk;
		}

		if (!insertables || !insertables.length) {
			this.notification.openCustomSnackbar(`no ${this.element}s were passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:insertMany: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		return this.http.post<T[]>(this.url, insertables, { headers: headers }).pipe(
			// tap(e => console.log(e)),
			catchError(this.handleError)
		);
	}

	/**
	 * updates an instance of given element in database.
	 * @param updateable
	 */
	updateOne<T>(updateable: Updateable): Observable<T> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('updateOne', 'update a')) !== null) {
			return authChk;
		}

		if (!updateable) {
			this.notification.openCustomSnackbar(`no ${this.element} was passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:updateOne: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		return this.http.patch<T>(`${this.url}/${updateable._id}`, updateable, { headers: headers }).pipe(
			tap(e => console.log(e)),
			catchError(this.handleError)
		);
	}

	/**
	 * updates many instances of given element in database.
	 * @param updateables
	 */
	updateMany<T>(updateables: Updateable[]): Observable<T[]> {
		let authChk: Observable<never>;
		if ((authChk = this.authCheck('updateMany', 'update many')) !== null) {
			return authChk;
		}

		if (!updateables || !updateables.length) {
			this.notification.openCustomSnackbar(`no ${this.element}s were passed to request!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:updateMany: insufficient resources!`);
		}

		const headers: HttpHeaders = new HttpHeaders()
			.set('Authorization', `Bearer ${this.auth.getToken()}`);

		return this.http.patch<T[]>(this.url, updateables, { headers: headers }).pipe(
			tap(e => console.log(e)),
			catchError(this.handleError)
		);
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
			body.push({
				_id: d._id,
				groups: d.groups ? d.groups.map(g => g._id) : undefined,
				metrics: d.metrics ? d.metrics.map(m => m._id) : undefined
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

		const body = {
			groups: deleteable.groups ? deleteable.groups.map(g => g._id) : undefined,
			metrics: deleteable.metrics ? deleteable.metrics.map(m => m._id) : undefined
		};

		let req = new HttpRequest('DELETE', `${this.url}/${deleteable._id}`);
		req = req.clone({ headers: headers, body: body });

		return this.http.request(req)
			.pipe(
				// tap(e => console.log(e)),
				catchError(this.handleError)
			);
	}

	/**
	 * stores instances in localStorage.
	 * @param data element instances fetched from server.
	 */
	private store<T>(data: T[]): T[] {
		localStorage.setItem(`mviwo-${this.element}s`, JSON.stringify(data));
		return data;
	}

	/**
	 * handles errors.
	 * @param error
	 */
	private handleError(error: Response) { // TODO: server unreachable: fetch from db with disabled editing.
		// if (error.status === 400) {
		// 	return Observable.throw(new BadInputError(error.json()));
		// }

		// if (error.status === 404) {
		// 	return Observable.throw(error.json());
		// }

		return Observable.throw(error);
	}

	/**
	 *
	 * @param fnName function name being checked.
	 * @param activity activity attempted.
	 */
	private authCheck(fnName: string, activity: string): Observable<never> {
		if (!this.auth.isLoggedIn) {
			this.auth.logout();
			this.notification.openCustomSnackbar(`user not logged in!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:${fnName}: user not logged in!`);
		}

		if (!this.auth.hasPermission(this.element, fnName)) {
			this.notification.openCustomSnackbar(`not allowed to ${activity} ${this.element}!`, 'OK', Number.MAX_SAFE_INTEGER);
			return Observable.throw(`${this.element}:${fnName}: insufficient permissions!`);
		}

		return null;
	}
}

/**
 * a mongo object with object id field.
 */
export interface Mongoloid {
	_id: string;
}

/**
 * a mongo object with additional mongo references to be addressed when deleted.
 */
export interface Deleteable extends Mongoloid {
	groups?: Mongoloid[];
	metrics?: Mongoloid[];
}

/**
 * a mongo object with additional mongo references to be addressed when updated.
 */
export interface Updateable extends Mongoloid {
	removedGroups?: string[];
	removedMetrics?: string[];
}
