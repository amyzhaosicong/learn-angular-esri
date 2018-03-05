import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from '../../../../node_modules/esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  public mapView: __esri.MapView;

  private _myLocation = [-73.9288310, 42.8684020];

  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  constructor() { }

  ngOnInit() {
    const loadOptions = {
      url: 'https://js.arcgis.com/4.6/',
      css: 'https://js.arcgis.com/4.6/esri/css/main.css'
    };

    loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/geometry/Circle',
      'esri/Graphic'
    ], loadOptions).then(([Map, MapView, Circle, Graphic]) => {
      const map = new Map({
        basemap: 'streets'
      });

      this.mapView = new MapView({
        map: map,
        container: this.mapViewEl.nativeElement,
        zoom: 15,
        center: this._myLocation
      });

      this.addCircle(Circle, Graphic);
      this.addMarker(Graphic);
      this.checkSVG();

      // TODO: fix when() warning
    }).catch((e) => {
      console.error(e);
    });
  }

  addCircle(Circle: any, Graphic: any) {
    const circleGeometry = new Circle({
      center: this._myLocation,
      radius: 300,
      geodesic: true
    });

    const fillSymbol = {
      type: 'simple-fill',
      color: 'yellow',
      outline: 'none'
    };

    const circleGraphic = new Graphic({
      geometry: circleGeometry,
      symbol: fillSymbol
    });

    this.mapView.graphics.add(circleGraphic);
  }

  addMarker(Graphic: any) {
    const pointGeometry = {
      type: 'point',
      longitude: this._myLocation[0],
      latitude: this._myLocation[1]
    };

    const markerSymbol = {
      type: 'picture-marker',
      url: 'favicon.ico',
      width: '80px',
      height: '80px'
    };

    const pointGraphic = new Graphic({
      geometry: pointGeometry,
      symbol: markerSymbol
    });

    this.mapView.graphics.add(pointGraphic);
  }

  // keep esri PictureMarkerSybmol() same size & position when zooming
  checkSVG() {
    this.mapView.watch('zoom', (e) => {
      const svg = document.getElementsByTagName('g')[0];
      if (!svg || !svg.transform.baseVal.consolidate()) { return; }

      const marker = svg.children[1]; // marker is the second child added to esri graphics
      if (!marker) { return; }

      const svgMatrix = svg.transform.baseVal.consolidate().matrix;
      const transMatrix = [1, 0, 0, 1, 0, 0];
      const scale = svgMatrix.a;
      const x = Number(marker.getAttribute('x'));
      const y = Number(marker.getAttribute('y'));

      for (let i = 0; i < transMatrix.length; i++) {
        transMatrix[i] /= scale;
      }

      // set 4 & 5 for position
      transMatrix[4] -= (1 / scale - 1) * (x + 40); // 40 is the width of marker element
      transMatrix[5] -= (1 / scale - 1) * (y + 40);

      const newMatrix = 'matrix(' + transMatrix.join(' ') + ')';
      marker.setAttributeNS(null, 'transform', newMatrix);
    });
  }
}
