import {Component, inject, OnInit} from '@angular/core';
import {Functions, httpsCallableData} from "@angular/fire/functions";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  private functions: Functions = inject(Functions);

  constructor() {
  }

  ngOnInit() {
    const yadaFunction = httpsCallableData(this.functions, 'addNumbers');
    yadaFunction({ number1: 4, number2: 7 }).toPromise().then(res => console.info(res));
  }

}
