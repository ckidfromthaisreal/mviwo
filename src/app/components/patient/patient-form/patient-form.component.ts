import { BrowserService } from './../../../services/browser/browser.service';
import { DatesService } from './../../../services/dates/dates.service';
import {
	LocationCrudService
} from './../../../services/crud/location-crud.service';
import {
	PatientCrudService
} from './../../../services/crud/patient-crud.service';
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
	Location
} from '../../../models/location.model';
import {
	FormGroup,
	FormControl,
	Validators
} from '@angular/forms';
import {
	ElementFormInput
} from '../../../models/resource-form-input.interface';
import {
	MAT_DIALOG_DATA,
	MatDialogRef
} from '@angular/material';
import { Updateable } from '../../../services/crud/crud.service';
// import 'uid-safe';
import { v4 as uuid } from 'uuid';
import { StringsService } from '../../../services/strings/strings.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-patient-form',
	templateUrl: './patient-form.component.html',
	styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
	readonly rules = Patient.rules;

	genders = [
		{
			name: 'Male',
			value: false
		},
		{
			name: 'Female',
			value: true
		}
	];

	initialLocations: Location[] = [];
	locations: Location[] = [];
	chosenLocations: Location[] = [];

	form: FormGroup;

	@Output() edited: EventEmitter < Patient > = new EventEmitter();

	constructor(
		private crud: PatientCrudService,
		private locationCrud: LocationCrudService,
		private strings: StringsService,
		public dates: DatesService,
		public browser: BrowserService,
		public dialogRef: MatDialogRef < PatientFormComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput < Patient >
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxLocations();
	}

	private initForm(): void {
		this.form = new FormGroup({
			'tfUid': new FormControl(
				(this.data.resource) ? this.data.resource.uid : this.toBase64(uuid().substring(0, 8)),
				Validators.required
			),
			'tfFirstName': new FormControl(
				this.data.resource ? this.data.resource.firstName : '',
				Validators.required
			),
			'tfMiddleName': new FormControl(
				this.data.resource ? this.data.resource.middleName : ''
			),
			'tfLastName': new FormControl(
				this.data.resource ? this.data.resource.lastName : '',
				Validators.required
			),
			'tfFatherName': new FormControl(
				this.data.resource ? this.data.resource.fatherName : ''
			),
			'tfMotherName': new FormControl(
				this.data.resource ? this.data.resource.motherName : ''
			),
			'rdGender': new FormControl(
				this.data.resource ? this.data.resource.isFemale : false
			),
			'dpDateOfBirth': new FormControl(
				this.data.resource ? this.data.resource.dateOfBirth : ''
			),
			'tfPlaceOfBirth': new FormControl(
				this.data.resource ? this.data.resource.placeOfBirth : ''
			),
			'tfJob': new FormControl(
				this.data.resource ? this.data.resource.job : ''
			),
			'xxLocations': new FormControl(
				this.data.resource ? [...this.data.resource.locations] : []
			)
		});
	}

	private initxxLocations() {
		if (this.data.resource) {
			this.chosenLocations = [...this.data.resource.locations];
		}

		this.locationCrud.getMany<Location>(undefined, 'name country')
			.subscribe(data => {
				const mapped = this.chosenLocations.map(item => item._id);
				data = data.filter(item => !mapped.includes(item._id));
				this.locations = [...data];
				this.initialLocations = [...data];
			});
	}

	// EVENTS

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		if (this.data.isEdit) {
			const patient = this.preparePatient();
			this.edited.emit(patient);
			this.update(this.prepareBody(patient));
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
		const uidv = this.form.get('tfUid');
		uidv.reset((this.data.resource) ? this.data.resource.uid : uidv.value);
		uidv.updateValueAndValidity();

		const fName = this.form.get('tfFirstName');
		fName.reset((this.data.resource) ? this.data.resource.firstName : '');
		fName.updateValueAndValidity();

		const mName = this.form.get('tfMiddleName');
		mName.reset((this.data.resource) ? this.data.resource.middleName : '');
		mName.updateValueAndValidity();

		const lName = this.form.get('tfLastName');
		lName.reset((this.data.resource) ? this.data.resource.lastName : '');
		lName.updateValueAndValidity();

		const fatherName = this.form.get('tfFatherName');
		fatherName.reset((this.data.resource) ? this.data.resource.fatherName : '');
		fatherName.updateValueAndValidity();

		const motherName = this.form.get('tfMotherName');
		motherName.reset((this.data.resource) ? this.data.resource.motherName : '');
		motherName.updateValueAndValidity();

		const gender = this.form.get('rdGender');
		gender.reset((this.data.resource) ? this.data.resource.isFemale : false);
		gender.updateValueAndValidity();

		const dateOfBirth = this.form.get('dpDateOfBirth');
		dateOfBirth.reset((this.data.resource) ? this.data.resource.dateOfBirth : '');
		dateOfBirth.updateValueAndValidity();

		const placeOfBirth = this.form.get('tfPlaceOfBirth');
		placeOfBirth.reset((this.data.resource) ? this.data.resource.placeOfBirth : '');
		placeOfBirth.updateValueAndValidity();

		const job = this.form.get('tfJob');
		job.reset((this.data.resource) ? this.data.resource.job : '');
		job.updateValueAndValidity();

		const xxLocations = this.form.get('xxLocations');
		xxLocations.reset((this.data.resource) ? [...this.chosenLocations] : []);
		xxLocations.updateValueAndValidity();
		this.locations = [...this.initialLocations];
	}

	/**
	 * sends insert request to server.
	 * @param group inserted metric group model obj.
	 */
	private insert(patient: Updateable): void {
		this.crud.insertOne(patient)
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
	private prepareBody(patient?: Patient): Updateable {
		const tempPatient = patient || this.preparePatient();

		const removedLocations: string[] = [];
		if (this.data.isEdit) {
			const currentLocations: string[] = tempPatient.locations.map(item => item._id);
			this.data.resource.locations.forEach(location => {
				if (!currentLocations.includes(location._id)) {
					removedLocations.push(location._id);
				}
			});
		}

		const updateable = {
			_id: tempPatient._id,
			removedLocations: this.data.isEdit ? removedLocations : undefined
		};

		Object.keys(tempPatient).forEach(key => {
			updateable[key] = tempPatient[key];
		});

		return updateable;
	}

	private preparePatient(): Patient {
		const tempMetricGroup = new Patient(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('tfUid').value,
			this.form.get('tfFirstName').value,
			this.form.get('tfLastName').value,
			this.form.get('rdGender').value,
			this.form.get('tfMiddleName').value,
			this.form.get('tfFatherName').value,
			this.form.get('tfMotherName').value,
			this.form.get('dpDateOfBirth').value,
			this.form.get('tfPlaceOfBirth').value,
			this.form.get('tfJob').value,
			this.form.get('xxLocations').value,
			(this.data.isEdit) ? this.data.resource.position : undefined
		);

		return tempMetricGroup;
	}

	getNameErrorMessage(fieldName: string): string {
		const field = this.form.get(fieldName);
		return (field.hasError('required')) ?
			`you must enter a ${this.strings.dePascal(fieldName.trim().slice(2))}!` :
			(field.hasError('minlength')) ?
			'too short!' : '';
	}

	private toBase64(uid: string): string {
		for (let i = 0; i < uid.length; i++) {
			const char = uid.charAt(i);
			if (char[0].match(/[A-z]{1}/i)) {
				// tslint:disable-next-line:no-bitwise
				uid = uid.substring(0, i) + (~(Math.random() * 10) % 2 === 0 ?
					uid[i].toLowerCase() : uid[i].toUpperCase()) + uid.substring(i + 1, uid.length);
			}
		}

		return uid;
	}
}
