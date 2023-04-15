import {Component, inject, OnInit} from '@angular/core';
import {Functions, httpsCallableData} from "@angular/fire/functions";
import {AnalysisData} from "../../../functions/src/types/analysis-data";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  private functions: Functions = inject(Functions);
  res?: AnalysisData;

  constructor() {
  }

  ngOnInit() {
    const yadaFunction = httpsCallableData<unknown, AnalysisData>(this.functions, 'analyze');
    yadaFunction({ }).toPromise().then(res => {
      console.info(res);
      this.res = res
    });
  }

}
