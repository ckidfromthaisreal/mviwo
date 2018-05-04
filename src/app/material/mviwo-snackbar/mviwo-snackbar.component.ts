import {
	Component,
	OnInit,
	Inject
} from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-snackbar',
	templateUrl: './mviwo-snackbar.component.html',
	styleUrls: ['./mviwo-snackbar.component.scss']
})
export class MviwoSnackbarComponent implements OnInit {
	constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}

	ngOnInit() {}
}
