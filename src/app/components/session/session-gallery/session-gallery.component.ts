import { DatesService } from './../../../services/dates/dates.service';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { Session } from '../../../models/session.model';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatTable, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { BrowserService } from '../../../services/browser/browser.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { SessionCrudService } from '../../../services/crud/session-crud.service';
import { SessionFormComponent } from '../session-form/session-form.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-session-gallery',
	templateUrl: './session-gallery.component.html',
	styleUrls: ['./session-gallery.component.scss']
})
export class SessionGalleryComponent implements OnInit {
	data: Session[] = [];
	selectableData: Session[] = [];

	displayedColumns = ['select', 'date', 'locations', 'metric groups', 'createdAt', 'updatedAt', 'action'];
	dataSource = new MatTableDataSource<Session>(this.data);
	selection = new SelectionModel<Session>(true);

	@ViewChild('sessionTable') table: MatTable<Session>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	constructor(
		protected crud: SessionCrudService,
		public auth: AuthenticationService,
		private notification: NotificationService,
		public browser: BrowserService,
		public dates: DatesService,
		public dialog: MatDialog
	) {}

	ngOnInit() {
		this.crud.getMany<Session>().subscribe(data => {
			this.dataSource.filterPredicate = (item, filter) => {
				return true;
				// return (item.uid.indexOf(filter.trim()) > -1 ||
				// 	item.firstName.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1 ||
				// 	item.lastName.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1
				// );
			};
			this.dataSource.data.unshift(...data);
			this.selectableData = [...data.filter(item => this.dates.before(this.dates.now(), item.startDate))];
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});
	}

	renderLocationsTooltip(element: Session): string {
		return element.locations.map(loc => loc.name).join();
	}

	renderGroupsToolTip(element: Session): string {
		return element.groups.map(grp => grp.name).join();
	}

	isAllSelected(): boolean {
		return this.selection.selected.length === this.selectableData.length;
	}

	toggleAll(): void {
		this.isAllSelected() ? this.selection.clear() : this.selectableData.forEach(row => this.selection.select(row));
	}

	selectRow(row: Session): void {
		if (this.dates.before(this.dates.now(), row.startDate)) {
			if (this.selection.isSelected(row)) {
				this.selection.deselect(row);
			} else {
				this.selection.select(row);
			}
		}
	}

	highlight(rowId): void {
		this.highlightedRow = rowId;
	}

	editOnClick(event, element): void {
		this.openForm(true, element, (result) => {
			this.data[element.position - 1] = result[0];
			this.selectableData[this.selectableData.indexOf(element)] = result[0];
			this.dataSource.data = this.data = [...this.data];
			this.notification.openCustomSnackbar(`session edited successfully!`);
		});
	}

	deleteOneOnClick(event, element): void {
		this.crud.deleteOne(element).subscribe((result) => {
			this.selection.deselect(element);
			for (let i = element.position; i < this.dataSource.data.length; i++) {
				this.data[i].position -= 1;
			}
			this.data.splice(element.position - 1, 1);
			this.selectableData.splice(this.selectableData.indexOf(element), 1);
			this.dataSource.data = this.data = [...this.data];
			if (element.position === this.data.length + 1) {
				this.paginator.previousPage();
			}
			this.notification.openCustomSnackbar(`session deleted successfully!`);
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
			this.selectableData = this.selectableData.filter(item => !this.selection.selected.includes(item));
			this.selection.clear();
			setTimeout(() => {
				if (Math.floor(this.data.length / this.paginator.pageSize) < page) {
					this.dataSource.paginator.lastPage();
				}
			});
			this.notification.openCustomSnackbar(`${total} session${total > 1 ? 's' : ''} deleted successfully!`);
		});
	}

	insertOneOnClick() {
		this.openForm(false, null, (result) => {
			result[0].position = this.data.length + 1;
			this.dataSource.data = this.data = [...this.data, result[0]];
			this.selectableData.push(result[0]);
			setTimeout(() => {
				this.dataSource.paginator.lastPage();
			});
			this.notification.openCustomSnackbar(`session inserted successfully!`);
		});
	}

	private openForm(isEdit: boolean, session?: Session, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(SessionFormComponent, {
			data: {
				resource: session,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.60, 1000)}px` : `${this.browser.width()}px`
		});

		let optimismApplied = false;
		const index = this.selectableData.indexOf(session);

		dialogRef.componentInstance.edited.subscribe((tempSession: Session) => {
			this.data[session.position - 1] = tempSession;
			this.dataSource.data = this.data = [...this.data];
			this.selectableData[index] = tempSession;
			optimismApplied = true;
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (callback) {
					callback(result);
				}
			} else { // error or cancel.
				if (isEdit && optimismApplied) {
					this.data[session.position - 1] = session;
					this.dataSource.data = this.data = [...this.data];
					this.selectableData[index] = session;
					this.notification.openCustomSnackbar(`failed to update session!`);
				}
			}
		});
	}
}
