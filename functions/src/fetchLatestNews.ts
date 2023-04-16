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
  const articles: GoogleNewsArticle[] = (parsedXml.rss.channel[0].item as [])
    .slice(0, 10)
    .map((article: any) =>
      ({title: article.title[0], link: article.link[0], pubDate: article.pubDate[0]}));
  logger.info("articles", {articles});

  return articles;
}
