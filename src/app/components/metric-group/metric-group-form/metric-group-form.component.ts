import {
	Component,
	OnInit,
	Inject,
	Output,
	EventEmitter
} from '@angular/core';
import {
	MetricGroup
} from '../../../models/metric-group.model';
import {
	Metric
} from '../../../models/metric.model';
import {
	MetricGroupCrudService
} from '../../../services/crud/metric-group-crud.service';
import {
	MetricCrudService
} from '../../../services/crud/metric-crud.service';
import {
	FormControl,
	FormGroup,
	Validators,
	FormArray,
	AbstractControl
} from '@angular/forms';
import {
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material';
import { ElementFormInput } from '../../../models/resource-form-input.interface';
import { Updateable } from '../../../services/crud/crud.service';
import { MongoloidsService } from '../../../services/mongoloids/mongoloids.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'metric-group-form',
	templateUrl: './metric-group-form.component.html',
	styleUrls: ['./metric-group-form.component.scss']
})
export class MetricGroupFormComponent implements OnInit {
	rules = MetricGroup.rules;

	initialMetrics: FormControl[] = [];

	metrics: FormControl[] = [];

	form: FormGroup;

	@Output() edited: EventEmitter<MetricGroup> = new EventEmitter();

	constructor(
		private crud: MetricGroupCrudService,
		private metricCrud: MetricCrudService,
		private mongoloids: MongoloidsService,
		public dialogRef: MatDialogRef<MetricGroupFormComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput<MetricGroup>
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxMetrics();
	}

	private initForm(): void {
		this.form = new FormGroup({
			'tfName': new FormControl(
				(this.data.resource) ? this.data.resource.name : '', [
					Validators.required
					, Validators.minLength(MetricGroup.rules.nameMinLength)
					, Validators.maxLength(MetricGroup.rules.nameMaxLength)
				]
			),
			// 'cbMandatory': new FormControl(
			// 	(this.data.resource) ? this.data.resource.isMandatory :
			// 	MetricGroup.rules.defaultIsMandatory,
			// ),
			'taDescription': new FormControl(
				(this.data.resource) ? this.data.resource.description : '',
				Validators.maxLength(MetricGroup.rules.descriptionMaxLength)
			),
			'xxMetrics': new FormArray([])
		});
	}

	private initxxMetrics() {
		const xxMetrics: FormArray = < FormArray > this.form.get('xxMetrics');
		if (this.data.resource) {
			this.data.resource.metrics.forEach(item => {
				xxMetrics.controls.push(new FormControl(item));
			});
		}

		this.metricCrud.getMany<Metric>(undefined, 'name isRequired description dataType')
			.subscribe(data => {
				xxMetrics.controls.forEach(item => {
					data = data.filter(obj => obj._id !== item.value._id);
				});
				data.forEach(item => {
					this.initialMetrics.push(new FormControl(item));
				});

				this.initialMetrics.forEach(item => this.metrics.push(item));
			});
	}

	// EVENTS

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		if (this.data.isEdit) {
			const group = this.prepareGroup();
			this.edited.emit(group);
			this.update(this.prepareBody(group));
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

		// const mandatory = this.form.get('cbMandatory');
		// mandatory.reset((this.data.resource) ? this.data.resource.isMandatory : this.rules.defaultIsMandatory);

		const desc = this.form.get('taDescription');
		desc.reset((this.data.resource) ? this.data.resource.description : '');
		desc.updateValueAndValidity();

		const xxMetrics: FormArray = < FormArray > this.form.get('xxMetrics');
		xxMetrics.controls.splice(0, xxMetrics.controls.length);
		if (this.data.resource) {
			this.data.resource.metrics.forEach(item => {
				xxMetrics.controls.push(new FormControl(item));
			});
		}
		xxMetrics.updateValueAndValidity();
		xxMetrics.markAsPristine();
		this.metrics.splice(0, this.metrics.length);
		this.initialMetrics.forEach(item => this.metrics.push(item));
	}

	/**
	 * sends insert request to server.
	 * @param group inserted metric group model obj.
	 */
	private insert(group: Updateable): void {
		this.crud.insertOne(group)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	/**
	 * sends update request to server.
	 * @param updateable
	 */
	private update(updateable: Updateable) {
		this.crud.updateOne(updateable)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	// UTIL

	/**
	 * returns new metric group model obj based on form value.
	 * @param group
	 */
	private prepareBody(group?: MetricGroup): Updateable {
		const tempMetricGroup = group || this.prepareGroup();

		const removedMetrics: string[] = [];
		if (this.data.isEdit) {
			const currentMetrics: string[] = tempMetricGroup.metrics.map(item => item._id);
			this.data.resource.metrics.forEach(metric => {
				if (!currentMetrics.includes(metric._id)) {
					removedMetrics.push(metric._id);
				}
			});
		}

		const updateable = {
			_id: tempMetricGroup._id
			, removedMetrics: this.data.isEdit ? removedMetrics : undefined
		};

		Object.keys(tempMetricGroup).forEach(key => {
			updateable[key] = tempMetricGroup[key];
		});

		return updateable;
	}

	private prepareGroup(): MetricGroup {
		const tempMetricGroup = new MetricGroup(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('tfName').value,
			// this.form.get('cbMandatory').value,
			( < FormArray > this.form.get('xxMetrics')).controls.map(item => item.value),
			this.form.get('taDescription').value,
			(this.data.isEdit) ? this.data.resource.position : undefined
		);

		return tempMetricGroup;
	}

	getNameErrorMessage() {
		const field = this.form.get('tfName');
		return (field.hasError('required')) ?
			'you must enter a group name!' :
			(field.hasError('minlength')) ?
			'too short!' : '';
	}

	addMetric(ctrl: FormControl) {
		const xxMetrics = < FormArray > this.form.get('xxMetrics');
		xxMetrics.controls.push(ctrl);
		this.metrics.splice(this.metrics.indexOf(ctrl), 1);
		this.onMetricDragSuccessful();
	}

	removeMetric(ctrl: FormControl) {
		const xxMetrics = < FormArray > this.form.get('xxMetrics');
		this.metrics.push(ctrl);
		xxMetrics.controls.splice(xxMetrics.controls.indexOf(ctrl), 1);
		this.onMetricDragSuccessful();
	}

	onMetricDragSuccessful() {
		const xxMetrics = < FormArray > this.form.get('xxMetrics');
		xxMetrics.updateValueAndValidity();

		let dirty = true;
		if (this.data.resource) {
			dirty = !this.mongoloids.sameValuesAndOrder(
				this.data.resource.metrics.map(item => item),
				xxMetrics.controls.map(item => item.value));
		}

		if (dirty) {
			xxMetrics.markAsDirty();
		} else {
			xxMetrics.markAsPristine();
		}
	}

	/**
	 *
	 */
	getxxMetricsControls(): AbstractControl[] {
		return (<FormArray>this.form.get('xxMetrics')).controls;
	}
}
