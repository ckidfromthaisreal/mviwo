import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	Inject
} from '@angular/core';
import {
	Patient
} from '../../../models/patient.model';
import {
	FormGroup,
	FormControl,
	Validators
} from '@angular/forms';
import {
	LocationCrudService
} from '../../../services/crud/location-crud.service';
import {
	PatientCrudService
} from '../../../services/crud/patient-crud.service';
import {
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material';
import {
	ElementFormInput
} from '../../../models/resource-form-input.interface';
import {
	Location
} from '../../../models/location.model';
import {
	Updateable
} from '../../../services/crud/crud.service';
import { StringsService } from '../../../services/strings/strings.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-location-form',
	templateUrl: './location-form.component.html',
	styleUrls: ['./location-form.component.scss']
})
export class LocationFormComponent implements OnInit {
	readonly rules = Location.rules;

	initialPatients: Patient[] = [];
	patients: Patient[] = [];
	chosenPatients: Patient[] = [];

	form: FormGroup;

	@Output() edited: EventEmitter < Location > = new EventEmitter();

	constructor(
		private crud: LocationCrudService,
		private patientCrud: PatientCrudService,
		private strings: StringsService,
		// public dates: DatesService,
		// public browser: BrowserService,
		public dialogRef: MatDialogRef < LocationFormComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput < Location >
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxPatients();
	}

	private initForm(): void {
		this.form = new FormGroup({
			'tfName': new FormControl(
				this.data.resource ? this.data.resource.name : '',
				Validators.required
			),
			'tfCountry': new FormControl(
				this.data.resource ? this.data.resource.country : '',
				Validators.required
			),
			'tfAddress': new FormControl(
				this.data.resource ? this.data.resource.address : '',
			),
			'xxPatients': new FormControl(
				this.data.resource ? [...this.data.resource.patients] : []
			)
		});
	}

	private initxxPatients() {
		if (this.data.resource) {
			this.chosenPatients = [...this.data.resource.patients];
		}

		this.patientCrud.getMany < Patient > (undefined, 'uid firstName lastName isFemale dateOfBirth')
			.subscribe(data => {
				const mapped = this.chosenPatients.map(item => item._id);
				data = data.filter(item => !mapped.includes(item._id));
				this.patients = [...data];
				this.initialPatients = [...data];
			});
	}

	// EVENTS

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		if (this.data.isEdit) {
			const location = this.prepareLocation();
			this.edited.emit(location);
			this.update(this.prepareBody(location));
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

		const country = this.form.get('tfCountry');
		country.reset((this.data.resource) ? this.data.resource.country : '');
		country.updateValueAndValidity();

		const address = this.form.get('tfAddress');
		address.reset((this.data.resource) ? this.data.resource.address : '');
		address.updateValueAndValidity();

		const xxPatients = this.form.get('xxPatients');
		xxPatients.reset((this.data.resource) ? [...this.chosenPatients] : []);
		xxPatients.updateValueAndValidity();
		this.patients = [...this.initialPatients];
	}

	/**
	 * sends insert request to server.
	 * @param group inserted location model obj.
	 */
	private insert(location: Updateable): void {
		this.crud.insertOne(location)
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
	 * returns new location model obj based on form value.
	 * @param group
	 */
	private prepareBody(location?: Location): Updateable {
		const tempLocation = location || this.prepareLocation();

		const removedPatients: string[] = [];
		if (this.data.isEdit) {
			const currentPatients: string[] = tempLocation.patients.map(item => item._id);
			this.data.resource.patients.forEach(patient => {
				if (!currentPatients.includes(patient._id)) {
					removedPatients.push(patient._id);
				}
			});
		}

		const updateable = {
			_id: tempLocation._id,
			removedPatients: this.data.isEdit ? removedPatients : undefined
		};

		Object.keys(tempLocation).forEach(key => {
			updateable[key] = tempLocation[key];
		});

		return updateable;
	}

	private prepareLocation(): Location {
		const tempLocation = new Location(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('tfName').value,
			this.form.get('tfCountry').value,
			this.form.get('tfAddress').value,
			this.form.get('xxPatients').value,
			(this.data.isEdit) ? this.data.resource.position : undefined
		);

		return tempLocation;
	}

	getNameErrorMessage(fieldName: string): string {
		const field = this.form.get(fieldName);
		return (field.hasError('required')) ?
			`you must enter a ${this.strings.dePascal(fieldName.trim().slice(2))}!` :
			(field.hasError('minlength')) ?
			'too short!' : '';
	}
}
