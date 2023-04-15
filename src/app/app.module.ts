import {APP_INITIALIZER, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import {provideFunctions, getFunctions, Functions, connectFunctionsEmulator} from '@angular/fire/functions';
import { MonitorComponent } from './monitor/monitor.component';
import {NgxTypedJsModule} from "ngx-typed-js";

@NgModule({
  declarations: [
    AppComponent,
    MonitorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgxTypedJsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulator) {
        connectFunctionsEmulator(functions, 'localhost', 5001)
      }
      return functions
    }),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
