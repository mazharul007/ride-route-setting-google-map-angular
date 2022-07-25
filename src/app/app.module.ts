import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { SortablejsModule } from 'ngx-sortablejs';

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
    GooglePlaceModule,
    SortablejsModule.forRoot({ animation: 150 }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
