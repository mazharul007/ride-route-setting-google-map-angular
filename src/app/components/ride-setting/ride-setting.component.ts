import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { mapStyle } from './mapStyle';

@Component({
  selector: 'ride-setting',
  templateUrl: './ride-setting.component.html',
  styleUrls: ['./ride-setting.component.css']
})
export class RideSettingComponent implements OnInit, AfterViewInit {

  @ViewChild('mapContainer', { static: false }) gmap!: ElementRef;

  waypts: google.maps.DirectionsWaypoint[] = [];
  locationFields: any[] = [
    { name: 'pickup', value: '' },
    {
      name: 'dropoff', value: ''
    }
  ]

  // draggable = {
  //   data: this.locationFields,
  //   effectAllowed: "all",
  //   handle: false
  // }


  map!: google.maps.Map;

  lat = 23.7739397;
  lng = 90.4124768;

  coordinates = new google.maps.LatLng(this.lat, this.lng);

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: "#8DC53E" }, suppressMarkers: true, preserveViewport: true });


  public stopCoorArr: google.maps.LatLngLiteral[] = [];

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 14,
    styles: mapStyle,
    scrollwheel: true,
    disableDefaultUI: false,
    fullscreenControl: true,
    fullscreenControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  };
  markers: google.maps.Marker[] = [];

  marker = new google.maps.Marker({
    position: this.coordinates,
    map: this.map,
  });



  constructor() { }

  ngAfterViewInit(): void {
    this.mapInitializer();

  }

  ngOnInit(): void {
  }

  mapInitializer() {

    this.map = new google.maps.Map(this.gmap.nativeElement,
      this.mapOptions);
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(this.map)
      this.directionsDisplay.setMap(this.map);
    }
  }

  addressChanged(address: any, i: number) {
    console.log(address, i);
  }

  removeStop(i: number) {
    this.locationFields = this.locationFields.filter((x, index) => index != i);
  }

  addStop() {
    const newStop = { name: 'stopLocation', value: '' }
    this.locationFields.push(newStop);

  }

  listOrderChanged($event: any) {
    console.log($event);
  }
}
