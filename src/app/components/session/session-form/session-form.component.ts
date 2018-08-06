import {
	ArrayValidators
} from './../../../validators/array.directive';
import {
	MetricGroupCrudService
} from './../../../services/crud/metric-group-crud.service';
import {
	Component,
	OnInit,
	Output,
	EventEmitter,
	Inject
} from '@angular/core';
import {
	Session
} from '../../../models/session.model';
import {
	Location
} from '../../../models/location.model';
import {
	MetricGroup
} from '../../../models/metric-group.model';
import {
	FormGroup,
	FormControl,
	Validators
} from '@angular/forms';
import {
	SessionCrudService
} from '../../../services/crud/session-crud.service';
import {
	LocationCrudService
} from '../../../services/crud/location-crud.service';
import {
	MatDialogRef,
	MAT_DIALOG_DATA
} from '@angular/material';
import {
	ElementFormInput
} from '../../../models/resource-form-input.interface';
import { Updateable } from '../../../services/crud/crud.service';
import { DatesService } from '../../../services/dates/dates.service';

interface EmbeddedLocation {
	_id: string | object;
	name: string;
	country: string;
}

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-session-form',
	templateUrl: './session-form.component.html',
	styleUrls: ['./session-form.component.scss']
})
export class SessionFormComponent implements OnInit {
	readonly rules = Session.rules;

	initialLocations: EmbeddedLocation[] = [];
	locations: EmbeddedLocation[] = [];
	chosenLocations: EmbeddedLocation[] = [];

	initialGroups: MetricGroup[] = [];
	groups: MetricGroup[] = [];
	chosenGroups: MetricGroup[] = [];

	form: FormGroup;

	@Output() edited: EventEmitter < Session > = new EventEmitter();

	constructor(
		private crud: SessionCrudService,
		private locationCrud: LocationCrudService,
		private groupCrud: MetricGroupCrudService,
		public dates: DatesService,
		public dialogRef: MatDialogRef < SessionFormComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput < Session >
	) {}

	ngOnInit(): void {
		this.initForm();
		this.initxxLocations();
		this.initxxGroups();
	}

	private initForm(): void {
		this.form = new FormGroup({
			'tfName': new FormControl(
				this.data.resource ? this.data.resource.name : '',
			),
			'taDescription': new FormControl(
				this.data.resource ? this.data.resource.description : '',
			),
			'dpStartDate': new FormControl(
				this.data.resource ? this.data.resource.startDate : '',
				Validators.required
			),
			'dpEndDate': new FormControl(
				this.data.resource ? this.data.resource.endDate : '',
				Validators.required
			),
			'xxLocations': new FormControl(
				this.data.resource ? [...this.data.resource.locations] : [],
				ArrayValidators.notEmpty()
			),
			'xxGroups': new FormControl(
				this.data.resource ? [...this.data.resource.groups] : [],
				ArrayValidators.notEmpty()
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

	private initxxGroups() {
		if (this.data.resource) {
			this.chosenGroups = [...this.data.resource.groups];
		}

		this.groupCrud.getMany<MetricGroup>()
			.subscribe(data => {
				const mapped = this.chosenGroups.map(item => item._id);
				data = data.filter(item => !mapped.includes(item._id) && item.metrics.length);
				this.groups = [...data];
				this.initialGroups = [...data];
			});
	}

	// EVENTS

	/**
	 * sends request to server in accordance to modal's edit mode.
	 * @param value ngForm value
	 */
	onSaveClick(): void {
		if (this.data.isEdit) {
			const session = this.prepareSession();
			this.edited.emit(session);
			this.update(this.prepareBody(session));
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

		const desc = this.form.get('taDescription');
		desc.reset((this.data.resource) ? this.data.resource.description : '');
		desc.updateValueAndValidity();

		const startDate = this.form.get('dpStartDate');
		startDate.reset((this.data.resource) ? this.data.resource.startDate : '');
		startDate.updateValueAndValidity();

		const endDate = this.form.get('dpEndDate');
		endDate.reset((this.data.resource) ? this.data.resource.endDate : '');
		endDate.updateValueAndValidity();

		const xxLocations = this.form.get('xxLocations');
		xxLocations.reset((this.data.resource) ? [...this.chosenLocations] : []);
		xxLocations.updateValueAndValidity();
		this.locations = [...this.initialLocations];

		const xxGroups = this.form.get('xxGroups');
		xxGroups.reset((this.data.resource) ? [...this.chosenGroups] : []);
		xxGroups.updateValueAndValidity();
		this.groups = [...this.initialGroups];
	}

	onEraseClick(event, control): void {
		event.stopPropagation();
		control.setValue('');
		control.markAsDirty();
		control.updateValueAndValidity();
	}

	/**
	 * sends insert request to server.
	 * @param group inserted metric group model obj.
	 */
	private insert(session: Updateable): void {
		this.crud.insertOne(session)
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
 	 * returns new session model obj based on form value.
 	 * @param group
 	 */
	private prepareBody(session?: Session): Updateable {
		const tempSession = session || this.prepareSession();

		// const removedLocations: string[] = [];
		// if (this.data.isEdit) {
		// 	const currentLocations: string[] = tempSession.locations.map(item => item._id);
		// 	this.data.resource.locations.forEach(location => {
		// 		if (!currentLocations.includes(location._id)) {
		// 			removedLocations.push(location._id);
		// 		}
		// 	});
		// }

		const removedGroups: string[] = [];
		const removedMetrics: string[] = [];
		if (this.data.isEdit) {
			const currentGroups: string[] = tempSession.groups.map(item => item._id);
			this.data.resource.groups.forEach(group => {
				if (!currentGroups.includes(group._id)) {
					removedGroups.push(group._id);

					group.metrics.forEach(metric => {
						if (!removedMetrics.includes(metric._id)) {
							removedMetrics.push(metric._id);
						}
					});
				}
			});
		}

		const updateable = {
			_id: tempSession._id,
			// removedLocations: this.data.isEdit ? removedLocations : undefined,
			removedGroups: this.data.isEdit ? removedGroups : undefined,
			removedMetrics: this.data.isEdit ? removedMetrics : undefined
		};

		Object.keys(tempSession).forEach(key => {
			updateable[key] = tempSession[key];
		});

		return updateable;
	}

	private prepareSession(): Session {
		const tempSession = new Session(
			(this.data.isEdit) ? this.data.resource._id : undefined,
			this.form.get('dpStartDate').value,
			this.form.get('dpEndDate').value,
			this.form.get('xxLocations').value,
			this.form.get('xxGroups').value,
			this.form.get('tfName').value,
			this.form.get('taDescription').value,
			(this.data.isEdit) ? this.data.resource.position : undefined
		);

		return tempSession;
	}

	getControl(controlName: string, groupName?: string): any {
		return this.form ?
			(groupName ?
				this.form.get(groupName).get(controlName) :
				this.form.get(controlName)) :
			null;
	}

	hasValue(value): boolean {
		return !['', null, undefined].includes(value);
	}

	getNameErrorMessage(): string {
		const field = this.form.get('tfName');
		return (field.hasError('required')) ?
			'you must enter a session name!' :
			(field.hasError('minlength')) ?
			'too short!' : '';
	}
}
