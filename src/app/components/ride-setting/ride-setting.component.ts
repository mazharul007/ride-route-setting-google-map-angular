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
  pickAddLat: any;
  pickAddLng: any;
  dropAddLat: any;
  dropAddLng: any;
  stopCoordinates: any[] = [];

  locationFields: Array<{ name: string, value: any, address: any }> = [
    { name: 'pickup', value: '', address: '' },
    {
      name: 'dropoff', value: '', address: ''
    }
  ]
  lat = 23.7739397;
  lng = 90.4124768;
  coordinates = new google.maps.LatLng(this.lat, this.lng);
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({ polylineOptions: { strokeColor: "#8DC53E" }, suppressMarkers: true, preserveViewport: true });
  map!: google.maps.Map;
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
  markers: any[] = [];
  contents: any[] = [];
  infoWindow = new google.maps.InfoWindow();
  waypts: google.maps.DirectionsWaypoint[] = [];
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  labelIndex = 0;

  options: Options = {
    animation: 150
  };

  constructor() {
    this.options = {
      onUpdate: (event: any) => {
        this.listOrderChanged(event);
      }
    }
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.mapInitializer();
  }

  lastLocation = (): number => {
    return this.locationFields.length - 1;
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
      this.markers[i]?.setMap(this.map);
      this.markers[i]?.setLabel(this.labels[i]);
      this.directionsDisplay.setMap(this.map);
      this.setMarkerClickEvent();
    }
  }

  setmarker(coordinates: any, i: number) {
    const newMarker = new google.maps.Marker({
      position: coordinates,
      label: this.labels[i]
    });

    const content = '<div><strong>' + this.locationFields[i].address.formatted_address + '</strong><br>';

    if (i == 0) {
      this.markers[0]?.setMap(null);
      this.markers[0] = newMarker;
      this.contents[0] = content;
    }
    else if (i > 0 && i <= this.lastLocation()) {
      this.markers[i]?.setMap(null);
      this.markers[i] = newMarker;
      this.contents[i] = content;
    }

    console.log(this.contents);
    this.map.panTo(coordinates);
  }

  setMarkerClickEvent() {
    this.markers.map((mark, i) => {
      google.maps.event.clearListeners(mark, 'click');
      mark?.addListener('click', () => {
        this.infoWindow.close();
        this.infoWindow.setContent(this.contents[i]);
        this.infoWindow.open(this.map, this.markers[i]);
      })
    })
  }

  addressChanged = (address: any, i: number) => {
    this.infoWindow.close();
    this.locationFields[i].address = address;
    this.locationFields[i].value = this.locationFields[i].address.formatted_address;

    if (i == 0) {
      this.pickAddLat = address.geometry.location.lat();
      this.pickAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.pickAddLat, this.pickAddLng);
      this.setmarker(this.coordinates, i);
      this.initMarkers();

    }
    else if (i > 0 && i < this.lastLocation()) {
      const stopAddLat = address.geometry.location.lat();
      const stopAddLng = address.geometry.location.lng();

      this.stopCoordinates[i - 1] = { stopAddLat, stopAddLng };
      this.coordinates = new google.maps.LatLng(stopAddLat, stopAddLng);
      this.setmarker(this.coordinates, i);
      this.initMarkers();
      this.waypts[i - 1] = { location: this.coordinates, stopover: true, };
    }
    else if (i == this.lastLocation()) {
      this.dropAddLat = address.geometry.location.lat();
      this.dropAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.dropAddLat, this.dropAddLng);
      this.setmarker(this.coordinates, i);
      this.initMarkers();
    }

    this.infoWindow.setContent(this.contents[i]);
    this.infoWindow.open(this.map, this.markers[i]);
    this.calculateAndDisplayRoute(this.directionsDisplay);
    console.log('changed address of ' + i);
  }

  calculateAndDisplayRoute(directionsDisplay: any): void {

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
        return;
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
          console.log(response);
        }
        else {
          window.alert('Directions request failed due to ' + status);
        }
      }
    );

  }

  addStop() {
    const newStop = { name: 'stopLocation', value: '', address: '' };
    const lastIndex = this.lastLocation();
    this.locationFields.splice(lastIndex, 0, newStop);
    this.markers.push(this.markers[lastIndex]);
    this.contents.push(this.contents[lastIndex]);
    this.markers[lastIndex] = new google.maps.Marker({});
    this.contents[lastIndex] = {};
    this.initMarkers();
  }

  removeStop(i: number) {
    this.locationFields = this.locationFields.filter((x, index) => index != i);
    this.stopCoordinates.splice(i - 1, 1);
    this.markers[i].setMap(null);
    this.markers.splice(i, 1);
    this.contents.splice(i, 1);
    this.waypts.splice(i - 1, 1);
    this.initMarkers();
    this.calculateAndDisplayRoute(this.directionsDisplay);
  }



  async listOrderChanged(event: any) {
    console.log(event);
    const oldIndex = event.oldIndex;
    const newIndex = event.newIndex;

    console.log(this.locationFields);

    const oldAddress = this.locationFields[newIndex].address; //uttara
    const newAddress = this.locationFields[oldIndex].address; //motijheel
    // await this.addressChanged(newAddress, oldIndex);
    // setTimeout(() => {
    //   this.addressChanged(oldAddress, newIndex);
    // }, 1600);

    const differece = Math.abs(oldIndex - newIndex);

    if (differece == 1) {
      await this.changeDirection(oldIndex, newAddress);
      await this.changeDirection(newIndex, oldAddress);
    }

    // console.log(this.contents);

    this.initMarkers();
    this.infoWindow.setContent(this.contents[newIndex]);
    this.infoWindow.open(this.map, this.markers[newIndex]);
    this.calculateAndDisplayRoute(this.directionsDisplay);
    // this.calculateAndDisplayRoute(this.directionsDisplay);
  }

  changeDirection(i: number, address: any) {
    if (i == 0) {
      this.pickAddLat = address.geometry.location.lat();
      this.pickAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.pickAddLat, this.pickAddLng);
      this.setmarker(this.coordinates, i);
      console.log(this.contents);
    }
    else if (i > 0 && i < this.lastLocation()) {
      const stopAddLat = address.geometry.location.lat();
      const stopAddLng = address.geometry.location.lng();
      this.stopCoordinates[i - 1] = { stopAddLat, stopAddLng };
      this.coordinates = new google.maps.LatLng(stopAddLat, stopAddLng);
      this.setmarker(this.coordinates, i);
      this.waypts[i - 1] = { location: this.coordinates, stopover: true, };
    }
    else if (i == this.lastLocation()) {
      this.dropAddLat = address.geometry.location.lat();
      this.dropAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.dropAddLat, this.dropAddLng);
      this.setmarker(this.coordinates, i);
      console.log(this.contents);
    }
  }
}
