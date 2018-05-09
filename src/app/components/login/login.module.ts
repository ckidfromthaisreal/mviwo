import { MatInputModule, MatButtonModule, MatFormFieldModule, MatCardModule, MatTooltipModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { LoginComponent } from './login.component';
import { routing } from './login.routing';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		routing,

		MatButtonModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatTooltipModule,
	],
	declarations: [
		LoginComponent
	],
	exports: [
		LoginComponent
	],
	providers: [],
	entryComponents: []
})
export class LoginModule { }
