import { CommonModule } from '@angular/common';
import { MatCardModule, MatButtonModule } from '@angular/material';
import { MviwoCardComponent } from './mviwo-card.component';
import { NgModule } from '@angular/core';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatCardModule,
	],
	declarations: [
		MviwoCardComponent,
	],
	exports: [
		MviwoCardComponent,
	],
	providers: []
})
export class MviwoCardModule {}
