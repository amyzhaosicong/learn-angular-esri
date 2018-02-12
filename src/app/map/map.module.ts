import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EsriMapComponent } from './esri-map/esri-map.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [EsriMapComponent],
    exports: [
        EsriMapComponent
    ]
})
export class MapModule { }
