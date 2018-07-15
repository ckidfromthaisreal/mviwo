import { ArraysService } from './../../../services/arrays/arrays.service';
import { DatesService } from './../../../services/dates/dates.service';
import { Location } from './../../../models/location.model';
import { RecordCrudService } from './../../../services/crud/record-crud.service';
import { SessionCrudService } from './../../../services/crud/session-crud.service';
import {
	Component,
	OnInit,
	Inject,
	ViewChild,
	OnDestroy,
	AfterViewInit,
	EventEmitter,
	Output
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTabGroup, MatSelect } from '@angular/material';
import { ElementFormInput } from '../../../models/resource-form-input.interface';
import { Record } from '../../../models/record.model';
import { Session } from '../../../models/session.model';
import { Patient } from '../../../models/patient.model';
import { ReplaySubject, Subject } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntil, take } from 'rxjs/operators';
import { Updateable } from '../../../services/crud/crud.service';
import { ValueTransformer } from '@angular/compiler/src/util';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-record-form',
	templateUrl: './record-form.component.html',
	styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent implements OnInit, AfterViewInit, OnDestroy {
	// sessions: Session[] = [];

	@ViewChild('form') form: FormGroup;
	@ViewChild('tabs') tabs: MatTabGroup;

	patients: Patient[] = [];
	filteredPatients: ReplaySubject<Patient[]> = new ReplaySubject<Patient[]>(1);
	patientFilterCtrl: FormControl = new FormControl();
	@ViewChild('patientSelect') patientSelect: MatSelect;

	@Output() edited: EventEmitter<Record> = new EventEmitter();

	constructor(
		private crud: RecordCrudService,
		// private sessionCrud: SessionCrudService,
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

		// this.form.valueChanges.subscribe(() => {
		// 	console.log(this.form.value);
		// });

		// const today = new Date();
		// this.sessionCrud.getMany<Session>(
			// 	{ startDate: { $lte: today }, endDate: { $gte: today } },
			// 	undefined,
			// 	[
				// 		{ path: 'locations._id', fields: 'patients' },
				// 		{ path: 'groups.metrics._id', fields: 'defaultValue stringParams numberParams enumParams dateParams' }
				// 	]
				// ).subscribe(data => {
					// 	this.sessions = data;
					// });
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

	onResetClick(form): void {
		this.tabs.selectedIndex = 0;
		form.resetForm();
	}

	onCancelClick(): void {
		this.dialogRef.close();
	}

	onEraseClick(event, control): void {
		event.stopPropagation();

		control.setValue('');
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
		}

		this.filterPatients();
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
		value.results = Object.keys(value.results).map(key => value.results[key]).filter(result => ![undefined, null, ''].includes(result.value));
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
}
