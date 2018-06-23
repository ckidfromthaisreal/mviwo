import {
	ValidatorFn,
	AbstractControl
} from '@angular/forms';

/**
 * is control value a valid regular expression.
 */
export function regexValidator(): ValidatorFn {
	return (control: AbstractControl): {
		[key: string]: any
	} => {
		let error = false;
		try {
			if (control.value) {
				// tslint:disable-next-line:no-unused-expression
				new RegExp(control.value);
			}
		} catch (e) {
			error = true;
		}
		return error ? {
			'regex': {
				value: control.value
			}
		} : null;
	};
}
