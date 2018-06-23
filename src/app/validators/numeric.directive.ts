import {
	ValidatorFn,
	AbstractControl
} from '@angular/forms';

type ValidatedValueFn = () => number;

export class NumericValidators {
	/**
	 * current control value is greater than other value.
	 * @param other
	 */
	public static greaterThanValidator(other: number | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;
			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'number') &&
				(Number.isNaN(otherVal) || !(control.value > otherVal));
			return error ? {
				'greaterThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is greater or even than other value.
	 * @param other
	 */
	public static greaterThanEqualValidator(other: number | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;
			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'number') &&
				(Number.isNaN(otherVal) || !(control.value >= otherVal));
			return error ? {
				'greaterThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is less than other value.
	 * @param other
	 */
	public static lessThanValidator(other: number | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;
			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'number') &&
				(Number.isNaN(otherVal) || !(control.value < otherVal));
			return error ? {
				'lessThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is less or equal than other value.
	 * @param other
	 */
	public static lessThanEqualValidator(other: number | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;
			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'number') &&
				(Number.isNaN(otherVal) || !(control.value <= otherVal));
			return error ? {
				'lessThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is positive.
	 */
	public static positiveValidator(): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const error = !(control.value > 0);
			return error ? {
				'positive': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is discrete.
	 */
	public static discreteValidator(): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'number') {
				return null;
			}
			const error = !Number.isInteger(control.value);
			return error ? {
				'discrete': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * checks if value is a number or a function.
	 * @param val
	 */
	private static isValidatedValueFn(val: number | ValidatedValueFn): val is ValidatedValueFn {
		return !Number.isNaN(val as number);
	}
}
