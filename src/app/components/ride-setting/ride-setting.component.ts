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
  markers: any[] = [];
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  labelIndex = 0;
  // marker = new google.maps.Marker({
  //   position: this.coordinates,
  //   map: this.map,
  // });

  infoWindow = new google.maps.InfoWindow();
  // InforObj: google.maps.InfoWindow[] = [];

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
  contents: any[] = [];
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
    else if (i > 0 && i < this.lastLocation()) {
      // if (this.markers.length < this.locationFields.length) {

      // }
      this.markers[i]?.setMap(null);
      this.markers[i] = newMarker;
      this.contents[i] = content;
      // this.markers.splice(this.lastLocation() - 1, 0, newMarker);
      // this.contents.splice(this.lastLocation() - 1, 0, content);
      // this.markers[this.lastLocation()].setLabel(this.labels[this.lastLocation()])
      // this.contents[this.lastLocation()] = this.contents[this.lastLocation()]
    }
    else if (i == this.lastLocation()) {
      // if (i != 1 && this.locationFields[i - 1].value == '') {
      //   this.markers[i - 1].setMap(null);
      //   this.markers[i - 1] = new google.maps.Marker({});
      //   this.contents[i - 1] = '';
      // }
      // else {
      //   this.markers[i]?.setMap(null);
      //   this.markers[i] = newMarker;
      //   this.contents[i] = content;
      //   console.log(this.markers);
      // }
      this.markers[i]?.setMap(null);
      this.markers[i] = newMarker;
      this.contents[i] = content;
      console.log(this.markers);
      // this.markers.push(newMarker);
      // this.contents.push(content);
    }

    // console.log(this.markers);
    // centerise map to marker
    this.map.panTo(coordinates);

  }

  setMarkerClickEvent() {
    this.markers.map((mark, i) => {
      google.maps.event.clearListeners(mark, 'click');
      mark?.addListener('click', () => {
        this.infoWindow.close();
        console.log(this.contents[i], i);
        this.infoWindow.setContent(this.contents[i]);
        this.infoWindow.open(this.map, this.markers[i]);
      })
    })
  }

  addressChanged = async (address: any, i: number) => {
    this.infoWindow.close();
    this.locationFields[i].address = address;
    this.locationFields[i].value = this.locationFields[i].address.formatted_address;

    if (i == 0) {
      // const oldPickAddLat = this.pickAddLat;
      this.pickAddLat = address.geometry.location.lat();
      this.pickAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.pickAddLat, this.pickAddLng);
      this.setmarker(this.coordinates, i);
      this.initMarkers();

    }
    else if (i > 0 && i < this.lastLocation()) {
      const stopAddLat = address.geometry.location.lat();
      const stopAddLng = address.geometry.location.lng();

      this.coordinates = new google.maps.LatLng(stopAddLat, stopAddLng);
      this.stopCoordinates[i - 1] = { stopAddLat, stopAddLng };
      this.setmarker(this.coordinates, i);
      this.initMarkers();
      this.waypts[i - 1] = { location: this.coordinates, stopover: true, };
      // debugger;
      let oldStopAddLat;
      // if (this.stopCoordinates.length) {
      //   oldStopAddLat = this.stopCoordinates[i - 1];
      //   if (oldStopAddLat) {
      //     this.stopCoordinates.splice(i - 1, 1, { stopAddLat, stopAddLng });
      //     this.markers[i].setMap(null);
      //     this.markers.splice(i, 1);
      //     this.contents.splice(i, 1);
      //     // this.setmarker(this.coordinates, i);

      //     const newMarker = new google.maps.Marker({
      //       position: this.coordinates
      //     });
      //     this.markers.splice(i, 0, newMarker);
      //     const content = '<div><strong>' + this.locationFields[i].address.formatted_address + '</strong><br>';
      //     this.contents.splice(i, 0, content);
      //     this.map.panTo(this.coordinates);
      //     this.initMarkers();
      //     this.waypts.splice(i - 1, 1, {
      //       location: this.coordinates,
      //       stopover: true,
      //     });
      //   }
      //   else {
      //     this.stopCoordinates.push({ stopAddLat, stopAddLng });
      //     this.setmarker(this.coordinates, i);
      //     this.initMarkers();

      //     this.waypts.push({
      //       location: this.coordinates,
      //       stopover: true,
      //     });
      //   }
      // }
      // else {
      //   this.stopCoordinates[i - 1] = { stopAddLat, stopAddLng };
      //   this.setmarker(this.coordinates, i);
      //   this.initMarkers();
      //   this.waypts.push({
      //     location: this.coordinates,
      //     stopover: true,
      //   });
      // }
    }
    else if (i == this.lastLocation()) {
      const oldDropAddLat = this.dropAddLat;
      this.dropAddLat = address.geometry.location.lat();
      this.dropAddLng = address.geometry.location.lng();
      this.coordinates = new google.maps.LatLng(this.dropAddLat, this.dropAddLng);
      this.setmarker(this.coordinates, i);
      this.initMarkers();
      // if (oldDropAddLat) {
      //   if (this.pickAddLat) {
      //     this.markers[this.markers.length - 2].setMap(null);
      //     this.markers.splice((this.markers.length - 2), 1);
      //     console.log(this.markers);
      //     this.initMarkers();
      //   } else {
      //     this.markers[0].setMap(null);
      //     this.markers.shift();
      //     this.initMarkers();
      //   }
      // }
      // else {
      //   this.initMarkers();
      //   // await this.setMarkerClickEvent(i);
      // }
    }
    console.log(this.contents);
    this.infoWindow.setContent(this.contents[i]);
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
        return;
      }
    }
    else {
      return
    }

    console.log(start, end);
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
    this.calculateAndDisplayRoute(this.directionsService, this.directionsDisplay);
  }



  listOrderChanged($event: any) {
    console.log($event);
  }
}
