import { AgePipe, DurationPipe } from './dates.pipe';
import { NgModule } from '@angular/core';

@NgModule({
	declarations: [
		AgePipe,
		DurationPipe,
	],
	imports: [],
	exports: [
		AgePipe,
		DurationPipe
	],
	entryComponents: [],
	providers: []
})
export class PipesModule {}
