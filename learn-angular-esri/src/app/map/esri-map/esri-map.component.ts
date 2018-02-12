import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from '../../../../node_modules/esri-loader';


@Component({
    selector: 'app-esri-map',
    templateUrl: './esri-map.component.html',
    styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
    public mapView: any;

    @ViewChild('mapViewNode') private mapViewEl: ElementRef;

    constructor() { }

    ngOnInit() {

        // return loadModules(['esri/Map', 'esri/views/MapView']).then(([Map, MapView]) => {

        // })

    }

}
