import { RegistrationComponent } from './../registration/registration.component';
import { TestBed, inject, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { routing } from '../app.routing';
import { HttpClientModule } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';

describe('AuthenticationService', () => {
	let injector: TestBed;
	let service: AuthenticationService;
	let httpMock: HttpTestingController;

	beforeEach(async () => {
		TestBed.configureTestingModule({
			declarations: [RegistrationComponent],
			imports: [HttpClientTestingModule, routing, HttpClientModule],
			providers: [
				AuthenticationService,
				{provide: APP_BASE_HREF, useValue: '/'}
			]
		});

		injector = getTestBed();
		service = injector.get(AuthenticationService);
		httpMock = injector.get(HttpTestingController);
	});

	// afterEach(() => {
	// 	httpMock.verify();
	// });

	describe('register user', () => {
		it('should register', async () => {
			const nuUser = {
				username: 'test001',
				email: 'test@mviwo.com',
				password: 'comeatmebro'
			};

			service.register(nuUser).subscribe(response => {
				expect(typeof response).toBe('object');
				expect(response.hasOwnProperty('token')).toBe(true);
			});

			const req = httpMock.expectOne(`${service.API_URL}/register`);
			expect(req.request.method).toBe('POST');
			req.flush({ token: '' });
		});
	});
});
