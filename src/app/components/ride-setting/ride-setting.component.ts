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

  locationFields: Array<{ name: string, value: any, address: any }> = [
    { name: 'pickup', value: '', address: '' },
    {
      name: 'dropoff', value: '', address: ''
    }
  ]
  pickAddLat: any;
  pickAddLng: any;
  dropAddLat: any;
  dropAddLng: any;

  stopCoordinates: any[] = [];


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
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  labelIndex = 0;
  marker = new google.maps.Marker({
    position: this.coordinates,
    map: this.map,
  });

  infoWindow = new google.maps.InfoWindow();

  constructor() {
    this.options = {
      onUpdate: (event: any) => {
        console.log(event);
        console.log(this.locationFields)
        return false;
      }
    }



  }

  lastLocation = (): number => {
    return this.locationFields.length - 1;
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
      this.markers[i].setMap(this.map);
      this.markers[i].setLabel(this.labels[i]);
      const content = '<div><strong>' + this.locationFields[i].address.formatted_address + '</strong><br>'
      this.infoWindow.setContent(content);
      // this.infoWindow.setContent('<div><strong>' + this.locationFields[i].address.formatted_address + '</strong><br>');
      const infoWindow = new google.maps.InfoWindow();
      const iMarker = this.markers[i];
      this.directionsDisplay.setMap(this.map);
      const map = this.map;
      google.maps.event.addListener(this.markers[i], 'click', ((map, iMarker, content, infoWindow) => {

        // console.log(this.locationFields[i].address);
        // this.infoWindow.open(this.map, this.markers[i])
        return function () {
          infoWindow.setContent(content);
          infoWindow.open(map, iMarker);
        }
      }
      )(map, iMarker, content, infoWindow))
    }
  }

  setmarker(coordinates: any, i: number) {

    const newMarker = new google.maps.Marker({
      position: coordinates,
      label: this.labels[i]
    });

    if (i == 0) {
      this.markers.unshift(newMarker);
    }
    else if (i > 0 && i < this.lastLocation()) {
      // this.markers[i]
      this.markers.splice(this.lastLocation() - 1, 0, newMarker);
      this.markers[this.lastLocation()].setLabel(this.labels[this.lastLocation()])
    }
    else if (i == this.lastLocation()) {
      this.markers.push(newMarker);
    }

    console.log(this.markers);
    // centerise map to marker
    this.map.panTo(coordinates);

  }

  addressChanged(address: any, i: number) {
    this.infoWindow.close();
    this.locationFields[i].address = address;
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

    }
    else if (i > 0 && i < this.lastLocation()) {
      const stopAddLat = address.geometry.location.lat();
      const stopAddLng = address.geometry.location.lng();

      this.coordinates = new google.maps.LatLng(stopAddLat, stopAddLng);

      // debugger;
      let oldStopAddLat;
      if (this.stopCoordinates.length) {
        oldStopAddLat = this.stopCoordinates[i - 1];
        if (oldStopAddLat) {
          this.stopCoordinates.splice(i - 1, 1, { stopAddLat, stopAddLng });
          this.markers[i].setMap(null);
          this.markers.splice(i, 1);
          // this.setmarker(this.coordinates, i);
          const newMarker = new google.maps.Marker({
            position: this.coordinates
          });
          this.markers.splice(i, 0, newMarker);
          this.map.panTo(this.coordinates);
          this.initMarkers();
          this.waypts.splice(i - 1, 1, {
            location: this.coordinates,
            stopover: true,
          });
        }
        else {
          this.stopCoordinates.push({ stopAddLat, stopAddLng });
          this.setmarker(this.coordinates, i);
          this.initMarkers();
          this.waypts.push({
            location: this.coordinates,
            stopover: true,
          });
        }
      }
      else {
        this.stopCoordinates.push({ stopAddLat, stopAddLng });
        this.setmarker(this.coordinates, i);
        this.initMarkers();
        this.waypts.push({
          location: this.coordinates,
          stopover: true,
        });
      }
    }
    else if (i == this.lastLocation()) {
      const oldDropAddLat = this.dropAddLat;
      this.dropAddLat = address.geometry.location.lat();
      this.dropAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.dropAddLat, this.dropAddLng);
      this.setmarker(this.coordinates, i);
      if (oldDropAddLat) {
        if (this.pickAddLat) {
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

    }
    this.infoWindow.open(this.map, this.markers[i]);
    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
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
    this.stopCoordinates.splice(i - 1, 1);
    this.markers[i].setMap(null);
    this.markers.splice(i, 1);
    this.waypts.splice(i - 1, 1);
    this.initMarkers();
    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
  }

  addStop() {
    const newStop = { name: 'stopLocation', value: '', address: '' };
    const toIndex = this.lastLocation();
    this.locationFields.splice(toIndex, 0, newStop);

  }

  listOrderChanged($event: any) {
    console.log($event);
  }
}
