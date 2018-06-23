import { AuthenticationService } from './../../../services/authentication/authentication.service';
import { MetricCrudService } from './../../../services/crud/metric-crud.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSort, MatPaginator } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-metric-gallery',
	templateUrl: './metric-gallery.component.html',
	styleUrls: ['./metric-gallery.component.scss']
})
export class MetricGalleryComponent implements OnInit {
	data: any[] = [];

	displayedColumns = ['select', 'type', 'name', 'group', 'action'];
	dataSource = new MatTableDataSource<any>(this.data);
	selection = new SelectionModel<any>(true, []);

	@ViewChild(MatSort) sort: MatSort;
	@ViewChild(MatPaginator) paginator: MatPaginator;

	highlightedRow = -1;

	constructor(
		protected crud: MetricCrudService
		, protected auth: AuthenticationService
		, private notification: NotificationService
	) { }

	ngOnInit() {
		this.crud.getMany().subscribe(data => {
			this.data = data;
			this.dataSource = new MatTableDataSource<any>(this.data);
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

	highlight(rowId) {
		this.highlightedRow = rowId;
	}

	editOnClick(event, element) {
		console.log(event);
		console.log(element);
	}

	deleteOneOnClick(event, element) {
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
		this.crud.insertOne({ name: 'test', groups: [], dataType: 'boolean', isRequired: false }).subscribe(
			res => {
				this.notification.openCustomSnackbar(`metric inserted successfully!`);
				this.data.push(res[0]);
				this.dataSource.data = this.data;
				this.paginator.lastPage();
			}
		);
	}
}
