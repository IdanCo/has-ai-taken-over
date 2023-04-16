import {Timestamp} from "firebase-admin/firestore";
import {OpenAiResponse} from "./openai-response";
import {GoogleNewsArticle} from "./google-news-rss";

export interface AnalysisData {
  articles: GoogleNewsArticle[],
  openAiResponse: OpenAiResponse,
  timestamp: Timestamp,
}
