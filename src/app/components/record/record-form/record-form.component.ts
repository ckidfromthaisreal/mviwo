import { ArraysService } from './../../../services/arrays/arrays.service';
import { DatesService } from './../../../services/dates/dates.service';
import { RecordCrudService } from './../../../services/crud/record-crud.service';
import {
	Component,
	OnInit,
	Inject,
	ViewChild,
	OnDestroy,
	AfterViewInit,
	EventEmitter,
	Output,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTabGroup, MatSelect, MatCheckbox } from '@angular/material';
import { ElementFormInput } from '../../../models/resource-form-input.interface';
import { Record } from '../../../models/record.model';
import { Session } from '../../../models/session.model';
import { Patient } from '../../../models/patient.model';
import { ReplaySubject, Subject } from 'rxjs';
import { FormControl, NgModel, NgForm } from '@angular/forms';
import { takeUntil, take } from 'rxjs/operators';
import { Updateable } from '../../../services/crud/crud.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-record-form',
	templateUrl: './record-form.component.html',
	styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent implements OnInit, AfterViewInit, OnDestroy {
	// session = this.data.isEdit ? this.data.resource.sessions.find(session => session._id === this.data.resource.record.session) : undefined;
	session;
	patient;

	// @ViewChild('form') form: FormGroup;
	@ViewChild('tabs') tabs: MatTabGroup;

	patients: Patient[] = [];
	filteredPatients: ReplaySubject<Patient[]> = new ReplaySubject<Patient[]>(1);
	patientFilterCtrl: FormControl = new FormControl();
	@ViewChild('patientSelect') patientSelect: MatSelect;
	@ViewChild('sessionSelect') sessionSelect: MatSelect;

	@Output() edited: EventEmitter<Record> = new EventEmitter();

	constructor(
		private crud: RecordCrudService,
		protected dates: DatesService,
		protected arrays: ArraysService,
		protected dialogRef: MatDialogRef<RecordFormComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput<{ record: Record, sessions: Session[] }>
	) {}

	private _onDestroy = new Subject<void>();

	ngOnInit(): void {
		this.filteredPatients.next(this.patients.slice());

		this.patientFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
			this.filterPatients();
		});

		if (this.data.isEdit) {
			this.session = this.data.resource.sessions.find(session => session._id === this.data.resource.record.session);
			this.patient = this.data.resource.record.patient;
			this.onSessionSelect(this.session);
		}
	}

	ngAfterViewInit(): void {
		this.setInitialPatient();
	}

	ngOnDestroy(): void {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	onSaveClick(value: any): void {
		if (this.data.isEdit) {
			const record = this.prepareRecord(value);
			this.edited.emit(record);
			this.update(record);
		} else {
			this.insert(this.prepareRecord(value));
		}
	}

	onResetClick(form: NgForm): void {
		if ((!this.session || (form.controls.session.value &&
			form.controls.session.value._id !== this.session._id)) && this.tabs.selectedIndex !== 0) {
			this.tabs.selectedIndex = 0;
		}


		if (this.session) {
			form.resetForm({
				session: this.session,
				patient: this.patient
			});
			this.onSessionSelect(this.session);

			let len = 0;
			this.session.groups.forEach((grp, i) => {
				grp.metrics.forEach((met, j) => {
					const result = form.controls.results.get(`${len + j}`);

					const group = result.get('group');
					group.get('_id').setValue(grp._id);
					group.get('name').setValue(grp.name);

					const metric = result.get('metric');
					metric.get('_id').setValue(met._id);
					metric.get('name').setValue(met.name);

					const value = result.get('value');
					value.reset(this.data.resource.record.results[len + j].value);
					value.updateValueAndValidity();
				});

				len += grp.metrics.length;
			});
		} else {
			form.resetForm();
		}
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}

	onEraseClick(event, control): void {
		event.stopPropagation();

		control.setValue('');
		control.markAsDirty();
		control.updateValueAndValidity();
	}

	onSessionSelect(session: Session) {
		this.patients = [];

		if (session) {
			session.locations.forEach(loc => {
				loc._id['patients'].forEach(pat => {
					if (!this.patients.includes(pat)) {
						this.patients.push(pat);
					}
				});
			});

			this.filterPatients();
		}
	}

	onSliderCheckboxClick(checkbox: MatCheckbox, slider: NgModel, form: NgForm, metric, i: number) {
		slider.control.setValue(!checkbox.checked ? null : this.data.isEdit && form.value.session._id === this.session._id ?
			this.data.resource.record.results[i - 1].value : metric._id.defaultValue);

		if ((!this.data.isEdit && ![undefined, null, ''].includes(slider.value)) ||
			(this.data.isEdit && form.value.session._id === this.session._id && this.data.resource.record.results[i - 1].value !== slider.value)) {
				slider.control.markAsDirty();
				form.control.markAsDirty();
		} else {
			slider.control.markAsPristine();
		}

		slider.control.updateValueAndValidity();
	}

	/**
	 * sends insert request to server.
	 * @param group inserted metric group model obj.
	 */
	private insert(record: Updateable): void {
		this.crud.insertOne<Record>(record)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	/**
	 * sends update request to server.
 	 * @param updateable
 	 */
	private update(updateable: Updateable) {
		this.crud.updateOne<Record>(updateable)
			.subscribe(response => {
				this.dialogRef.close(response);
			});
	}

	private prepareRecord(value): Record {
		value.results = Object.keys(value.results).map(key => value.results[key]);
		value.session = value.session._id;

		if (this.data.resource.record) {
			value._id = this.data.resource.record._id;
			value.position = this.data.resource.record.position;
		}

		return value;
	}

	private setInitialPatient(): void {
		this.filteredPatients.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() => {
			this.patientSelect.compareWith = (a: Patient, b: Patient) => a && b && a.uid === b.uid;
		});
	}

	private filterPatients(): void {
		if (!this.patients) {
			return ;
		}

		let search = this.patientFilterCtrl.value;
		if (!search) {
			return this.filteredPatients.next(this.patients.slice());
		}

		search = search.toLowerCase();

		this.filteredPatients.next(
			this.patients.filter(patient => {
				return patient.uid.toLowerCase().indexOf(search) > -1 ||
					patient.firstName.toLowerCase().indexOf(search) > -1 ||
					patient.lastName.toLowerCase().indexOf(search) > -1;
			})
		);
	}

	renderLocations(session: Session): string {
		return session.locations.map(loc => loc.name).join(', ');
	}

	printFormValue(value) {
		console.log(value);
	}

	getPreviousLengths(arr, i): number {
		return this.arrays.aggregateSubarrayLengths(arr, (grp) => grp.metrics, i);
	}

	sessionCompare(a, b): boolean {
		if (!a || !b) {
			return false;
		}

		const aId = a._id || a;
		const bId = b._id || b;
		return aId === bId;
	}

	patientCompare(a, b): boolean {
		if (!a || !b) {
			return false;
		}

		return a.uid === b.uid && a._id === b._id;
	}

	fixNumberInput(metric, value) {
		return typeof value === 'undefined' ? '' : metric._id.numberParams.minValue &&
			value < metric._id.numberParams.minValue ? metric._id.numberParams.minValue :
			!metric._id.numberParams.minValue && value < 0 ? 0 :
			metric._id.numberParams.maxValue && metric._id.numberParams.maxValue < value ?
			metric._id.numberParams.maxValue : !metric._id.numberParams.maxValue && 100 < value ? 100 : value;
	}

	isSessionSelectDisabled(): boolean {
		return !this.data.resource || !this.data.resource.sessions || !this.data.resource.sessions.length;
	}

	sessionSelectOptions() {
		return !this.data.isEdit ? this.data.resource.sessions : [this.session];
	}
}
