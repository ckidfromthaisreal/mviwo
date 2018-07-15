import { PipesModule } from './../../pipes/pipes.module';
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
import { RecordGalleryComponent } from './record-gallery/record-gallery.component';
import { RecordFormComponent } from './record-form/record-form.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

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

		NgxMatSelectSearchModule,

		MviwoListSelectModule,

		PipesModule,
	],
	declarations: [
		RecordGalleryComponent,
		RecordFormComponent,
	],
	exports: [
		RecordGalleryComponent,
	],
	providers: [],
	entryComponents: [
		RecordFormComponent,
	]
})
export class RecordModule {}
