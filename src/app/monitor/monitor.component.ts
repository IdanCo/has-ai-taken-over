import {Component, inject, OnInit} from '@angular/core';
import {Functions, httpsCallableData} from "@angular/fire/functions";
import {AnalysisData} from "../../../functions/src/types/analysis-data";
import {collection, Firestore, getDocs, limit, orderBy, query, startAt} from "@angular/fire/firestore";
import {Subject} from "rxjs";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  private functions: Functions = inject(Functions);
  private db: Firestore = inject(Firestore);
  result$: Subject<AnalysisData | undefined> = new Subject<AnalysisData | undefined>();
  res?: AnalysisData;
  headlines?: string[];
  isFinished = false;
  showInput = false;
  isLoading = true;
  useEmulator = environment.useEmulator;

  constructor() {
    if (environment.useEmulator) {
      this.manualRun();
    } else {
      this.fetchRandomDocumentByLastHour().then(res => {
        this.res = res;
        this.headlines = res?.articles.map(a => a.title);
      });
    }
  }

  ngOnInit() {
  }

  onFinish() {
    this.isFinished = true;
  }

  refresh() {
    location.reload();
  }

  async fetchRandomDocumentByLastHour() {
    const now = Date.now();
    const oneHourAgo = now - 3600 * 1000; // Subtract one hour (3600 seconds) in milliseconds
    const randomTimestamp = new Date(oneHourAgo + Math.random() * 3600 * 1000); // Generate a random timestamp within the last hour

    const collectionRef = collection(this.db, 'analysis');

    const q = query(
      collectionRef,
      orderBy('timestamp'),
      startAt(randomTimestamp),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No documents found in the last hour.");
    }

    const randomDocSnapshot = querySnapshot.docs[0];

    return randomDocSnapshot.data() as AnalysisData;
  }

  async manualRun() {
    this.isLoading = true;
    this.res = undefined;

    const analyze = httpsCallableData<unknown, AnalysisData>(this.functions, 'analyze');
    this.res = await analyze({ }).toPromise()
    this.headlines = this.res?.articles.map(a => a.title);
  }
}
