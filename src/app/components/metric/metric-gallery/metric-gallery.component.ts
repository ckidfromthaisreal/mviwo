import { MetricCrudService } from './../../../services/crud/metric-crud.service';
import { Component, OnInit } from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-metric-gallery',
	templateUrl: './metric-gallery.component.html',
	styleUrls: ['./metric-gallery.component.scss']
})
export class MetricGalleryComponent implements OnInit {
	data: any[];

	constructor(private crud: MetricCrudService) { }

	ngOnInit() {
		this.crud.getMany().subscribe(data => {
			console.log(data);
			this.data = data;
		});
	}
}
