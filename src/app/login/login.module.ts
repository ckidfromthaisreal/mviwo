import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule, MatButtonModule, MatFormFieldModule, MatCardModule, MatTooltipModule } from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { MaterialModule } from './../material.module';

import { LoginComponent } from './login.component';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		FlexLayoutModule,

		MatButtonModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatTooltipModule
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
