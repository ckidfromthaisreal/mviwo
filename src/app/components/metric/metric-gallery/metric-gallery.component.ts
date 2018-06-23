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
	MatDialog
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
	selection = new SelectionModel<Metric>(true, []);

	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	highlightedRow = -1;

	constructor(
		protected crud: MetricCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, private browser: BrowserService
		, public dialog: MatDialog
	) {}

	ngOnInit() {
		this.crud.getMany<Metric>().subscribe(data => {
			this.dataSource.data = this.data = data;
			this.dataSource.sort = this.sort;
			this.dataSource.filterPredicate = (item, filter) => {
				return (item.name.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1);
			};
			this.dataSource.paginator = this.paginator;
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
			console.log(result);
		});
	}

	deleteOneOnClick(event, element): void {
		this.crud.deleteOne(element).subscribe(
			res => {
				this.dataSource.data = this.data = this.data.filter(item => item !== element);
				this.selection.deselect(element);
				this.notification.openCustomSnackbar(`metric deleted successfully!`);
			}
		);
	}

	deleteManyOnClick() {
		const total = this.selection.selected.length;
		this.crud.deleteMany(this.selection.selected).subscribe(
			res => {
				this.dataSource.data = this.data = this.data.filter(item => !this.selection.selected.includes(item));
				this.selection.clear();
				this.notification.openCustomSnackbar(`${total} metric${total > 1 ? 's' : ''} deleted successfully!`);
			}
		);
	}

	insertOneOnClick() { // TODO
		// this.crud.insertOne({
		// 	name: 'test',
		// 	groups: [],
		// 	dataType: 'boolean',
		// 	isRequired: false
		// }).subscribe(
		// 	res => {
		// 		this.notification.openCustomSnackbar(`metric inserted successfully!`);
		// 		this.data.push(res[0]);
		// 		this.dataSource.data = this.data;
		// 		this.paginator.lastPage();
		// 	}
		// );

		this.openForm(false, null, (result) => {
			console.log(result);
			this.notification.openCustomSnackbar(`metric inserted successfully!`);
			this.data.push(result[0]);
			this.dataSource.data = this.data;
			this.paginator.lastPage();
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
