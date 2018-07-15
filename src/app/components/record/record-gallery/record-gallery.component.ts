import { DatesService } from './../../../services/dates/dates.service';
import { SessionCrudService } from './../../../services/crud/session-crud.service';
import { BrowserService } from './../../../services/browser/browser.service';
import { NotificationService } from './../../../services/notification/notification.service';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { Record } from '../../../models/record.model';
import { MatTableDataSource, MatTable, MatSort, MatPaginator, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { RecordCrudService } from '../../../services/crud/record-crud.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { RecordFormComponent } from '../record-form/record-form.component';
import { Session } from '../../../models/session.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-record-gallery',
	templateUrl: './record-gallery.component.html',
	styleUrls: ['./record-gallery.component.scss']
})
export class RecordGalleryComponent implements OnInit {
	data: Record[] = [];
	sessions: Session[] = [];
	// selectableData: Record[] = [];

	sessionsFetchAttempted = false;

	displayedColumns = ['select', 'patient', 'session', 'results', 'createdAt', 'updatedAt', 'action'];
	dataSource = new MatTableDataSource<Record>(this.data);
	selection = new SelectionModel<Record>(true);

	@ViewChild('recordTable') table: MatTable<Record>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	constructor(
		private crud: RecordCrudService
		, private sessionCrud: SessionCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, protected browser: BrowserService
		// , private dates: DatesService
		, public dialog: MatDialog
	) {}

	ngOnInit(): void {
		this.crud.getMany<Record>().subscribe(data => {
			this.dataSource.filterPredicate = (item, filter) => {
				// return (item.name.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1);
				return true;
			};
			this.dataSource.data.unshift(...data);
			// this.selectableData = data.filter(metric => [undefined, null, 0].includes(metric.sessions));
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});

		const today = new Date();
		this.sessionCrud.getMany<Session>(
			{ startDate: { $lte: today }, endDate: { $gte: today } },
			undefined,
			[
				{ path: 'locations._id', fields: 'patients' },
				{ path: 'groups.metrics._id', fields: 'defaultValue stringParams numberParams enumParams dateParams' }
			]
		).subscribe(data => {
			this.sessions = data;
			this.sessionsFetchAttempted = true;
		});
	}

	isAllSelected(): boolean {
		// return this.selection.selected.length === this.selectableData.length;
		return this.selection.selected.length === this.dataSource.data.length;
	}

	toggleAll(): void {
		// this.isAllSelected() ? this.selection.clear() : this.selectableData.forEach(row => this.selection.select(row));
		this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
	}

	highlight(rowId): void {
		this.highlightedRow = rowId;
	}

	editOnClick(event, element): void {
		this.openForm(true, { record: element, sessions: this.sessions }, (result) => {
			this.data[element.position - 1] = result[0];

			// const ind = this.selectableData.indexOf(element);
			// if (ind > -1) {
			// 	this.selectableData[ind] = result[0];
			// }

			this.dataSource.data = this.data = [...this.data];
			this.notification.openCustomSnackbar(`record edited successfully!`);
		});
	}

	deleteOneOnClick(event, element): void {
		this.crud.deleteOne(element).subscribe((result) => {
			const page = this.paginator.pageIndex;

			// const ind = this.selectableData.indexOf(element);
			// if (ind > -1) {
			// 	this.selectableData.splice(ind, 1);
			// }

			this.selection.deselect(element);
			for (let i = element.position; i < this.dataSource.data.length; i++) {
				this.data[i].position -= 1;
			}
			this.data.splice(element.position - 1, 1);
			this.dataSource.data = this.data = [...this.data];
			setTimeout(() => {
				if (Math.ceil(this.data.length / this.paginator.pageSize) < (page + 1)) {
					this.paginator._changePageSize(this.paginator.pageSize);
				}
			});
			this.notification.openCustomSnackbar(`record deleted successfully!`);
		});
	}

	deleteManyOnClick(): void {
		const total = this.selection.selected.length;
		this.crud.deleteMany(this.selection.selected).subscribe((result) => {
			const page = this.paginator.pageIndex;

			// this.selectableData = this.selectableData.filter(item => !this.selection.selected.includes(item));

			this.dataSource.data = this.data = this.data.filter(item => !this.selection.selected.includes(item));
			for (let i = 0; i < this.data.length; i++) {
				this.data[i].position = i + 1;
			}
			this.selection.clear();
			setTimeout(() => {
				if (Math.ceil(this.data.length / this.paginator.pageSize) < (page + 1)) {
					this.dataSource.paginator.lastPage();
				}
			});
			this.notification.openCustomSnackbar(`${total} record${total > 1 ? 's' : ''} deleted successfully!`);
		});
	}

	insertOneOnClick(): void {
		this.openForm(false, { record: null, sessions: this.sessions }, (result) => {
			result.position = this.data.length + 1;
			this.dataSource.data = this.data = [...this.data, result];

			// this.selectableData = [...this.selectableData, result[0]];

			setTimeout(() => {
				this.dataSource.paginator.lastPage();
			});
			this.notification.openCustomSnackbar(`record inserted successfully!`);
		});
	}

	private openForm(isEdit: boolean, data?: { record: Record, sessions: Session[] }, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(RecordFormComponent, {
			data: {
				resource: data,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.6, 1000)}px` : `${this.browser.width()}px`
		});

		let optimismApplied = false;
		// const ind = this.selectableData.indexOf(metric);

		dialogRef.componentInstance.edited.subscribe((tempRecord: Record) => {
			this.data[data.record.position - 1] = tempRecord;
			this.dataSource.data = this.data = [...this.data];

			// if (ind > -1) {
			// 	this.selectableData[ind] = tempMetric;
			// }

			optimismApplied = true;
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (callback) {
					callback(result);
				}
			} else { // error or cancel.
				if (isEdit && optimismApplied) {
					this.data[data.record.position - 1] = data.record;
					this.dataSource.data = this.data = [...this.data];

					// if (ind > -1) {
					// 	this.selectableData[ind] = metric;
					// }

					this.notification.openCustomSnackbar(`failed to update record!`);
				}
			}
		});
	}

	selectRow(row: Record) {
		this.selection.toggle(row);
	}
}
