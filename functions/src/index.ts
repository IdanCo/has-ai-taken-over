import * as functions from "firebase-functions";
import {fetchLatestNews} from "./fetchLatestNews";
import {fetchOpenAiAnalysis} from "./fetchOpenAiAnalysis";
import {saveAnalysis} from "./saveAnalysis";

export const scheduledAnalysis = functions
  .runWith({secrets: ["OPANAI_KEY"]})
  .pubsub.schedule("every 1 minutes").onRun(async (context) => {
    const articles = await fetchLatestNews();
    const openAiResponse = await fetchOpenAiAnalysis(articles)
    await saveAnalysis(articles, openAiResponse);
  })

export const analyze = functions
  .runWith({
    secrets: ["OPANAI_KEY"],
    maxInstances: 2,
  })
  .https.onCall(async (data, context) => {
    const articles = await fetchLatestNews();
    const openAiResponse = await fetchOpenAiAnalysis(articles)
    const analysisData = saveAnalysis(articles, openAiResponse);

    return analysisData;
  });
