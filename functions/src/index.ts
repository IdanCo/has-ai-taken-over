import * as functions from "firebase-functions";
import axios from "axios";
import { Configuration, OpenAIApi } from 'openai';

export const addNumbers = functions
  .runWith({ secrets: ["OPANAI_KEY", 'NEWSAPI_KEY'] })
  .https.onCall(async (data, context) => {
    // Fetch the latest AI headlines
    const newsAPIKey = process.env.NEWSAPI_KEY;
    const newsAPIUrl = `https://newsapi.org/v2/everything?q=AI%20advancement&sortBy=publishedAt&apiKey=${newsAPIKey}`;
    const newsResponse = await axios.get(newsAPIUrl);
    const headlines = newsResponse.data.articles.map((article: any) => article.title).join('. ');

    const configuration = new Configuration({ apiKey: process.env.OPANAI_KEY });
    const openaiApi = new OpenAIApi(configuration);

    console.info(1111, process.env.OPANAI_KEY);

    // Send the headlines to OpenAI API
    const aiResponse = await openaiApi.createChatCompletion({
      model: "gpt-3.5-turbo",
      max_tokens: 50,
      n: 1,
      temperature: 0.7,
      messages: [{role: "user", content: `Analyze the following headlines regarding AI advancement: "${headlines}". Has AI taken over the world? Provide an answer in the following format: { result: boolean; reasoning: string `}],
    });

  return {
    headlines: headlines,
    aiResponse: aiResponse.data,
  };
});
