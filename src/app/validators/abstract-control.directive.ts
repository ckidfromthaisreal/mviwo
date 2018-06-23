import {
	AbstractControl,
	ValidatorFn,
	FormArray
} from '@angular/forms';

export class AbstractControlValidators {
	/**
	 * current control is invalid if other control is invalid.
	 * @param other other control.
	 */
	public static dependancyValidator(other: AbstractControl): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			return (other.invalid) ? {
				'dependancy': {
					value: other
				}
			} : null;
		};
	}

	/**
	 * current control is invalid if it's value is already included in FormArray's controls' values.
	 * @param other
	 */
	public static valueNotExistsValidator(other: FormArray): ValidatorFn {
		return (control: AbstractControl): {
			[key: string]: any
		} => {
			const error = other.controls.find(item => item.value === control.value);
			return error ? {
				'valueNotExists': {
					value: control.value
				}
			} : null;
		};
	}
}
