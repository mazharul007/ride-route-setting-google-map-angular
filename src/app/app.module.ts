import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

import { AppComponent } from './app.component';
import { RideSettingComponent } from './components/ride-setting/ride-setting.component';

@NgModule({
  declarations: [
    AppComponent,
    RideSettingComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    GooglePlaceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
