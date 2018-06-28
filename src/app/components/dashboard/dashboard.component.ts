import {
	Component,
	OnInit
} from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	dataSource = [{ name: 'item1'}, {name: true}, {name: 'item3'}];
	dataTarget = [{name: 'item4'}];

	constructor() {}

	ngOnInit(): void {}
}
