import { CommonModule } from '@angular/common';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { MviwoSnackbarComponent } from './mviwo-snackbar.component';
import { NgModule } from '@angular/core';

@NgModule({
	imports: [
		CommonModule,

		MatButtonModule,
		MatCardModule,
	],
	declarations: [
		MviwoSnackbarComponent,
	],
	exports: [
		MviwoSnackbarComponent,
	],
	providers: []
})
export class MviwoSnackbarModule {}
