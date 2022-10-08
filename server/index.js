/* Example in Node.js */
import axios from "axios";
import { load } from "cheerio";
// import { API_KEY } from "./constants";

let response = null;
new Promise(async (resolve, reject) => {
  try {
    response = await axios.get(
      "https://coinmarketcap.com/currencies/algorand/markets/"
    );
  } catch (ex) {
    response = null;
    // error
    console.log(ex);
    reject(ex);
  }
  if (response) {
    // success
    const $ = load(response.data);
    const algoValueText = $("div.priceValue > span").text() 
    const algoValue = parseFloat(
      algoValueText.substring(1, algoValueText.length)
    );
    console.log(algoValue);
    resolve(algoValue);
  }
});
