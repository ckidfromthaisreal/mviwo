import { MetricGroup } from './../../../models/metric-group.model';
import {
	Component,
	OnInit,
	ViewChild
} from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator, MatTable, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { BrowserService } from '../../../services/browser/browser.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { AuthenticationService } from '../../../services/authentication/authentication.service';
import { MetricGroupCrudService } from '../../../services/crud/metric-group-crud.service';
import { MetricGroupFormComponent } from '../metric-group-form/metric-group-form.component';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-metric-group-gallery',
	templateUrl: './metric-group-gallery.component.html',
	styleUrls: ['./metric-group-gallery.component.scss']
})
export class MetricGroupGalleryComponent implements OnInit {
	data: MetricGroup[] = [];

	displayedColumns = ['select', 'name', 'metrics', 'createdAt', 'updatedAt', 'action'];
	dataSource = new MatTableDataSource<MetricGroup>(this.data);
	selection = new SelectionModel<MetricGroup>(true);

	@ViewChild('metricGroupTable') table: MatTable<MetricGroup>;
	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	/**
	 * for visual purposes.
	 */
	highlightedRow = -1;

	constructor(
		protected crud: MetricGroupCrudService
		, public auth: AuthenticationService
		, private notification: NotificationService
		, private browser: BrowserService
		, public dialog: MatDialog
	) {}

	ngOnInit() {
		this.crud.getMany<MetricGroup>().subscribe(data => {
			this.dataSource.filterPredicate = (item, filter) => {
				return (item.name.toLowerCase().indexOf(filter.trim().toLowerCase()) > -1);
			};
			this.dataSource.data.unshift(...data);
			this.dataSource.sort = this.sort;
			this.dataSource.paginator = this.paginator; // ALSO REFRESHES RENDERED ROWS!
		});
	}

	renderMetricsTooltip(element: MetricGroup): string {
		return element.metrics.map(mtr => mtr.name).join();
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
			this.notification.openCustomSnackbar(`group edited successfully!`);
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
			this.notification.openCustomSnackbar(`group deleted successfully!`);
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
			this.notification.openCustomSnackbar(`${total} group${total > 1 ? 's' : ''} deleted successfully!`);
		});
	}

	insertOneOnClick() {
		this.openForm(false, null, (result) => {
			result[0].position = this.data.length + 1;
			this.dataSource.data = this.data = [...this.data, result[0]];
			setTimeout(() => {
				this.dataSource.paginator.lastPage();
			});
			this.notification.openCustomSnackbar(`group inserted successfully!`);
		});
	}

	private openForm(isEdit: boolean, group?: MetricGroup, callback?: (result) => void): void {
		const dialogRef = this.dialog.open(MetricGroupFormComponent, {
			data: {
				resource: group,
				isEdit: isEdit
			},
			width: !this.browser.isMobile() ?
				`${Math.min(this.browser.width() * 0.60, 1000)}px` : `${this.browser.width()}px`
		});

		let optimismApplied = false;

		dialogRef.componentInstance.edited.subscribe((tempGroup: MetricGroup) => {
			this.data[group.position - 1] = tempGroup;
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
					this.data[group.position - 1] = group;
					this.dataSource.data = this.data = [...this.data];
					this.notification.openCustomSnackbar(`failed to update group!`);
				}
			}
		});
	}

	showMetrics(group: MetricGroup): void {
		console.log(JSON.stringify(group.metrics));
	}

}
