import {
	Injectable
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class DatesService {
	/**
	 * @param days offset days. defaults to 0.
	 * @param date date to offset off. defaults to now.
	 * @return new date instance set to days from original date.
	 */
	public offsetDate(days?: number, date?: Date): Date {
		const dat = date ? new Date(date) : new Date();
		if (days && days !== 0) {
			dat.setDate(dat.getDate() + days);
		}
		return dat;
	}

	public now(): Date {
		return new Date();
	}

	constructor() {}
}
