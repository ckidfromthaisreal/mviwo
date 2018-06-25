import { BrowserService } from './../../../services/browser/browser.service';
import { MetricFormComponent } from './../metric-form/metric-form.component';
import {
	AuthenticationService
} from './../../../services/authentication/authentication.service';
import {
	MetricCrudService
} from './../../../services/crud/metric-crud.service';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import {
	MatTableDataSource,
	MatSort,
	MatPaginator,
	MatDialog,
	MatTable
} from '@angular/material';
import {
	SelectionModel
} from '@angular/cdk/collections';
import {
	NotificationService
} from '../../../services/notification/notification.service';
import { Metric } from '../../../models/metric.model';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-metric-gallery',
	templateUrl: './metric-gallery.component.html',
	styleUrls: ['./metric-gallery.component.scss']
})
export class MetricGalleryComponent implements OnInit {
	data: Metric[] = [];
	dataTypes = Metric.dataTypes;

	displayedColumns = ['select', 'type', 'name', 'group', 'createdAt', 'updatedAt', 'action'];
	dataSource = new MatTableDataSource<Metric>(this.data);
	selection = new SelectionModel<Metric>(true);

	@ViewChild('metricTable') table: MatTable<Metric>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	constructor(
		protected crud: MetricCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, private browser: BrowserService
		, public dialog: MatDialog
	) {
		this.dataSource.sort = this.sort;
		this.dataSource.filterPredicate = (item, filter) => {
			return (item.name.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1);
		};
	}

	ngOnInit() {
		this.crud.getMany<Metric>().subscribe(data => {
			this.data.unshift(...data);
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});
	}

	renderGroups(element) {
		if (!element.groups || element.groups.length === 0) {
			return 'unbound';
		}

		if (element.groups.length === 1) {
			return element.groups[0].name;
		}

		return `${element.groups.length} groups`;
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
			this.paginator._changePageSize(this.paginator.pageSize);	// HACK TO UPDATE RENDERED ROWS.
			this.notification.openCustomSnackbar(`metric edited successfully!`);
		});
	}

	deleteOneOnClick(event, element): void {
		this.crud.deleteOne(element).subscribe((result) => {
				this.selection.deselect(element);
				for (let i = element.position; i < this.dataSource.data.length; i++) {
					this.data[i].position -= 1;
				}
				this.data.splice(element.position - 1, 1);
				this.paginator._changePageSize(this.paginator.pageSize);	// HACK TO UPDATE RENDERED ROWS.
				this.notification.openCustomSnackbar(`metric deleted successfully!`);
		});
	}

	deleteManyOnClick() {
		const total = this.selection.selected.length;
		this.crud.deleteMany(this.selection.selected).subscribe((result) => {
				const filtered = this.data.filter(item => !this.selection.selected.includes(item));
				this.data.splice(0, this.data.length, ...filtered);
				for (let i = 0; i < this.data.length; i++) {
					this.data[i].position = i + 1;
				}
				this.selection.clear();
				this.paginator._changePageSize(this.paginator.pageSize);	// HACK TO UPDATE RENDERED ROWS.
				this.notification.openCustomSnackbar(`${total} metric${total > 1 ? 's' : ''} deleted successfully!`);
			}
		);
	}

	insertOneOnClick() {
		// this.crud.insertOne({
		// 	name: 'test',
		// 	groups: [],
		// 	dataType: 'boolean',
		// 	isRequired: false
		// }).subscribe(
		// );

		this.openForm(false, null, (result) => {
			result[0].position = this.data.length + 1;
			this.data.push(result[0]);
			this.paginator._changePageSize(this.paginator.pageSize);	// HACK TO UPDATE RENDERED ROWS.
			this.paginator.lastPage();
			this.notification.openCustomSnackbar(`metric inserted successfully!`);
		});
	}

	private openForm(isEdit: boolean, metric?: Metric, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(MetricFormComponent, {
			data: {
				resource: metric,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.60, 650)}px` :
				`${this.browser.width()}px`
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (callback) {
					callback(result);
				}
			} else {}
		});
	}

	getDataType(element): any {
		return this.dataTypes.find(e => e.name === element.dataType);
	}
}
