import {OpenAiResponse} from "./openai-response";
import {GoogleNewsArticle} from "./google-news-rss";
import { Timestamp } from "firebase/firestore";

export interface AnalysisData {
  articles: GoogleNewsArticle[],
  openAiResponse: OpenAiResponse,
  timestamp: Timestamp,
  removeAt: Timestamp,
}
