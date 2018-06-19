import {
	Component,
	OnInit,
	Input
} from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-card',
	templateUrl: './mviwo-card.component.html',
	styleUrls: ['./mviwo-card.component.scss']
})
export class MviwoCardComponent implements OnInit {
	@Input() avatar = 'https://material.angular.io/assets/img/examples/shiba1.jpg';
	@Input() main = 'asdasd';
	@Input() subtitle = 'asdasdas';
	@Input() image = 'https://material.angular.io/assets/img/examples/shiba2.jpg';
	@Input() content = 'adasdasdasdasdoasjdoiasjdasijdiaosjdioasd';

	constructor() {}

	ngOnInit() {}

}
