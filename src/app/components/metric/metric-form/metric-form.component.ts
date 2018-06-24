import {
	ArraysService
} from './../../../services/arrays/arrays.service';
import {
	MetricCrudService
} from './../../../services/crud/metric-crud.service';
import {
	Component,
	OnInit,
	Inject
} from '@angular/core';
import {
	MetricGroupCrudService
} from '../../../services/crud/metric-group-crud.service';
import {
	FormGroup,
	FormControl,
	FormArray,
	Validators,
	AbstractControl
} from '@angular/forms';
import {
	MAT_DIALOG_DATA,
	MatDialogRef
} from '@angular/material';
import {
	Metric
} from '../../../models/metric.model';
import {
	ElementFormInput
} from '../../../models/resource-form-input.interface';
import {
	AbstractControlValidators
} from '../../../validators/abstract-control.directive';
import {
	NumericValidators
} from '../../../validators/numeric.directive';
import {
	regexValidator
} from '../../../validators/regex.directive';
import {
	ArrayValidators
} from '../../../validators/array.directive';
import {
	MetricGroup
} from '../../../models/metric-group.model';
import { Updateable } from '../../../services/crud/crud.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-metric-form',
	templateUrl: './metric-form.component.html',
	styleUrls: ['./metric-form.component.scss']
})
export class MetricFormComponent implements OnInit {
	/** @see Metric.dataTypes */
	dataTypes = Metric.dataTypes;

	/** @see Metric.rules */
	rules = Metric.rules;

	/** holds metric's initial groups. */
	private initialGroups: FormControl[] = [];

	/** metric's current groups. */
	metricGroups: FormControl[] = [];

	/** enum values control. */
	xxValuesInput: FormControl;

	/** main form. */
	form: FormGroup;

	/** used to bind both preview slider & input field */
	sliderPrev = 0;

	numberPresets = [{
		name: 'Scale 1-5',
		minValue: 1,
		maxValue: 5,
		step: 1,
		tickInterval: 1
	}];

	constructor(
		private crud: MetricCrudService
		, private groupsCrud: MetricGroupCrudService
		, private arrays: ArraysService
		, protected dialogRef: MatDialogRef < MetricFormComponent >
		, @Inject(MAT_DIALOG_DATA) public data: ElementFormInput < Metric >
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxValues();
		this.initxxGroups();

		this.xxValuesInput = new FormControl(
			'', [
				AbstractControlValidators.dependancyValidator(this.form.get('grpEnumParams').get('xxValues'))
				, AbstractControlValidators.valueNotExistsValidator( < FormArray > this.form.get('grpEnumParams').get('xxValues'))
			]
		);
	}

	// INIT //

