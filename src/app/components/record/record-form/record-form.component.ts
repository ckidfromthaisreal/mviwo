import {
	Component,
	OnInit,
	Inject
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ElementFormInput } from '../../../models/resource-form-input.interface';
import { Record } from '../../../models/record.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-record-form',
	templateUrl: './record-form.component.html',
	styleUrls: ['./record-form.component.scss']
})
export class RecordFormComponent implements OnInit {
	constructor(
		protected dialogRef: MatDialogRef<RecordFormComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ElementFormInput<Record>
	) {}

	ngOnInit(): void {

	}

	onSaveClick(): void {

	}

	onResetClick(): void {

	}

	onCancelClick(): void {
		this.dialogRef.close();
	}
}
