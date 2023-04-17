import {Component, inject, OnInit} from '@angular/core';
import {Functions, httpsCallableData} from "@angular/fire/functions";
import {AnalysisData} from "../../../functions/src/types/analysis-data";
import {collection, Firestore, getDocs, limit, orderBy, query, startAt} from "@angular/fire/firestore";
import {environment} from "../../environments/environment";
import {GoogleNewsArticle} from "../../../functions/src/types/google-news-rss";

interface Headline {
  text: string;
  origin: string;
  link: string;
  pubDate: Date;
}

@Component({
  selector: 'app-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss']
})
export class MonitorComponent implements OnInit {
  private functions: Functions = inject(Functions);
  private db: Firestore = inject(Firestore);

  analysis?: AnalysisData;
  headlines?: Headline[];

  isFinished = false;
  isLoading = true;
  useEmulator = environment.useEmulator;

  constructor() {
  }

  async ngOnInit() {
    if (environment.useEmulator) {
      this.analysis = await this.fetchFreshAnalysis();
    } else {
      this.analysis = await this.fetchCachedAnalysis();
    }
    this.headlines = this.analysis?.articles.map(a => this.convertArticleToHeadline(a));
  }

  onRefresh() {
    location.reload();
  }

  async onManualFetch() {
    this.isFinished = false;
    this.isLoading = true;
    this.analysis = undefined;
    this.headlines = undefined;

    this.analysis = await this.fetchFreshAnalysis();
    this.headlines = this.analysis?.articles.map(a => this.convertArticleToHeadline(a));
  }

  async fetchCachedAnalysis() {
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

  async fetchFreshAnalysis() {
    const analyze = httpsCallableData<unknown, AnalysisData>(this.functions, 'analyze');
    return analyze({ }).toPromise();
  }

  convertArticleToHeadline(article: GoogleNewsArticle): Headline {
    const { text, origin } = this.separateHeadlineAndOrigin(article.title);
    const pubDate = new Date(article.pubDate);
    const link = article.link;
    return { text, origin, pubDate, link }
  }

  separateHeadlineAndOrigin(input: string): { text: string; origin: string } {
    const delimiter = " - ";
    const delimiterIndex = input.lastIndexOf(delimiter);

    if (delimiterIndex === -1) {
      throw new Error("Invalid input format. Expected format: 'Headline - Origin'");
    }

    return {
      text: input.slice(0, delimiterIndex).trim(),
      origin: input.slice(delimiterIndex + delimiter.length).trim(),
    };
  }
}
