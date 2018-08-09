import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatSort,
	MatPaginator,
	MatDialog} from '@angular/material';
import { Location } from './../../../models/location.model';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { LocationCrudService } from '../../../services/crud/location-crud.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { BrowserService } from '../../../services/browser/browser.service';
import { LocationFormComponent } from '../location-form/location-form.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-location-gallery',
	templateUrl: './location-gallery.component.html',
	styleUrls: ['./location-gallery.component.scss']
})
export class LocationGalleryComponent implements OnInit {
	data: Location[] = [];

	displayedColumns = ['select', 'name', 'country', 'address', 'patients', 'action'];
	dataSource = new MatTableDataSource<Location>(this.data);
	selection = new SelectionModel<Location>(true);

	@ViewChild('locationTable') table: MatTable<Location>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	constructor(
		protected crud: LocationCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, public browser: BrowserService
		, public dialog: MatDialog
	) {}

	ngOnInit() {
		this.crud.getMany<Location>(undefined, undefined, undefined, undefined, true).subscribe(data => {
			this.dataSource.filterPredicate = (item, filter) => {
				return (item.name.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1 ||
					item.country.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1 ||
					item.address.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1
				);
			};
			this.dataSource.data.unshift(...data);
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});
	}

	renderPatientsTooltip(element: Location): string {
		return element.patients.map(pat => pat.firstName + ' ' + pat.lastName).join();
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
			this.notification.openCustomSnackbar(`location edited successfully!`);

			localStorage.setItem(`mviwo-locations`, JSON.stringify(this.data));
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
			this.notification.openCustomSnackbar(`location deleted successfully!`);

			localStorage.setItem(`mviwo-locations`, JSON.stringify(this.data));
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
			this.notification.openCustomSnackbar(`${total} location${total > 1 ? 's' : ''} deleted successfully!`);

			localStorage.setItem(`mviwo-locations`, JSON.stringify(this.data));
		});
	}

	insertOneOnClick() {
		this.openForm(false, null, (result) => {
			result[0].position = this.data.length + 1;
			this.dataSource.data = this.data = [...this.data, result[0]];
			setTimeout(() => {
				this.dataSource.paginator.lastPage();
			});
			this.notification.openCustomSnackbar(`location inserted successfully!`);

			localStorage.setItem(`mviwo-locations`, JSON.stringify(this.data));
		});
	}

	private openForm(isEdit: boolean, location?: Location, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(LocationFormComponent, {
			data: {
				resource: location,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.60, 1000)}px` : `${this.browser.width()}px`
		});

		let optimismApplied = false;

		dialogRef.componentInstance.edited.subscribe((tempLocation: Location) => {
			this.data[location.position - 1] = tempLocation;
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
					this.data[location.position - 1] = location;
					this.dataSource.data = this.data = [...this.data];
					this.notification.openCustomSnackbar(`failed to update location!`);
				}
			}
		});
	}
}
