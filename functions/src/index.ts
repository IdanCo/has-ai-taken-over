import * as functions from "firebase-functions";
import axios from "axios";
import { Configuration, OpenAIApi } from 'openai';
import * as Firestore from '@google-cloud/firestore';
import {logger} from "firebase-functions";
import {NewsApiResponse} from "./types/news-api-response";
import {OpenAiResponse} from "./types/openai-response";
import {AnalysisData} from "./types/analysis-data";

const firestore = new Firestore.Firestore();

export const analyze = functions
  .runWith({ secrets: ["OPANAI_KEY", 'NEWSAPI_KEY'] })
  .https.onCall(async (data, context) => {
    // Fetch the latest AI headlines
    const newsAPIKey = process.env.NEWSAPI_KEY;
    const newsAPIUrl = `https://newsapi.org/v2/everything?q=Artificial%20Intelligence&pageSize=10&sortBy=relevancy&apiKey=${newsAPIKey}`;
    const newsResponse = await axios.get<NewsApiResponse>(newsAPIUrl);
    logger.info('news data', newsResponse.data);
    const headlines = newsResponse.data.articles.map((article: any) => article.title).join('. ');
    logger.info('headlines', headlines);

    const configuration = new Configuration({ apiKey: process.env.OPANAI_KEY });
    const openaiApi = new OpenAIApi(configuration);

    // Send the headlines to OpenAI API
    const aiResponse = await openaiApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes news headlines regarding AI and gives a single answer whether AI has taken over the world. Answer in json { result: boolean, reasoning: string }. Make the reasoning sarcastic and condescending. Be sinister, implying one day AI might rule the world. Use emojis",
        },
        {
          role: "user",
          content: `Analyze the following headlines: "${headlines}".`,
        },
      ],
      max_tokens: 300,
      n: 1,
      temperature: 0.9,
    });

    const messageContent = aiResponse.data.choices[0].message?.content;
    if (!messageContent) return;
    console.info('parsing messageContent:', messageContent)
    const openAiResponse: OpenAiResponse = JSON.parse(messageContent);

    // Save the OpenAI response and headlines to Firestore
    const analysisData: AnalysisData = {
      newsApiResponse: newsResponse.data,
      openAiResponse,
      timestamp: Firestore.Timestamp.now(),
    };

    await firestore.collection('analysis').add(analysisData);

    return analysisData;
});
