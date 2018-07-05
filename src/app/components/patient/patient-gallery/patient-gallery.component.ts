import { BrowserService } from './../../../services/browser/browser.service';
import { AuthenticationService } from './../../../services/authentication/authentication.service';
import { PatientCrudService } from './../../../services/crud/patient-crud.service';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { Patient } from '../../../models/patient.model';
import { MatTableDataSource, MatTable, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationService } from '../../../services/notification/notification.service';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { faVenus, faMars } from '@fortawesome/free-solid-svg-icons';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-patient-gallery',
	templateUrl: './patient-gallery.component.html',
	styleUrls: ['./patient-gallery.component.scss']
})
export class PatientGalleryComponent implements OnInit {
	data: Patient[] = [];

	displayedColumns = ['select', 'uid', 'name', 'gender', 'age', 'locations', 'action'];
	dataSource = new MatTableDataSource<Patient>(this.data);
	selection = new SelectionModel<Patient>(true);

	@ViewChild('metricGroupTable') table: MatTable<Patient>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	faVenus = faVenus;
	faMars = faMars;

	constructor(
		protected crud: PatientCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, public browser: BrowserService
		, public dialog: MatDialog
	) {}

	ngOnInit() {
		this.crud.getMany<Patient>().subscribe(data => {
			this.dataSource.filterPredicate = (item, filter) => {
				return (item.uid.indexOf(filter.trim()) > -1 ||
					item.firstName.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1 ||
					item.lastName.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1
				);
			};
			this.dataSource.data.unshift(...data);
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});
	}

	renderLocationsTooltip(element: Patient): string {
		return element.locations.map(loc => loc.name).join();
	}

	isAllSelected() {
		return this.selection.selected.length === this.dataSource.data.length;
	}

	toggleAll() {
		this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
	}

	highlight(rowId): void {
		this.highlightedRow = rowId;
	}

	editOnClick(event, element): void {
		this.openForm(true, element, (result) => {
			this.data[element.position - 1] = result[0];
			this.dataSource.data = this.data = [...this.data];
			this.notification.openCustomSnackbar(`patient edited successfully!`);
		});
	}

	deleteOneOnClick(event, element): void {
		this.crud.deleteOne(element).subscribe((result) => {
			this.selection.deselect(element);
			for (let i = element.position; i < this.dataSource.data.length; i++) {
				this.data[i].position -= 1;
			}
			this.data.splice(element.position - 1, 1);
			this.dataSource.data = this.data = [...this.data];
			if (element.position === this.data.length + 1) {
				this.paginator.previousPage();
			}
			this.notification.openCustomSnackbar(`patient deleted successfully!`);
		});
	}

	deleteManyOnClick() {
		const total = this.selection.selected.length;
		const page = this.paginator.pageIndex;
		this.crud.deleteMany(this.selection.selected).subscribe((result) => {
			this.dataSource.data = this.data = this.data.filter(item => !this.selection.selected.includes(item));
			for (let i = 0; i < this.data.length; i++) {
				this.data[i].position = i + 1;
			}
			this.selection.clear();
			setTimeout(() => {
				if (Math.floor(this.data.length / this.paginator.pageSize) < page) {
					this.dataSource.paginator.lastPage();
				}
			});
			this.notification.openCustomSnackbar(`${total} patient${total > 1 ? 's' : ''} deleted successfully!`);
		});
	}

	insertOneOnClick() {
		this.openForm(false, null, (result) => {
			result[0].position = this.data.length + 1;
			this.dataSource.data = this.data = [...this.data, result[0]];
			setTimeout(() => {
				this.dataSource.paginator.lastPage();
			});
			this.notification.openCustomSnackbar(`patient inserted successfully!`);
		});
	}

	private openForm(isEdit: boolean, patient?: Patient, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(PatientFormComponent, {
			data: {
				resource: patient,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.60, 1000)}px` : `${this.browser.width()}px`
		});

		let optimismApplied = false;

		dialogRef.componentInstance.edited.subscribe((tempPatient: Patient) => {
			this.data[patient.position - 1] = tempPatient;
			this.dataSource.data = this.data = [...this.data];
			optimismApplied = true;
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (callback) {
					callback(result);
				}
			} else { // error or cancel.
				if (isEdit && optimismApplied) {
					this.data[patient.position - 1] = patient;
					this.dataSource.data = this.data = [...this.data];
					this.notification.openCustomSnackbar(`failed to update patient!`);
				}
			}
		});
	}

	showLocations(patient: Patient): void {
		console.log(JSON.stringify(patient.locations));
	}
}