	/**
	 * initializes form.
	 */
	private initForm(): void {
		this.form = new FormGroup({
			'tfName': new FormControl(
				(this.data.resource) ? this.data.resource.name : '', [
					Validators.required, Validators.minLength(this.rules.nameMinLength), Validators.maxLength(this.rules.nameMaxLength)
				]
			),
			'cbRequired': new FormControl(
				(this.data.resource) ? this.data.resource.isRequired : this.rules.defaultIsRequired
			),
			'taDescription': new FormControl(
				(this.data.resource) ? this.data.resource.description : '', Validators.maxLength(this.rules.descriptionMaxLength)
			),
			'slDataType': new FormControl(
				(this.data.resource) ? this.data.resource.dataType : '', Validators.required
			),
			'grpStringParams': new FormGroup({
				'cbEmail': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams) ?
					this.data.resource.stringParams.isEmail : this.rules.defaultIsEmail
				),
				'cbLineBreaks': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.lineBreaks) ?
					this.data.resource.stringParams.lineBreaks : this.rules.defaultLineBreaks
				),
				'tfMinLength': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.minLength) ?
					this.data.resource.stringParams.minLength : '', [
						// Validators.min(0),
						NumericValidators.discreteValidator(), NumericValidators.lessThanEqualValidator(
							() => this.getControlValue('tfMaxLength', 'grpStringParams')
						)
					]
				),
				'tfMaxLength': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.maxLength) ?
					this.data.resource.stringParams.maxLength : '', [
						// Validators.min(1),
						NumericValidators.discreteValidator(), NumericValidators.greaterThanEqualValidator(
							() => this.getControlValue('tfMinLength', 'grpStringParams')
						)
					]
				),
				'tfPattern': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.pattern) ?
					this.data.resource.stringParams.pattern : '', [
						regexValidator()
					]
				),
				'tfHint': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.hint) ?
					this.data.resource.stringParams.hint : ''
				)
			}),
			'grpNumberParams': new FormGroup({
				'tfMinValue': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.minValue) ?
					this.data.resource.numberParams.minValue : '', [
						NumericValidators.lessThanValidator(() => this.getControlValue('tfMaxValue', 'grpNumberParams'))
					]
				),
				'tfMaxValue': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.maxValue) ?
					this.data.resource.numberParams.maxValue : '', [
						NumericValidators.greaterThanValidator(() => this.getControlValue('tfMinValue', 'grpNumberParams'))
					]
				),
				'tfStep': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.step) ?
					this.data.resource.numberParams.step : '', [
						// Validators.required,
						NumericValidators.positiveValidator()
					]
				),
				'tfTickInterval': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.tickInterval) ?
					this.data.resource.numberParams.tickInterval : '', [
						// Validators.required,
						NumericValidators.positiveValidator()
					]
				),
				'tfPrefix': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.prefix) ?
					this.data.resource.numberParams.prefix : '',
				),
				'tfPostfix': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.postfix) ?
					this.data.resource.numberParams.postfix : '',
				),
				'cbFreeInput': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.freeInput) ?
					this.data.resource.numberParams.freeInput : this.rules.defaultFreeInput,
				)
			}),
			'grpEnumParams': new FormGroup({
				'cbMultiple': new FormControl(
					(this.data.resource &&
						this.data.resource.enumParams) ?
					this.data.resource.enumParams.isMultiple : this.rules.defaultIsMultiple
				),
				'xxValues': new FormArray([])
			}),
			'xxGroups': new FormArray([])
		});
	}

	/**
	 * initializes enum values controls.
	 */
	private initxxValues(): void {
		const xxValues: FormArray = this.form.get('grpEnumParams').get('xxValues') as FormArray;
		xxValues.controls.splice(0, xxValues.controls.length);

		if (this.data.resource && this.data.resource.enumParams) {
			this.data.resource.enumParams.values.forEach(item => {
				xxValues.controls.push(new FormControl(item));
			});
		}

		if (this.form.get('slDataType').value === 'enum') {
			xxValues.setValidators(ArrayValidators.minLengthValidator(2));
		}

		xxValues.updateValueAndValidity();
		xxValues.markAsPristine();
	}

	/**
	 * initializes groups control.
	 */
	private initxxGroups(): void {
		const xxGroups: FormArray = this.form.get('xxGroups') as FormArray;

		if (this.data.resource) {
			this.data.resource.groups.forEach(item => {
				xxGroups.controls.push(new FormControl(item));
			});
		}

		this.groupsCrud.getMany < MetricGroup > (undefined, 'name description').subscribe(data => {
			xxGroups.controls.forEach(item => {
				data = data.filter(obj => obj._id !== item.value._id);
			});
			data.forEach(item => {
				const fc = new FormControl(item);
				this.initialGroups.push(fc);
				this.metricGroups.push(fc);
			});
		});
	}

	// EVENTS //

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		this.data.isEdit ? this.update(this.prepareBody()) : this.insert(this.prepareBody());
	}

	/**
	 * cancel button event. closes the dialog.
	 */
	onCancelClick(): void {
		this.dialogRef.close();
	}

	/**
	 * reset button event. resets all controls.
	 */
	onResetClick(): void {
		const name = this.form.get('tfName');
		name.reset((this.data.resource) ? this.data.resource.name : '');
		name.updateValueAndValidity();

		const required = this.form.get('cbRequired');
		required.reset((this.data.resource) ? this.data.resource.isRequired : this.rules.defaultIsRequired);

		const desc = this.form.get('taDescription');
		desc.reset((this.data.resource) ? this.data.resource.description : '');
		desc.updateValueAndValidity();

		const dType = this.form.get('slDataType');
		dType.reset((this.data.resource) ? this.data.resource.dataType : '');
		dType.updateValueAndValidity();

		const grpString = this.form.get('grpStringParams');
		const email = grpString.get('cbEmail');
		email.reset((this.data.resource &&
				this.data.resource.stringParams) ?
			this.data.resource.stringParams.isEmail : this.rules.defaultIsEmail);
		const lineBreaks = grpString.get('cbLineBreaks');
		lineBreaks.reset((this.data.resource &&
				this.data.resource.stringParams &&
				this.data.resource.stringParams.lineBreaks) ?
			this.data.resource.stringParams.lineBreaks : this.rules.defaultLineBreaks);
		const minLen = grpString.get('tfMinLength');
		minLen.reset((this.data.resource &&
				this.data.resource.stringParams &&
				this.data.resource.stringParams.minLength) ?
			this.data.resource.stringParams.minLength : '');
		const maxLen = grpString.get('tfMaxLength');
		maxLen.reset((this.data.resource &&
				this.data.resource.stringParams &&
				this.data.resource.stringParams.maxLength) ?
			this.data.resource.stringParams.maxLength : '');
		const pattern = grpString.get('tfPattern');
		pattern.reset((this.data.resource &&
				this.data.resource.stringParams &&
				this.data.resource.stringParams.pattern) ?
			this.data.resource.stringParams.pattern : '');
		const hint = grpString.get('tfHint');
		hint.reset((this.data.resource &&
				this.data.resource.stringParams &&
				this.data.resource.stringParams.hint) ?
			this.data.resource.stringParams.hint : '');
		grpString.updateValueAndValidity();

		const grpNumber = this.form.get('grpNumberParams');
		const minVal = grpNumber.get('tfMinValue');
		minVal.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.minValue) ?
			this.data.resource.numberParams.minValue : '');
		const maxVal = grpNumber.get('tfMaxValue');
		maxVal.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.maxValue) ?
			this.data.resource.numberParams.maxValue : '');
		const step = grpNumber.get('tfStep');
		step.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.step) ?
			this.data.resource.numberParams.step : '');
		const tick = grpNumber.get('tfTickInterval');
		tick.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.tickInterval) ?
			this.data.resource.numberParams.tickInterval : '');
		const prefix = grpNumber.get('tfPrefix');
		prefix.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.prefix) ?
			this.data.resource.numberParams.prefix : '');
		const postfix = grpNumber.get('tfPostfix');
		postfix.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.postfix) ?
			this.data.resource.numberParams.postfix : '');
		const freeInput = grpNumber.get('cbFreeInput');
		freeInput.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.freeInput) ?
			this.data.resource.numberParams.freeInput : this.rules.defaultFreeInput);
		grpNumber.updateValueAndValidity();

		const grpEnum = this.form.get('grpEnumParams');
		const multiple = grpEnum.get('cbMultiple');
		multiple.reset((this.data.resource &&
				this.data.resource.enumParams) ?
			this.data.resource.enumParams.isMultiple : this.rules.defaultIsMultiple);
		multiple.updateValueAndValidity();
		this.initxxValues();

		const xxGroups: FormArray = < FormArray > this.form.get('xxGroups');
		xxGroups.controls.splice(0, xxGroups.controls.length);
		if (this.data.resource) {
			this.data.resource.groups.forEach(item => {
				xxGroups.controls.push(new FormControl(item));
			});
		}
		xxGroups.updateValueAndValidity();
		xxGroups.markAsPristine();
		this.metricGroups.splice(0, this.metricGroups.length);
		this.initialGroups.forEach(item => this.metricGroups.push(item));
	}

	/**
	 *
	 */
	onEnumValuesChange(): void {
		const ctrlArr: FormArray = this.form.get('grpEnumParams').get('xxValues') as FormArray;

		let dirty = true;
		if (this.data.resource && this.data.resource.enumParams) {
			dirty = !this.arrays.sameValues < String > (
				this.data.resource.enumParams.values,
				ctrlArr.controls.map(item => item.value)
			);
		}

		if (dirty) {
			ctrlArr.markAsDirty();
		} else {
			ctrlArr.markAsPristine();
		}
	}

	/**
	 *
	 */
	onGroupDragSuccessful(): void {
		const xxGroups = < FormArray > this.form.get('xxGroups');
		xxGroups.updateValueAndValidity();

		let dirty = true;
		if (this.data.resource) {
			dirty = !this.arrays.sameValues < String > (
				this.data.resource.groups.map(item => item._id),
				xxGroups.controls.map(item => item.value._id));
		}

		if (dirty) {
			xxGroups.markAsDirty();
		} else {
			xxGroups.markAsPristine();
		}
	}

	/**
	 *
	 */
	onEmailTicked(): void {
		const grp = this.form.get('grpStringParams');
		const email = grp.get('cbEmail');
		const lb = grp.get('cbLineBreaks');
		if (email.value && lb.value) {
			lb.setValue(false);
			lb.updateValueAndValidity();
			if (this.data.resource && this.data.resource.stringParams) {
				if (this.data.resource.stringParams.lineBreaks === undefined) {
					if (lb.value) {
						lb.markAsDirty();
					} else {
						lb.markAsPristine();
					}
				} else {
					if (this.data.resource.stringParams.lineBreaks === lb.value) {
						lb.markAsPristine();
					} else {
						lb.markAsDirty();
					}
				}
			}
		} else {}

		if (this.data.resource && this.data.resource.stringParams &&
			this.data.resource.stringParams.isEmail === email.value) {
			email.markAsPristine();
		}
	}

	/**
	 *
	 */
	onLineBreaksTicked(): void {
		const grp = this.form.get('grpStringParams');
		const email = grp.get('cbEmail');
		const lb = grp.get('cbLineBreaks');
		if (lb.value && email.value) {
			email.setValue(false);
			email.updateValueAndValidity();
			if (this.data.resource && this.data.resource.stringParams) {
				if (this.data.resource.stringParams.isEmail !== email.value) {
					email.markAsDirty();
				} else {
					email.markAsPristine();
				}
			}
		} else {}

		if (this.data.resource && this.data.resource.stringParams &&
			((this.data.resource.stringParams.lineBreaks === undefined && !lb.value) ||
				this.data.resource.stringParams.lineBreaks === lb.value)) {
			lb.markAsPristine();
		}
	}

	/**
	 *
	 * @param source
	 */
	onMinMaxValueChange(source: String): void {
		const grp = this.form.get('grpNumberParams');
		const max = grp.get('tfMaxValue');
		const min = grp.get('tfMinValue');
		const maxVal = (typeof max.value === 'string') ? Number.parseInt(max.value) : max.value;
		const minVal = (typeof min.value === 'string') ? Number.parseInt(min.value) : min.value;

		if (maxVal <= minVal) {
			if (source === 'max') {
				min.markAsTouched();
				min.setErrors({
					'lessThan': {
						value: minVal
					}
				});
			} else {
				max.markAsTouched();
				max.setErrors({
					'greaterThan': {
						value: maxVal
					}
				});
			}
		} else {
			if (source === 'max') {
				min.setErrors(null);
			} else {
				max.setErrors(null);
			}
		}

		this.sliderPrev = min.value && this.sliderPrev < min.value ? min.value :
			!min.value && this.sliderPrev < 0 ? 0 :
			max.value && this.sliderPrev > max.value ? max.value :
			!max.value && this.sliderPrev > 100 ? 100 : this.sliderPrev;
	}

	/**
	 *
	 * @param source
	 */
	onMinMaxLengthChange(source: String): void {
		const grp = this.form.get('grpStringParams');
		const max = grp.get('tfMaxLength');
		const min = grp.get('tfMinLength');
		const maxVal = (typeof max.value === 'string') ? Number.parseInt(max.value) : max.value;
		const minVal = (typeof min.value === 'string') ? Number.parseInt(min.value) : min.value;

		if (maxVal <= minVal) {
			if (source === 'max') {
				min.markAsTouched();
				min.setErrors({
					'lessThanEqual': {
						value: minVal
					}
				});
			} else {
				max.markAsTouched();
				max.setErrors({
					'greaterThanEqual': {
						value: maxVal
					}
				});
			}
		} else {
			if (source === 'max') {
				min.setErrors(null);
			} else {
				max.setErrors(null);
			}
		}
	}

	/**
	 *
	 */
	onDataTypeChange(): void {
		const current = this.form.get('slDataType').value;

		if (current === 'enum') {
			const xxValues = this.form.get('grpEnumParams').get('xxValues');
			xxValues.setValidators(ArrayValidators.minLengthValidator(2));
			xxValues.updateValueAndValidity();
		} else {
			const xxValues = this.form.get('grpEnumParams').get('xxValues');
			xxValues.setValidators(null);
			xxValues.updateValueAndValidity();
		}

		if (current !== 'string') {
			const strGrp = this.form.get('grpStringParams');

			const minLen = strGrp.get('tfMinLength');
			if (minLen.invalid) {
				minLen.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.minLength) ?
					this.data.resource.stringParams.minLength : '');
				minLen.setErrors(null);
			}

			const maxLen = strGrp.get('tfMaxLength');
			if (maxLen.invalid) {
				maxLen.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.maxLength) ?
					this.data.resource.stringParams.maxLength : '');
				maxLen.setErrors(null);
			}

			const pattern = strGrp.get('tfPattern');
			if (pattern.invalid) {
				pattern.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.pattern) ?
					this.data.resource.stringParams.pattern : '');
				pattern.setErrors(null);
			}
		}

		if (current !== 'number') {
			const numGrp = this.form.get('grpNumberParams');
			const minVal = numGrp.get('tfMinValue');
			if (minVal.invalid) {
				minVal.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.minValue) ?
					this.data.resource.numberParams.minValue : '');
				minVal.setErrors(null);
			}

			const maxVal = numGrp.get('tfMaxValue');
			if (maxVal.invalid) {
				maxVal.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.maxValue) ?
					this.data.resource.numberParams.maxValue : '');
				maxVal.setErrors(null);
			}

			const steps = numGrp.get('tfStep');
			if (steps.invalid) {
				steps.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.step) ?
					this.data.resource.numberParams.step : '');
				steps.setErrors(null);
			}

			const tickIval = numGrp.get('tfTickInterval');
			if (tickIval.invalid) {
				tickIval.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.tickInterval) ?
					this.data.resource.numberParams.tickInterval : '');
				tickIval.setErrors(null);
			}
		}

		if (current !== 'boolean') {}

		if (current !== 'date') {
			// TODO
		}

		if (current !== 'enum') {
			// TODO
		}
	}

	/**
	 *
	 * @param preset
	 */
	onPresetPicked(preset): void {
		const grp = this.form.get('grpNumberParams');

		const minVal = grp.get('tfMinValue');
		minVal.setValue(preset.minValue);
		if (!this.data.resource || (this.data.resource.numberParams && preset.minValue !== this.data.resource.numberParams.minValue)) {
			minVal.markAsDirty();
		}
		minVal.updateValueAndValidity();

		const maxVal = grp.get('tfMaxValue');
		maxVal.setValue(preset.maxValue);
		if (!this.data.resource || (this.data.resource.numberParams && preset.maxValue !== this.data.resource.numberParams.maxValue)) {
			maxVal.markAsDirty();
		}
		maxVal.updateValueAndValidity();

		const step = grp.get('tfStep');
		step.setValue(preset.step);
		if (!this.data.resource || (this.data.resource.numberParams && preset.step !== this.data.resource.numberParams.step)) {
			step.markAsDirty();
		}
		step.updateValueAndValidity();

		const tick = grp.get('tfTickInterval');
		tick.setValue(preset.tickInterval);
		if (!this.data.resource || (this.data.resource.numberParams && preset.tickInterval !== this.data.resource.numberParams.tickInterval)) {
			tick.markAsDirty();
		}
		tick.updateValueAndValidity();

		this.onMinMaxValueChange(undefined);
	}

	// MANIPULATION

	/**
	 *
	 */
	addEnumValue(): void {
		const ctrlArr: FormArray = this.form.get('grpEnumParams').get('xxValues') as FormArray;
		const ctrl = this.xxValuesInput;

		if (!ctrlArr.controls.find(item => item.value === ctrl.value)) {
			ctrlArr.push(new FormControl(ctrl.value));
			ctrl.reset('');
			ctrl.updateValueAndValidity();
			this.onEnumValuesChange();
		} else {}
	}

	/**
	 *
	 * @param value
	 */
	removeEnumValue(value): void {
		const ctrlArr: FormArray = this.form.get('grpEnumParams').get('xxValues') as FormArray;
		ctrlArr.removeAt(ctrlArr.controls.indexOf(value));
		this.onEnumValuesChange();
		this.xxValuesInput.updateValueAndValidity();
	}

	/**
	 *
	 * @param ctrl
	 */
	addGroup(ctrl: FormControl): void {
		( < FormArray > this.form.get('xxGroups')).controls.push(ctrl);
		this.metricGroups.splice(this.metricGroups.indexOf(ctrl), 1);
		this.onGroupDragSuccessful();
	}

	/**
	 *
	 * @param ctrl
	 */
	removeGroup(ctrl: FormControl): void {
		const xxGroups: FormControl[] = < FormControl[] > ( < FormArray > this.form.get('xxGroups')).controls;
		this.metricGroups.push(ctrl);
		xxGroups.splice(xxGroups.indexOf(ctrl), 1);
		this.onGroupDragSuccessful();
	}

	/**
	 * sends insert request to server.
	 * @param insertedMetric inserted metric model obj.
	 */
	private insert(metric: Updateable): void {
		this.crud.insertOne(metric)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	/**
	 * sends update request to server.
	 * @param updatedMetric updated metric model obj.
	 */
	private update(updateable: Updateable): void {
		this.crud.updateOne(updateable)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	// UTIL //

	/**
	 *
	 * @param controlName
	 * @param groupName
	 */
	private getControlValue(controlName: string, groupName?: string): any {
		return this.form ?
			(groupName ?
				this.form.get(groupName).get(controlName).value :
				this.form.get(controlName).value) :
			null;
	}

	/**
	 *
	 * @param controlName
	 * @param grpName
	 */
	getInvalid(controlName: string, grpName?: string): boolean {
		return this.form.get(grpName).get(controlName).invalid;
	}

	/**
	 *
	 */
	getNameErrorMessage(): string {
		const field = this.form.get('tfName');
		return (field.hasError('required')) ?
			'you must enter a metric name!' :
			(field.hasError('minlength')) ?
			'too short!' : '';
	}

	/**
	 *
	 */
	getMinLengthErrorMessage(): string {
		const field = this.form.get('grpStringParams').get('tfMinLength');
		return (field.hasError('discrete')) ?
			'must be discrete!' :
			(field.hasError('lessThanEqual')) ?
			'must be <= max length!' : '';
	}

	/**
	 *
	 */
	getMaxLengthErrorMessage(): string {
		const field = this.form.get('grpStringParams').get('tfMaxLength');
		return (field.hasError('discrete')) ?
			'must be discrete!' :
			(field.hasError('greaterThanEqual')) ?
			'must be >= min length!' : '';
	}

	/**
	 *
	 */
	getPatternErrorMessage(): string {
		const field = this.form.get('grpStringParams').get('tfPattern');
		return (field.hasError('regex')) ?
			'invalid regular expression! train yourself here: https://regexr.com/' : '';
	}

	/**
	 *
	 */
	getMinValueErrorMessage(): string {
		const field = this.form.get('grpNumberParams').get('tfMinValue');
		return (field.hasError('required')) ?
			'you must enter a minimum value!' :
			(field.hasError('lessThan')) ?
			'must be < max value!' : '';
	}

	/**
	 *
	 */
	getMaxValueErrorMessage(): string {
		const field = this.form.get('grpNumberParams').get('tfMaxValue');
		return (field.hasError('required')) ?
			'you must enter a maximum value!' :
			(field.hasError('greaterThan')) ?
			'must be > min value!' : '';
	}

	/**
	 *
	 */
	getStepErrorMessage(): string {
		const field = this.form.get('grpNumberParams').get('tfStep');
		return (field.hasError('required')) ?
			'you must enter a step value!' :
			(field.hasError('positive')) ?
			'must be > 0!' : '';
	}

	/**
	 *
	 */
	getTickIntervalErrorMessage(): string {
		const field = this.form.get('grpNumberParams').get('tfTickInterval');
		return (field.hasError('required')) ?
			'you must enter a tick interval value!' :
			(field.hasError('positive')) ?
			'must be > 0!' : '';
	}

	/**
	 * returns new metric model obj based on form value.
	 * @param value ngForm's value.
	 */
	prepareBody(): Updateable {
		const dType = this.form.get('slDataType').value;

		const tempMetric = new Metric(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('tfName').value,
			this.form.get('cbRequired').value,
			dType,
			( < FormArray > this.form.get('xxGroups')).controls.map(item => item.value),
			this.form.get('taDescription').value,
			undefined,
			undefined,
			undefined,
			undefined
		);

		if (dType === 'string') {
			const grp = this.form.get('grpStringParams');
			const email = grp.get('cbEmail').value;
			const lineBrks = grp.get('cbLineBreaks').value;

			tempMetric.stringParams = {
				isEmail: email,
				lineBreaks: lineBrks,
				minLength: grp.get('tfMinLength').value,
				maxLength: grp.get('tfMaxLength').value,
				pattern: (email || lineBrks) ? undefined : grp.get('tfPattern').value,
				hint: grp.get('tfHint').value
			};
		} else if (dType === 'number') {
			const grp = this.form.get('grpNumberParams');

			tempMetric.numberParams = {
				minValue: grp.get('tfMinValue').value,
				maxValue: grp.get('tfMaxValue').value,
				step: grp.get('tfStep').value,
				tickInterval: grp.get('tfTickInterval').value,
				prefix: grp.get('tfPrefix').value,
				postfix: grp.get('tfPostfix').value,
				freeInput: grp.get('cbFreeInput').value
			};
		} else if (dType === 'enum') {
			const grp = this.form.get('grpEnumParams');

			tempMetric.enumParams = {
				isMultiple: grp.get('cbMultiple').value,
				values: ( < FormArray > grp.get('xxValues')).controls.map(item => item.value)
			};
		} else if (dType === 'date') {
			const grp = this.form.get('grpDateParams');

			tempMetric.dateParams = {
				minDate: grp.get('dpMinDate').value,
				maxDate: grp.get('dpMaxDate').value,
				format: grp.get('tfFormat').value
			};
		}

		const removedGroups: string[] = [];
		if (this.data.resource) { // EDIT MODE
			const currentGroups: string[] = tempMetric.groups.map(item => item._id);
			this.data.resource.groups.forEach(group => {
				if (!currentGroups.includes(group._id)) {
					removedGroups.push(group._id);
				}
			});
		}

		const updateable = {
			_id: tempMetric._id
			, removedGroups: this.data.resource ? removedGroups : undefined
		};

		Object.keys(tempMetric).forEach(key => {
			updateable[key] = tempMetric[key];
		});

		return updateable;
	}

	/**
	 *
	 */
	getxxValuesControls(): AbstractControl[] {
		return (<FormArray>this.form.get('grpEnumParams').get('xxValues')).controls;
	}

	/**
	 *
	 */
	getxxGroupsControls(): AbstractControl[] {
		return (<FormArray>this.form.get('xxGroups')).controls;
	}
}
