import * as functions from "firebase-functions";
import axios from "axios";
import { Configuration, OpenAIApi } from 'openai';
import * as Firestore from '@google-cloud/firestore';
import {logger} from "firebase-functions";
import {OpenAiResponse} from "./types/openai-response";
import {AnalysisData} from "./types/analysis-data";
import {Parser} from "xml2js";
import {GoogleNewsArticle} from "./types/google-news-rss";

const firestore = new Firestore.Firestore();

export const analyze = functions
  .runWith({ secrets: ["OPANAI_KEY", 'NEWSAPI_KEY'] })
  .https.onCall(async (data, context) => {
    // Fetch the latest AI headlines
    const googleNewsUrl = 'https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRDZ0FQAQ/sections/CAQiR0NCQVNMd29JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVENJTkNBUWFDUW9ITDIwdk1HMXJlaW9KRWdjdmJTOHdiV3Q2S0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVENnQVABUAE?hl=en-US';
    const newsResponse = await axios.get(googleNewsUrl, { responseType: 'text' });

    const parser = new Parser();
    const parsedXml = await parser.parseStringPromise(newsResponse.data);
    const articles: GoogleNewsArticle[] = (parsedXml.rss.channel[0].item as [])
      .slice(0, 10)
      .map((article: any) => ({ title: article.title[0], link: article.link[0], pubDate: article.pubDate[0] }))
    logger.info('articles', {articles})

    const headlines = articles
      .map((article: any) => article.title)
      .join('. ');

    logger.info('headlines', {headlines})

    const configuration = new Configuration({ apiKey: process.env.OPANAI_KEY });
    const openaiApi = new OpenAIApi(configuration);

    // Send the headlines to OpenAI API
    const aiResponse = await openaiApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes news headlines and gives a single answer whether AI has taken over the world. Answer in json { "result": boolean, "reasoning": string }. Make the reasoning sarcastic and condescending. Be sinister, implying one day AI might rule the world. Use emojis`,
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
      articles,
      openAiResponse,
      timestamp: Firestore.Timestamp.now(),
    };

    await firestore.collection('analysis').add(analysisData);

    return analysisData;
});
