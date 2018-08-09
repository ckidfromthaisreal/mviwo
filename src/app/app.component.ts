import { LocationCrudService } from './services/crud/location-crud.service';
import { UpdateService } from './services/update/update.service';
import { Component } from '@angular/core';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent {
	title = 'app';

	constructor(
		private update: UpdateService,
		private locations: LocationCrudService
	) {
		this.locations.getMany(undefined, 'name country', undefined, undefined, true).subscribe(data => {
			// console.log(localStorage['mviwo-locations']);
		});
	}
}
