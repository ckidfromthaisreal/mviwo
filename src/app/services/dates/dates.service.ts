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
		if (d0.constructor !== Date) {
			d0 = new Date(d0);
		}

		if (d1.constructor !== Date) {
			d1 = new Date(d1);
		}

		return d0.getFullYear() < d1.getFullYear() ||
			(d0.getFullYear() === d1.getFullYear() &&
				(d0.getMonth() < d1.getMonth() ||
					(d0.getMonth() === d1.getMonth() && d0.getDate() < d1.getDate())));
	}

	public upTo(d0: Date, d1: Date) {
		if (d0.constructor !== Date) {
			d0 = new Date(d0);
		}

		if (d1.constructor !== Date) {
			d1 = new Date(d1);
		}

		return d0.getFullYear() < d1.getFullYear() ||
			(d0.getFullYear() === d1.getFullYear() &&
				(d0.getMonth() < d1.getMonth() ||
					(d0.getMonth() === d1.getMonth() && d0.getDate() <= d1.getDate())));
	}

	public after(d0: Date, d1: Date) {
		return this.before(d1, d0);
	}

	public from(d0: Date, d1: Date) {
		return this.upTo(d1, d0);
	}

	public same(d0: Date, d1: Date) {
		if (d0.constructor !== Date) {
			d0 = new Date(d0);
		}

		if (d1.constructor !== Date) {
			d1 = new Date(d1);
		}

		return d0.getFullYear() === d1.getFullYear() && d0.getMonth() === d1.getMonth() && d0.getDate() === d1.getDate();
	}

	public isFuture(d0: Date) {
		return this.after(d0, this.now());
	}

	public isPast(d0: Date) {
		return this.before(d0, this.now());
	}

	constructor() {}
}
