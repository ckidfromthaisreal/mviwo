import { AuthenticationService } from './../authentication/authentication.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
		if (!this.auth.isLoggedIn) {
			this.auth.logout();
			return;
		}

		if (!this.auth.hasPermission(this.element, 'getMany')) {
			console.error(`user has no permission ${this.element}:getMany!`);
			return Observable.of();
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
				if (!['Authorization', 'filter', 'select'].includes(key)) {
					headers = headers.set(key, options['key']);
				}
			});
		}

		return this.http.get<T[]>(this.url, { headers: headers })
			.pipe(
				catchError(this.handleError),
				// tap(e => this.store(e))
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
	 * handles error.
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
}
