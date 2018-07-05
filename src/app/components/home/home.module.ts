import { PatientModule } from './../patient/patient.module';
import { NgModule } from '@angular/core';
import { routing } from './home.routing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatRippleModule, MatTooltipModule, MatCardModule } from '@angular/material';

import { NavigationModule } from './../navigation/navigation.module';
import { MetricModule } from '../metric/metric.module';
import { MetricGroupModule } from '../metric-group/metric-group.module';
import { LocationModule } from '../location/location.module';

import { DashboardComponent } from './../dashboard/dashboard.component';
import { MviwoListSelectModule } from '../material/mviwo-list-select/mviwo-list-select.module';

@NgModule({
	declarations: [
		// HomeComponent,
		DashboardComponent,
	],
	imports: [
		CommonModule,
		routing,
		FormsModule,
		// ReactiveFormsModule,

		MatButtonModule,
		MatCardModule,
		MatInputModule,
		MatRippleModule,
		MatTooltipModule,

		LocationModule,
		MetricModule,
		MetricGroupModule,
		NavigationModule,
		PatientModule,

		MviwoListSelectModule,
	],
	exports: [
		// HomeComponent,
		DashboardComponent,
	],
	providers: [],
	entryComponents: []
})
export class HomeModule {}
