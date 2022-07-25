import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Options } from 'sortablejs';
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

  pickAddLat: any;
  pickAddLng: any;
  dropAddLat: any;
  dropAddLng: any;


  options: Options = {
    animation: 150
  };


  map!: google.maps.Map;

  lat = 23.7739397;
  lng = 90.4124768;

  coordinates = new google.maps.LatLng(this.lat, this.lng);

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: "#8DC53E" }, suppressMarkers: true, preserveViewport: true });


  // public stopCoorArr: google.maps.LatLngLiteral[] = [];

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



  constructor() {
    this.options = {
      onUpdate: (event: any) => {
        console.log(event);
        console.log(this.locationFields)
        return false;
      }
    }

  }

  ngAfterViewInit(): void {
    this.mapInitializer();

  }

  ngOnInit(): void {
  }

  mapInitializer() {
    this.mapOptions = {
      ...this.mapOptions,
      center: this.coordinates
    }
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    this.initMarkers();
  }

  initMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(this.map)
      this.directionsDisplay.setMap(this.map);
    }
  }

  setmarker(coordinates: any, i: number) {

    const newMarker = new google.maps.Marker({
      position: coordinates
    });
    if (i == 0) {
      this.markers.unshift(newMarker);
    }
    if (i == (this.locationFields.length - 1)) {
      this.markers.push(newMarker);
    }

    // centerise map to marker
    this.map.panTo(coordinates);

  }

  addressChanged(address: any, i: number) {
    console.log(address, i);
    if (i == 0) {
      const oldPickAddLat = this.pickAddLat;
      this.pickAddLat = address.geometry.location.lat();
      this.pickAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.pickAddLat, this.pickAddLng);
      this.setmarker(this.coordinates, i);

      if (oldPickAddLat) {
        this.markers[1].setMap(null);
        this.markers.splice(1, 1);
        this.initMarkers();
      }
      else {
        this.initMarkers();
      }

      this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
    }
    if (i == (this.locationFields.length - 1)) {
      const oldDropAddLat = this.dropAddLat;
      this.dropAddLat = address.geometry.location.lat();
      this.dropAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.dropAddLat, this.dropAddLng);
      this.setmarker(this.coordinates, i);
      if (oldDropAddLat) {
        if (this.pickAddLat) {
          console.log(this.markers);
          this.markers[this.markers.length - 2].setMap(null);
          this.markers.splice((this.markers.length - 2), 1);
          console.log(this.markers);
          this.initMarkers();
        } else {
          this.markers[0].setMap(null);
          this.markers.shift();
          this.initMarkers();
        }
      }
      else {
        this.initMarkers();
      }

      this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
    }
  }

  calculateAndDisplayRoute(directionService: any, directionsDisplay: any): void {

    let start, end;

    if (this.pickAddLat) {
      const pickupLat: number = +this.pickAddLat;
      const pickupLng: number = +this.pickAddLng;
      start = new google.maps.LatLng(pickupLat, pickupLng);

      if (this.dropAddLat) {
        const dropLat: number = +this.dropAddLat;
        const dropLng: number = +this.dropAddLng;
        end = new google.maps.LatLng(dropLat, dropLng);
      }
      else {
        return
      }
    }
    else {
      return
    }

    this.directionsService.route({
      origin: start,
      destination: end,
      optimizeWaypoints: false,
      avoidTolls: false,
      waypoints: [] = this.waypts,
      travelMode: google.maps.TravelMode.DRIVING
    },
      function (response, status) {
        if (status == 'OK') {
          directionsDisplay.setDirections(response);
        }
        else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );

  }

  removeStop(i: number) {
    this.locationFields = this.locationFields.filter((x, index) => index != i);
  }

  addStop() {
    const newStop = { name: 'stopLocation', value: '' };
    const toIndex = this.locationFields.length - 1;
    this.locationFields.splice(toIndex, 0, newStop);

  }

  listOrderChanged($event: any) {
    console.log($event);
  }
}
