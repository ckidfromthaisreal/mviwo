import { MviwoListSelectModule } from './../material/mviwo-list-select/mviwo-list-select.module';
// import { routing } from './metric-group.routing';
import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatMenuModule,
	MatTableModule, MatCheckboxModule, MatSortModule,
	MatFormFieldModule, MatInputModule, MatPaginatorModule,
	MatTooltipModule, MatDialogModule, MatTabsModule,
	MatButtonToggleModule, MatSliderModule, MatSlideToggleModule,
	MatSelectModule, MatListModule, MatDatepickerModule,
	MatNativeDateModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationGalleryComponent } from './location-gallery/location-gallery.component';
import { LocationFormComponent } from './location-form/location-form.component';

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

		MviwoListSelectModule,
	],
	declarations: [
		LocationGalleryComponent,
		LocationFormComponent,
	],
	exports: [
		LocationGalleryComponent,
	],
	providers: [],
	entryComponents: [
		LocationFormComponent,
	]
})
export class LocationModule {}
