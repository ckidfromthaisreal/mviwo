import {
	ValidatorFn,
	AbstractControl
} from '@angular/forms';

type ValidatedStringFn = () => string;
type ValidatedLengthFn = () => number;

export class StringValidators {
	/**
	 * current control value is longer than other value.
	 * @param other
	 */
	public static longerThanStringValidator(other: string | ValidatedStringFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}
			const otherVal = (this.isValidatedStringFn(other)) ?
				other() : other;
			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'string' &&
				control.value.length <= otherVal.length;
			return error ? {
				'longerThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is longer than other value.
	 * @param other
	 */
	public static longerThanLengthValidator(other: number | ValidatedLengthFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}
			const otherVal = (this.isValidatedLengthFn(other)) ?
				other() : other;
			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'number' &&
				control.value.length <= otherVal;
			return error ? {
				'longerThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is longer or of same length than other value.
	 * @param other
	 */
	public static longerThanEqualStringValidator(other: string | ValidatedStringFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedStringFn(other)) ?
				other() : other;

			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'string' && control.value.length < otherVal.length;
			return error ? {
				'longerThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is longer or of same length than other value.
	 * @param other
	 */
	public static longerThanEqualLengthValidator(other: number | ValidatedLengthFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedLengthFn(other)) ?
				other() : other;

			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'number' && control.value.length < otherVal;
			return error ? {
				'longerThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is shorter than other value.
	 * @param other
	 */
	public static shorterThanStringValidator(other: string | ValidatedStringFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}
			const otherVal = (this.isValidatedStringFn(other)) ?
				other() : other;
			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'string' &&
				otherVal.length > 0 && control.value.length >= otherVal.length;
			return error ? {
				'shorterThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is shorter than other value.
	 * @param other
	 */
	public static shorterThanLengthValidator(other: number | ValidatedLengthFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}
			const otherVal = (this.isValidatedLengthFn(other)) ?
				other() : other;
			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'number' &&
				otherVal > 0 && control.value.length >= otherVal;
			return error ? {
				'shorterThan': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is shorter or of same length than other value.
	 * @param other
	 */
	public static shorterThanEqualStringValidator(other: string | ValidatedStringFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedStringFn(other)) ?
				other() : other;

			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'string' &&
				otherVal.length > 0 && control.value.length > otherVal.length;
			return error ? {
				'shorterThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * current control value is shorter or of same length than other value.
	 * @param other
	 */
	public static shorterThanEqualLengthValidator(other: number | ValidatedLengthFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedLengthFn(other)) ?
				other() : other;

			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'number' &&
				otherVal > 0 && control.value.length > otherVal;
			return error ? {
				'shorterThanEqual': {
					value: control.value
				}
			} : null;
		};
	}

	public static pattern(other: string | ValidatedStringFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === undefined || control.value === null || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedStringFn(other)) ?
				other() : other;

			const match = control.value.match(otherVal);

			const error = otherVal !== undefined && otherVal !== null && typeof otherVal === 'string' &&
				otherVal.length && (match === null || match.length !== 1 || match[0] !== control.value);
			return error ? {
				'pattern': {
					value: control.value
				}
			} : null;
		};
	}

	/**
	 * checks if value is a string or a function.
	 * @param val
	 */
	private static isValidatedStringFn(val: string | ValidatedStringFn): val is ValidatedStringFn {
		return !(typeof val === 'string');
	}

	private static isValidatedLengthFn(val: number | ValidatedLengthFn): val is ValidatedLengthFn {
		return !Number.isNaN(val as number);
	}
}
