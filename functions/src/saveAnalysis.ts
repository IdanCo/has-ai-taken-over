import {GoogleNewsArticle} from "./types/google-news-rss";
import {OpenAiResponse} from "./types/openai-response";
import * as Firestore from "@google-cloud/firestore";
import {AnalysisData} from "./types/analysis-data";
const firestore = new Firestore.Firestore();

export async function saveAnalysis(articles: GoogleNewsArticle[], openAiResponse: OpenAiResponse) {
  const date = new Date();
  date.setSeconds(date.getSeconds() + 86400);
  const tomorrowTimestamp = Firestore.Timestamp.fromDate(date);

  // Save the OpenAI response and headlines to Firestore
  const analysisData: AnalysisData = {
    articles,
    openAiResponse,
    // @ts-ignore
    timestamp: Firestore.Timestamp.now(),
    // @ts-ignore
    removeAt: tomorrowTimestamp,
  };

  await firestore.collection("analysis").add(analysisData);

  return analysisData;
}
