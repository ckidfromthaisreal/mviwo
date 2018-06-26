// import { routing } from './metric-group.routing';
import { NgModule } from '@angular/core';
import { MatIconModule, MatButtonModule, MatMenuModule,
	MatTableModule, MatCheckboxModule, MatSortModule,
	MatFormFieldModule, MatInputModule, MatPaginatorModule,
	MatTooltipModule, MatDialogModule, MatTabsModule,
	MatButtonToggleModule, MatSliderModule, MatSlideToggleModule,
	MatSelectModule, MatListModule, MatDatepickerModule, MatNativeDateModule} from '@angular/material';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DndModule } from 'ng2-dnd';
import { MetricGroupGalleryComponent } from './metric-group-gallery/metric-group-gallery.component';
import { MetricGroupFormComponent } from './metric-group-form/metric-group-form.component';

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

		DndModule,
	],
	declarations: [
		MetricGroupGalleryComponent,
		MetricGroupFormComponent,
	],
	exports: [
		MetricGroupGalleryComponent,
	],
	providers: [],
	entryComponents: [
		MetricGroupFormComponent,
	]
})
export class MetricGroupModule {}
