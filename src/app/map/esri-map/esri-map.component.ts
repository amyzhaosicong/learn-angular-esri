import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { loadModules } from '../../../../node_modules/esri-loader';

@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  public mapView: __esri.MapView;

  // test mode
  public testMode = {
    checkFlicker: false,
    checkRotate: false,
    rotateMatrix: false
  }

  private _myLocation = [-73.9288310, 42.8684020];
  private _rotateAnimationDegree = 90;
  private _lastDegree;

  private _currTransMatrix;
  private _currAngle;

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

      this.mapView.when(() => {
        // this.addCircle(Circle, Graphic);
        this.addMarker(Graphic);
        this.checkSVG();
      });

      // keep removing & adding graphic test: ios device would flickering if keep rendering image from localhost, use base64 img instead
      if (this.testMode.checkFlicker) {
        setInterval(() => {
          const tmpMarker = this.mapView.graphics.getItemAt(0).clone();
          this.mapView.graphics.removeAll();
          this.mapView.graphics.add(tmpMarker);
        }, 1000);
      }

      setTimeout(() => {
        if (this.testMode.checkRotate) {
          this.rotateSVGAnimation(this._rotateAnimationDegree);
          this._rotateAnimationDegree += 90;
        }

        if (this.testMode.rotateMatrix) {
          this.rotateSVGMatrix(60);
        }
      }, 3000);

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
      /** angular icon */
      url: 'favicon.ico',
      /** home icon */
      //url: 'data:image/png;base64,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',
      /** square icon */
      //url: 'data:image/png;base64,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',
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
      if (!svg || svg.children.length < 1 || !svg.transform.baseVal.consolidate()) { return; }

      const marker = svg.children[0];
      const svgMatrix = svg.transform.baseVal.consolidate().matrix;
      let transMatrix = [1, 0, 0, 1, 0, 0];

      const scale = svgMatrix.a;
      const x = Number(marker.getAttribute('x'));
      const y = Number(marker.getAttribute('y'));

      for (let i = 0; i < transMatrix.length; i++) {
        transMatrix[i] /= scale;
      }

      // preserve rotate angle when zoom
      if (this._currAngle) {
        const rotateMatrix = [
          1 / scale * Math.cos(this._currAngle),
          1 / scale *Math.sin(this._currAngle),
          1 / scale * -1 * Math.sin(this._currAngle),
          1 / scale * Math.cos(this._currAngle),
          (1 - 1 / scale * Math.cos(this._currAngle)) * (x + 40) + 1 / scale * Math.sin(this._currAngle) * (y + 40),
          (1 - 1 / scale * Math.cos(this._currAngle)) * (y + 40) - 1 / scale * Math.sin(this._currAngle) * (x + 40)
        ];

        transMatrix = rotateMatrix;
      } else {
        // set 4 & 5 for position
        transMatrix[4] += (1 - 1 / scale) * (x + 40); // 40 is half of element width
        transMatrix[5] += (1 - 1 / scale) * (y + 40);
      }
      
      const newMatrix = 'matrix(' + transMatrix.join(' ') + ')';
      marker.setAttributeNS(null, 'transform', newMatrix);

      // used for applyLastTransform() button 
      this._currTransMatrix = transMatrix;
    });
  }

  rotateSVGMatrix(angle: number) {
    if (!angle) { return;}

    const svg = document.getElementsByTagName('g')[0];
    if (!svg || svg.children.length < 1) { return; }

    const marker = svg.children[0];
    const centerX = Number(marker.getAttribute('x')) + 40;
    const centerY = Number(marker.getAttribute('y')) + 40;

    const matrix = [
      Math.cos(angle),
      Math.sin(angle),
      -1 * Math.sin(angle),
      Math.cos(angle),
      centerX * (1 - Math.cos(angle)) + centerY * Math.sin(angle),
      -1 * centerX * Math.sin(angle) + centerY * (1 - Math.cos(angle))
    ];

    this._currTransMatrix = matrix;

    const newMatrix = 'matrix(' + matrix.join(' ') + ')';
    marker.setAttributeNS(null, 'transform', newMatrix);
  }

  rotateSVGAnimation(degree: number) {
    const svg = document.getElementsByTagName('g')[0];
    if (!svg || svg.children.length < 1) { return; }

    const marker = svg.children[0];
    const centerX = Number(marker.getAttribute('x')) + 40;
    const centerY = Number(marker.getAttribute('y')) + 40;

    let animateTransformEl: any;

    if (!marker.hasChildNodes()) {
      const svgNamespace = 'http://www.w3.org/2000/svg';
      animateTransformEl = document.createElementNS(svgNamespace, 'animateTransform');

      animateTransformEl.setAttributeNS(null, 'attributeName', 'transform');
      animateTransformEl.setAttributeNS(null, 'attributeType', 'XML');
      animateTransformEl.setAttributeNS(null, 'type', 'rotate');
      animateTransformEl.setAttributeNS(null, 'dur', '3s'); //300ms when input degree
      animateTransformEl.setAttributeNS(null, 'repeatCount', 'indefinite');
      animateTransformEl.setAttributeNS(null, 'fill', 'freeze');
      animateTransformEl.setAttributeNS(null, 'from', '0 ' + centerX + ' ' + centerY);
      animateTransformEl.setAttributeNS(null, 'to', '360' + ' ' + centerX + ' ' + centerY); //degree

      marker.appendChild(animateTransformEl);
      animateTransformEl.beginElement();
    } else {
      animateTransformEl = marker.children[0];
      animateTransformEl.endElement();
      animateTransformEl.setAttributeNS(null, 'from', this._lastDegree + ' ' + centerX + ' ' + centerY);
      animateTransformEl.setAttributeNS(null, 'to', degree + ' ' + centerX + ' ' + centerY);
    }
    this._lastDegree = degree;
  }

  rotateInputDeg(event) {
    this._currAngle = this.toRadians(event.target.value);

    // method 1: change transform matrix
    // method 2: change esri graphic angle, remove and add new graphic back
    if (0) {
      this.rotateSVGMatrix(this._currAngle);
    } else {
      const markerGraphic = this.mapView.graphics.getItemAt(0).clone();
      markerGraphic.symbol.set('angle', this.toDegree(this._currAngle));
      this.mapView.graphics.removeAt(0);
      this.mapView.graphics.add(markerGraphic);
    }
  }

  applyLastTransform() {
    const svg = document.getElementsByTagName('g')[0];
    if (!svg || svg.children.length < 1) { return; }

    const marker = svg.children[0];
    if (!marker) { return; }

    const newMatrix = 'matrix(' + this._currTransMatrix.join(' ') + ')';
    marker.setAttributeNS(null, 'transform', newMatrix);
  }

  toRadians(degree: number): number {
    return degree * (Math.PI / 180);
  }

  toDegree(angle: number): number {
    return angle * (180 / Math.PI);
  }
}
