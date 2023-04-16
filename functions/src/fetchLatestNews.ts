import axios from "axios";
import {Parser} from "xml2js";
import {GoogleNewsArticle} from "./types/google-news-rss";
import {logger} from "firebase-functions";

export async function fetchLatestNews() {
  // Fetch the latest AI headlines
  console.time("fetchingNewsHeadlines");
  const googleNewsUrl = "https://news.google.com/rss/topics/CAAqKggKIiRDQkFTRlFvSUwyMHZNRGRqTVhZU0JXVnVMVWRDR2dKSlRDZ0FQAQ/sections/CAQiR0NCQVNMd29JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVENJTkNBUWFDUW9ITDIwdk1HMXJlaW9KRWdjdmJTOHdiV3Q2S0FBKi4IACoqCAoiJENCQVNGUW9JTDIwdk1EZGpNWFlTQldWdUxVZENHZ0pKVENnQVABUAE?hl=en-US";
  const newsResponse = await axios.get(googleNewsUrl, {responseType: "text"});
  console.timeEnd("fetchingNewsHeadlines");

  const parser = new Parser();
  const parsedXml = await parser.parseStringPromise(newsResponse.data);
  const allItems = parsedXml.rss.channel[0].item as [];
  const randomItems = getRandomElements(allItems, 10);
  const articles: GoogleNewsArticle[] = randomItems
    .map((article: any) => ({title: article.title[0], link: article.link[0], pubDate: article.pubDate[0]}));
  logger.info("articles", {articles});

  return articles;
}

function getRandomElements(arr: any[], count: number) {
  const result = [];
  const tempArray = arr.slice(); // Create a copy of the original array to avoid modifying it

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    const randomElement = tempArray.splice(randomIndex, 1)[0];
    result.push(randomElement);
  }

  return result;
}
