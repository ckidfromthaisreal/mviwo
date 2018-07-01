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
	MAT_DIALOG_DATA,
	SELECT_ITEM_HEIGHT_EM
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
	readonly rules = MetricGroup.rules;

	initialMetrics: Metric[] = [];
	metrics: Metric[] = [];
	chosenMetrics: Metric[] = [];

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
			'xxMetrics': new FormControl(
				this.data.resource ? [...this.data.resource.metrics] : []
			)
		});
	}

	private initxxMetrics() {
		if (this.data.resource) {
			this.chosenMetrics = [...this.data.resource.metrics];
		}

		this.metricCrud.getMany<Metric>(undefined, 'name isRequired description dataType')
			.subscribe(data => {
				const mapped = this.chosenMetrics.map(item => item._id);
				data = data.filter(item => !mapped.includes(item._id));
				this.metrics = [...data];
				this.initialMetrics = [...data];
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

		const xxMetrics = this.form.get('xxMetrics');
		xxMetrics.reset((this.data.resource) ? [...this.chosenMetrics] : []);
		xxMetrics.updateValueAndValidity();
		this.metrics = [...this.initialMetrics];
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
			this.form.get('xxMetrics').value,
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
}
