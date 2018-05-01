import { AuthenticationService } from './../services/authentication.service';
import { Component, OnInit } from '@angular/core';

@Component({
	// tslint:disable-next-line:component-selector
	selector: 'mviwo-registration',
	templateUrl: './registration.component.html',
	styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
	constructor(private auth: AuthenticationService) {}

	ngOnInit() {
		// this.auth.register({ username: 'blah', email: 'blah', password: 'blahblah' }).subscribe(
		// 	res => {
		// 	},
		// 	err => console.log(err)
		// );
	}

}
