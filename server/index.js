import { load } from "cheerio";
import axios from "axios";
import { buildSchema } from "graphql";
import express from "express";
import expressPlayground from "graphql-playground-middleware-express";
import { graphqlHTTP } from "express-graphql";
import mapping from "./mapping.json" assert { type: "json" };

const app = express();
const port = 4000;
const baseUrl = "https://coinmarketcap.com/";
const graphQlPlayground = expressPlayground.default;

const schema = buildSchema(`
  type ExRate {
    id: Int!
    name: String!
    dailyHighPrice: Float!
    dailyLowPrice: Float!
    currentPrice: Float!
  }
  type Query {
    price(id: Int!): ExRate
  }
`);

const resolvers = {
  price: async ({ id }) => {
    const name = mapping[id].name;
    let priceData;
    let price = null;
    try {
      priceData = await axios.get(`${baseUrl}currencies/${name}/markets/`);
    } catch (e) {
      console.log(e);
    }

    if (priceData) {
      const $ = load(priceData.data);

      let currentPrice = $("div.priceValue > span").text();
      currentPrice = parseFloat(currentPrice.substring(1, currentPrice.length));

      let dailyHighPrice = $(
        "div.sc-1prm8qw-0.gtqyUe > span.n78udj-5.dBJPYV > span"
      ).text();
      dailyHighPrice = parseFloat(
        dailyHighPrice.substring(1, dailyHighPrice.length)
      );

      let dailyLowPrice = $(
        "div.sc-1prm8qw-0.fCbTtB > span.n78udj-5.dBJPYV > span"
      ).text();
      dailyLowPrice = parseFloat(
        dailyLowPrice.substring(1, dailyLowPrice.length)
      );

      price = {
        id,
        name,
        dailyHighPrice,
        dailyLowPrice,
        currentPrice,
      };

      return price;
    }
  },
};

app.use(
  "/graphql",
  graphqlHTTP((req) => ({
    schema,
    rootValue: resolvers,
    context: {
      request: req,
    },
  }))
);

app.get("/", graphQlPlayground({ endpoint: "/graphql" }));

app.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}/graphql`);
});
