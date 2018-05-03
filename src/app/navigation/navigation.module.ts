import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import {
	NgModule
} from '@angular/core';
import {
	CommonModule
} from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material';

@NgModule({
	imports: [
		CommonModule,
		RouterModule,

		MatButtonModule,
	],
	declarations: [
		SidebarComponent,
		NavbarComponent,
	],
	exports: [
		SidebarComponent,
		NavbarComponent,
	],
	providers: [],
	entryComponents: [],
})
export class NavigationModule {}
