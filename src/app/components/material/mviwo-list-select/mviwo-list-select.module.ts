import { CommonModule } from '@angular/common';
import { MatButtonModule, MatIconModule, MatListModule,
	MatCheckboxModule,
	MatTooltipModule} from '@angular/material';
import { MviwoListSelectComponent } from './mviwo-list-select.component';
import { NgModule } from '@angular/core';

@NgModule({
	imports: [
		CommonModule,

		MatButtonModule,
		MatIconModule,
		MatListModule,
		MatCheckboxModule,
		MatIconModule,
		MatTooltipModule,
	],
	declarations: [
		MviwoListSelectComponent,
	],
	exports: [
		MviwoListSelectComponent,
	],
	providers: []
})
export class MviwoListSelectModule {}
