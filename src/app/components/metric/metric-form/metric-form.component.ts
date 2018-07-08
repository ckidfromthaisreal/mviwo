import {
	StringValidators
} from './../../../validators/string.directive';
import {
	DatesService
} from './../../../services/dates/dates.service';
import {
	ArraysService
} from './../../../services/arrays/arrays.service';
import {
	MetricCrudService
} from './../../../services/crud/metric-crud.service';
import {
	Component,
	OnInit,
	Inject,
	Output,
	EventEmitter
} from '@angular/core';
import {
	MetricGroupCrudService
} from '../../../services/crud/metric-group-crud.service';
import {
	FormGroup,
	FormControl,
	FormArray,
	Validators,
	AbstractControl,
	ValidatorFn
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
import {
	Updateable
} from '../../../services/crud/crud.service';

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
	// private initialGroups: FormControl[] = [];
	private initialGroups: MetricGroup[] = [];

	/** metric's current groups. */
	// metricGroups: FormControl[] = [];
	metricGroups: MetricGroup[] = [];

	chosenMetricGroups: MetricGroup[] = [];

	/** enum values control. */
	xxValuesInput: FormControl;

	/** main form. */
	form: FormGroup;

	/** used to bind both preview slider & input field */
	sliderPrev = 0;

	private groupsFetched = false;

	@Output() edited: EventEmitter < Metric > = new EventEmitter();

	numberPresets = [{
		name: 'Scale 1-5',
		minValue: 1,
		maxValue: 5,
		step: 1,
		tickInterval: 1
	}];

	private initialDefaultValueValidators: ValidatorFn[] = [
		NumericValidators.greaterThanEqualValidator(() => this.getControlValue('tfMinValue', 'grpNumberParams')),
		NumericValidators.lessThanEqualValidator(() => this.getControlValue('tfMaxValue', 'grpNumberParams')),
		StringValidators.longerThanEqualLengthValidator(() => this.getControlValue('tfMinLength', 'grpStringParams')),
		StringValidators.shorterThanEqualLengthValidator(() => this.getControlValue('tfMaxLength', 'grpStringParams')),
		StringValidators.pattern(() => this.getControlValue('tfPattern', 'grpStringParams'))
	];

	constructor(
		private crud: MetricCrudService,
		private groupsCrud: MetricGroupCrudService,
		private arrays: ArraysService,
		public dates: DatesService,
		protected dialogRef: MatDialogRef < MetricFormComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput < Metric >
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxValues();
		this.initxxGroups();

		this.xxValuesInput = new FormControl(
			'', [
				AbstractControlValidators.dependancyValidator(this.form.get('grpEnumParams').get('xxValues')),
				AbstractControlValidators.valueNotExistsValidator( < FormArray > this.form.get('grpEnumParams').get('xxValues'))
			]
		);
	}

	// INIT //

	/**
	 * initializes form.
	 */
	private initForm(): void {
		let defValidators = this.initialDefaultValueValidators;

		if (this.data.resource && this.data.resource.stringParams && this.data.resource.stringParams.isEmail === true) {
			defValidators = [...defValidators, Validators.email];
		}

		this.form = new FormGroup({
			'tfName': new FormControl(
				(this.data.resource) ? this.data.resource.name : '', [
					Validators.required,
					Validators.minLength(this.rules.nameMinLength),
					Validators.maxLength(this.rules.nameMaxLength)
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
			'defaultValue': new FormControl(
				(this.data.resource) ? this.data.resource.defaultValue : '', defValidators
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
					this.data.resource.stringParams.minLength : 0, [
						Validators.min(0),
						NumericValidators.discreteValidator(),
						NumericValidators.lessThanEqualValidator(() => this.getControlValue('tfMaxLength', 'grpStringParams'))
					]
				),
				'tfMaxLength': new FormControl(
					(this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.maxLength) ?
					this.data.resource.stringParams.maxLength : '', [
						Validators.min(1),
						NumericValidators.discreteValidator(),
						NumericValidators.greaterThanEqualValidator(() => this.getControlValue('tfMinLength', 'grpStringParams'))
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
					this.data.resource.numberParams.minValue : 0, [
						NumericValidators.lessThanValidator(() => this.getControlValue('tfMaxValue', 'grpNumberParams'))
					]
				),
				'tfMaxValue': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.maxValue) ?
					this.data.resource.numberParams.maxValue : 100, [
						NumericValidators.greaterThanValidator(() => this.getControlValue('tfMinValue', 'grpNumberParams'))
					]
				),
				'tfStep': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.step) ?
					this.data.resource.numberParams.step : 1, [
						// Validators.required,
						NumericValidators.positiveValidator()
					]
				),
				'tfTickInterval': new FormControl(
					(this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.tickInterval) ?
					this.data.resource.numberParams.tickInterval : 1, [
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
			'grpDateParams': new FormGroup({
				'dpMinDate': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.minDate : '',
				),
				'dpMaxDate': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.maxDate : '',
				),
				'cbIsMinDateCurrent': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.isMinDateCurrent : false,
				),
				'cbIsMaxDateCurrent': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.isMaxDateCurrent : false,
				),
				'tfMinDateOffset': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.minDateOffset : '',
					NumericValidators.lessThanEqualValidator(() => this.getControlValue('tfMaxDateOffset', 'grpDateParams'))
				),
				'tfMaxDateOffset': new FormControl(
					(this.data.resource &&
						this.data.resource.dateParams) ?
					this.data.resource.dateParams.maxDateOffset : '',
					NumericValidators.greaterThanEqualValidator(() => this.getControlValue('tfMinDateOffset', 'grpDateParams'))
				),
			}),
			'xxGroups': new FormControl(
				this.data.resource ? [...this.data.resource.groups] : [],
			)
		});

		// if (this.data.resource) {
		// 	let validators;

		// 	if (this.data.resource.dataType === 'string') {
		// 		const grp = this.form.get('grpStringParams');

		// 		validators = [
		// 			Validators.minLength(grp.get('tfMinLength').value || 0)
		// 			, Validators.maxLength(grp.get('tfMaxLength').value)
		// 			,
		// 		];
		// 	}
		// }
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
		if (this.data.resource) {
			this.chosenMetricGroups = [...this.data.resource.groups];
		}

		this.groupsCrud.getMany < MetricGroup > (undefined, 'name description metrics').subscribe(data => {
			this.chosenMetricGroups.forEach(group => {
				group.metrics = (data.find(grp => grp._id === group._id)).metrics;
			});

			const mapped = this.chosenMetricGroups.map(elem => elem._id);
			data = data.filter(item => !mapped.includes(item._id));
			this.metricGroups = [...data];
			this.initialGroups = [...data];

			this.form.get('xxGroups').reset([...this.chosenMetricGroups]);
		});
	}

	// EVENTS //

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		if (this.data.isEdit) {
			const metric = this.prepareMetric();
			this.edited.emit(metric);
			this.update(this.prepareBody(metric));
		} else {
			this.insert(this.prepareBody());
		}
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

		const defVal = this.form.get('defaultValue');
		defVal.reset((this.data.resource) ? this.data.resource.defaultValue : '');
		defVal.updateValueAndValidity();

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
			this.data.resource.stringParams.minLength : 0);
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
			this.data.resource.numberParams.minValue : 0);
		const maxVal = grpNumber.get('tfMaxValue');
		maxVal.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.maxValue) ?
			this.data.resource.numberParams.maxValue : 100);
		const step = grpNumber.get('tfStep');
		step.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.step) ?
			this.data.resource.numberParams.step : 1);
		const tick = grpNumber.get('tfTickInterval');
		tick.reset((this.data.resource &&
				this.data.resource.numberParams &&
				this.data.resource.numberParams.tickInterval) ?
			this.data.resource.numberParams.tickInterval : 1);
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

		const grpDate = this.form.get('grpDateParams');
		grpDate.get('cbIsMinDateCurrent').reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.isMinDateCurrent : false
		);
		grpDate.get('cbIsMaxDateCurrent').reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.isMaxDateCurrent : false
		);
		const minDate = grpDate.get('dpMinDate');
		minDate.reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.minDate : ''
		);
		minDate.updateValueAndValidity();
		const maxDate = grpDate.get('dpMaxDate');
		maxDate.reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.maxDate : ''
		);
		maxDate.updateValueAndValidity();
		const minOff = grpDate.get('tfMinDateOffset');
		minOff.reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.minDateOffset : ''
		);
		minOff.updateValueAndValidity();
		const maxOff = grpDate.get('tfMaxDateOffset');
		maxOff.reset(
			(this.data.resource &&
				this.data.resource.dateParams) ?
			this.data.resource.dateParams.maxDateOffset : ''
		);
		maxOff.updateValueAndValidity();

		const xxGroups = this.form.get('xxGroups');
		xxGroups.reset(this.data.resource ? [...this.chosenMetricGroups] : []);
		xxGroups.updateValueAndValidity();

		this.metricGroups = [...this.initialGroups];
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

		const defVal = this.form.get('defaultValue');
		if (email.value) {
			defVal.setValidators([...this.initialDefaultValueValidators, Validators.email]);
		} else {
			defVal.setValidators(this.initialDefaultValueValidators);
		}
		defVal.updateValueAndValidity();
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
		min.updateValueAndValidity();
		max.updateValueAndValidity();

		this.sliderPrev = min.value && this.sliderPrev < min.value ? min.value :
			!min.value && this.sliderPrev < 0 ? 0 :
			max.value && this.sliderPrev > max.value ? max.value :
			!max.value && this.sliderPrev > 100 ? 100 : this.sliderPrev;

		const defVal = this.form.get('defaultValue');
		defVal.updateValueAndValidity();
	}

	/**
	 *
	 * @param source
	 */
	onMinMaxLengthChange(source: String): void {
		const grp = this.form.get('grpStringParams');
		const max = grp.get('tfMaxLength');
		const min = grp.get('tfMinLength');
		max.updateValueAndValidity();
		min.updateValueAndValidity();

		const defVal = this.form.get('defaultValue');
		defVal.updateValueAndValidity();
	}

	/**
	 *
	 */
	onDataTypeChange(): void {
		const current = this.form.get('slDataType').value;

		const xxValues = this.form.get('grpEnumParams').get('xxValues');
		xxValues.setValidators(current === 'enum' ? ArrayValidators.minLengthValidator(2) : null);
		xxValues.updateValueAndValidity();

		const defVal = this.form.get('defaultValue');
		defVal.reset();
		defVal.setValidators(this.initialDefaultValueValidators);
		defVal.updateValueAndValidity();

		if (current !== 'string') {
			const strGrp = this.form.get('grpStringParams');

			const minLen = strGrp.get('tfMinLength');
			if (minLen.invalid) {
				minLen.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.minLength) ?
					this.data.resource.stringParams.minLength : 0);
				minLen.updateValueAndValidity();
			}

			const maxLen = strGrp.get('tfMaxLength');
			if (maxLen.invalid) {
				maxLen.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.maxLength) ?
					this.data.resource.stringParams.maxLength : '');
				maxLen.updateValueAndValidity();
			}

			const pattern = strGrp.get('tfPattern');
			if (pattern.invalid) {
				pattern.reset((this.data.resource &&
						this.data.resource.stringParams &&
						this.data.resource.stringParams.pattern) ?
					this.data.resource.stringParams.pattern : '');
				pattern.updateValueAndValidity();
			}
		}

		if (current !== 'number') {
			const numGrp = this.form.get('grpNumberParams');
			const minVal = numGrp.get('tfMinValue');
			if (minVal.invalid) {
				minVal.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.minValue) ?
					this.data.resource.numberParams.minValue : 0);
				minVal.updateValueAndValidity();
			}

			const maxVal = numGrp.get('tfMaxValue');
			if (maxVal.invalid) {
				maxVal.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.maxValue) ?
					this.data.resource.numberParams.maxValue : 100);
				maxVal.updateValueAndValidity();
			}

			const steps = numGrp.get('tfStep');
			if (steps.invalid) {
				steps.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.step) ?
					this.data.resource.numberParams.step : 1);
				steps.updateValueAndValidity();
			}

			const tickIval = numGrp.get('tfTickInterval');
			if (tickIval.invalid) {
				tickIval.reset((this.data.resource &&
						this.data.resource.numberParams &&
						this.data.resource.numberParams.tickInterval) ?
					this.data.resource.numberParams.tickInterval : 1);
				tickIval.updateValueAndValidity();
			}
		}

		if (current !== 'boolean') {}

		if (current !== 'date') {
			const grp = this.form.get('grpDateParams');

			const minOff = grp.get('tfMinDateOffset');
			const maxOff = grp.get('tfMaxDateOffset');
			if (minOff.invalid || maxOff.invalid) {
				minOff.reset(
					(this.data.resource &&
						this.data.resource.dateParams &&
						this.data.resource.dateParams.minDateOffset) ?
					this.data.resource.dateParams.minDateOffset : 0);
				maxOff.reset(
					(this.data.resource &&
						this.data.resource.dateParams &&
						this.data.resource.dateParams.maxDateOffset) ?
					this.data.resource.dateParams.maxDateOffset : 0);

				minOff.updateValueAndValidity();
				maxOff.updateValueAndValidity();
			}
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

	onMinMaxCurrentChange(minOrMax: 'min' | 'max'): void {
		const minmax = minOrMax.charAt(0).toUpperCase() + minOrMax.substring(1);

		const grp = this.form.get('grpDateParams');

		const tf = grp.get(`tf${minmax}DateOffset`);
		tf.reset(grp.get(`cbIs${minmax}DateCurrent`).value ? 0 : '');
		tf.updateValueAndValidity();

		const dp = grp.get(`dp${minmax}Date`);
		dp.reset();
		tf.updateValueAndValidity();


		const othertf = grp.get(`tf${minOrMax === 'min' ? 'Max' : 'Min'}DateOffset`);
		othertf.updateValueAndValidity();
	}

	onPatternChange(): void {
		const defVal = this.form.get('defaultValue');
		defVal.updateValueAndValidity();
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
	 * sends insert request to server.
	 * @param metric
	 */
	private insert(metric: Updateable): void {
		this.crud.insertOne(metric)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	/**
	 * sends update request to server.
	 * @param updateable
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
	 *
	 */
	getDefaultValueErrors(): string {
		if (this.form.get('defaultValue').errors) {
			return Object.keys(this.form.get('defaultValue').errors).join(', ');
		}

		return '';
	}

	/**
	 * returns new metric model obj based on form value.
	 * @param metric
	 */
	private prepareBody(metric?: Metric): Updateable {
		const tempMetric = metric || this.prepareMetric();

		const removedGroups: string[] = [];
		if (this.data.isEdit) {
			const currentGroups: string[] = tempMetric.groups.map(item => item._id);
			this.data.resource.groups.forEach(group => {
				if (!currentGroups.includes(group._id)) {
					removedGroups.push(group._id);
				}
			});
		}

		const updateable = {
			_id: tempMetric._id,
			removedGroups: this.data.isEdit ? removedGroups : undefined
		};

		Object.keys(tempMetric).forEach(key => {
			updateable[key] = tempMetric[key];
		});

		return updateable;
	}

	private prepareMetric(): Metric {
		const dType = this.form.get('slDataType').value;

		const tempMetric = new Metric(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('tfName').value,
			this.form.get('cbRequired').value,
			dType,
			this.form.get('xxGroups').value,
			this.form.get('taDescription').value,
			this.form.get('defaultValue').value,
			undefined,
			undefined,
			undefined,
			undefined,
			(this.data.isEdit) ? this.data.resource.position : undefined
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
			const minCur = grp.get('cbIsMinDateCurrent').value;
			const maxCur = grp.get('cbIsMaxDateCurrent').value;

			tempMetric.dateParams = {
				minDate: !minCur ? grp.get('dpMinDate').value : undefined,
				maxDate: !maxCur ? grp.get('dpMaxDate').value : undefined,
				isMinDateCurrent: minCur,
				isMaxDateCurrent: maxCur,
				minDateOffset: minCur ? grp.get('tfMinDateOffset').value : undefined,
				maxDateOffset: maxCur ? grp.get('tfMaxDateOffset').value : undefined
			};
		}

		return tempMetric;
	}

	/**
	 *
	 */
	getxxValuesControls(): AbstractControl[] {
		return ( < FormArray > this.form.get('grpEnumParams').get('xxValues')).controls;
	}

	fixNumberInput(value) {
		return typeof value === 'undefined' ? '' : this.form.get('grpNumberParams').get('tfMinValue').value &&
			value < this.form.get('grpNumberParams').get('tfMinValue').value ?
			this.form.get('grpNumberParams').get('tfMinValue').value :
			!this.form.get('grpNumberParams').get('tfMinValue').value && value < 0 ? 0 :
			this.form.get('grpNumberParams').get('tfMaxValue').value &&
			this.form.get('grpNumberParams').get('tfMaxValue').value < value ?
			this.form.get('grpNumberParams').get('tfMaxValue').value :
			!this.form.get('grpNumberParams').get('tfMaxValue').value && 100 < value ? 100 : value;
	}
}
