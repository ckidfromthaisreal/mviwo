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

	public before(d0: Date, d1: Date) {
		const d0Str = new Date(d0).toString().substring(0, 15);
		const d1Str = new Date(d1).toString().substring(0, 15);
		return d0Str < d1Str;
	}

	public upTo(d0: Date, d1: Date) {
		const d0Str = new Date(d0).toString().substring(0, 15);
		const d1Str = new Date(d1).toString().substring(0, 15);
		return d0Str <= d1Str;
	}

	public after(d0: Date, d1: Date) {
		const d0Str = new Date(d0).toString().substring(0, 15);
		const d1Str = new Date(d1).toString().substring(0, 15);
		return d0Str > d1Str;
	}

	public from(d0: Date, d1: Date) {
		const d0Str = new Date(d0).toString().substring(0, 15);
		const d1Str = new Date(d1).toString().substring(0, 15);
		return d0Str >= d1Str;
	}

	constructor() {}
}
