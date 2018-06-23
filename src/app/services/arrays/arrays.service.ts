import {
	Injectable
} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class ArraysService {
	constructor() {}

	/**
	 * checks if arrays are identical.
	 * @param arr1
	 * @param arr2
	 */
	public sameValuesAndOrder<T> (arr1: T[], arr2: T[]): boolean {
		if (!arr1 || !arr2 || arr1.length !== arr2.length) {
			return false;
		}

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) {
				return false;
			}
		}

		return true;
	}

	/**
	 * checks if arrays have same values.
	 * @param arr1
	 * @param arr2
	 * @param compareFn
	 */
	public sameValues < T > (arr1: T[], arr2: T[], compareFn?: (a: T, b: T) => number): boolean {
		if (!arr1 || !arr2 || arr1.length !== arr2.length) {
			return false;
		}

		const sorted1 = [];
		const sorted2 = [];

		arr1.forEach(item => sorted1.push(item));
		arr2.forEach(item => sorted2.push(item));

		sorted1.sort(compareFn);
		sorted2.sort(compareFn);

		return this.sameValuesAndOrder<T> (sorted1, sorted2);
	}
}
