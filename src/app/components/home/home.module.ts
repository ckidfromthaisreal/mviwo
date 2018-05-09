import { NgModule } from '@angular/core';
import { routing } from './home.routing';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatInputModule, MatRippleModule, MatTooltipModule, MatCardModule } from '@angular/material';

import { NavigationModule } from './../navigation/navigation.module';
import { MetricModule } from '../metric/metric.module';

import { HomeComponent } from './home.component';
import { DashboardComponent } from './../dashboard/dashboard.component';

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

		NavigationModule,
		MetricModule
	],
	exports: [
		// HomeComponent,
		DashboardComponent,
	],
	providers: [],
	entryComponents: []
})
export class HomeModule {}
