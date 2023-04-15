import { Timestamp } from "firebase-admin/firestore";
import {NewsApiResponse} from "./news-api-response";
import {OpenAiResponse} from "./openai-response";

export interface AnalysisData {
  newsApiResponse: NewsApiResponse,
  openAiResponse: OpenAiResponse,
  timestamp: Timestamp,
}
