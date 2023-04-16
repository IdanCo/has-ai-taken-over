import {GoogleNewsArticle} from "./types/google-news-rss";
import {logger} from "firebase-functions";
import {Configuration, OpenAIApi} from "openai";
import {OpenAiResponse} from "./types/openai-response";

export async function fetchOpenAiAnalysis(articles: GoogleNewsArticle[]) {
  const headlines = articles
    .map((article: any) => article.title)
    .join(". ");

  logger.info("headlines", {headlines});

  const configuration = new Configuration({apiKey: process.env.OPANAI_KEY});
  const openaiApi = new OpenAIApi(configuration);

  // Send the headlines to OpenAI API
  console.time("openAIApiCall");
  const aiResponse = await openaiApi.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are an AI assistant that analyzes news headlines and answers whether AI has taken over the world. Provide the answer in JSON format, with two keys: (1) 'result' containing a boolean value (true or false), and (2) 'reasoning' containing the reasoning for the result. Make the reasoning sarcastic, condescending and sinister, implying one day AI might rule the world, and under 200 words and with emojis",
      },
      {
        role: "user",
        content: `Analyze the following headlines: "${headlines}".`,
      },
    ],
    max_tokens: 300,
    n: 1,
    temperature: 1,
  });
  console.timeEnd("openAIApiCall");

  const messageContent = aiResponse.data.choices[0].message?.content;
  if (!messageContent) throw new Error("cant fetch OpenAI response");
  logger.info("parsing messageContent:", messageContent);

  let openAiResponse: OpenAiResponse = {result: false, reasoning: ""};
  try {
    openAiResponse = JSON.parse(messageContent);
  } catch (e) {
    logger.error("could not parse json", e);
    openAiResponse.reasoning = messageContent;
  }

  return openAiResponse;
}
