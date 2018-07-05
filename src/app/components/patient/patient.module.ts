import { PipesModule } from './../../pipes/pipes.module';
import { PatientGalleryComponent } from './patient-gallery/patient-gallery.component';
import { MviwoListSelectModule } from './../material/mviwo-list-select/mviwo-list-select.module';
// import { routing } from './metric-group.routing';
import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatMenuModule,
	MatTableModule, MatCheckboxModule, MatSortModule,
	MatFormFieldModule, MatInputModule, MatPaginatorModule,
	MatTooltipModule, MatDialogModule, MatTabsModule,
	MatButtonToggleModule, MatSliderModule, MatSlideToggleModule,
	MatSelectModule, MatListModule, MatDatepickerModule,
	MatNativeDateModule,
	MatRadioModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PatientFormComponent } from './patient-form/patient-form.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
	imports: [
		// routing
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatTableModule,
		MatCheckboxModule,
		MatSortModule,
		MatFormFieldModule,
		MatInputModule,
		MatPaginatorModule,
		MatTooltipModule,
		MatDialogModule,
		MatTabsModule,
		MatButtonToggleModule,
		MatSliderModule,
		MatSlideToggleModule,
		MatSelectModule,
		MatListModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatRadioModule,

		FontAwesomeModule,

		MviwoListSelectModule,

		PipesModule,
	],
	declarations: [
		PatientGalleryComponent,
		PatientFormComponent,
	],
	exports: [
		PatientGalleryComponent,
	],
	providers: [],
	entryComponents: [
		PatientFormComponent,
	]
})
export class PatientModule {}
