import {
	AbstractControl,
	ValidatorFn
} from '@angular/forms';

type ValidatedValueFn = () => string;

export class DateValidators {
	public static notAfterValidator(other: string | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === null || control.value === undefined || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;

			console.log('other', otherVal);
			console.log('control.value', control.value);

			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'string') &&
				(new Date(control.value) > new Date(otherVal));
			return {
				'notAfter': {
					value: control.value
				}
			};
		};
	}

	public static notBeforeValidator(other: string | ValidatedValueFn): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			if (control.value === null || control.value === undefined || typeof control.value !== 'string') {
				return null;
			}

			const otherVal = (this.isValidatedValueFn(other)) ?
				other() : other;
			const error = (otherVal !== undefined && otherVal !== null && typeof otherVal === 'string') &&
				(new Date(control.value) < new Date(otherVal));
			return {
				'notBefore': {
					value: control.value
				}
			};
		};
	}

	private static isValidatedValueFn(val: string | ValidatedValueFn): val is ValidatedValueFn {
		return (typeof val !== 'string');
	}
}
