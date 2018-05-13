import { NgModule } from '@angular/core';
import { WordCloudComponent } from './word-cloud/word-cloud.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        WordCloudComponent,
    ],
    exports: [
        WordCloudComponent,
    ],
    entryComponents: [

    ],
    providers: [

    ]
})
export class D3Module {}