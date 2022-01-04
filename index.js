const express = require("express");
const port = process.env.PORT || 5000;
const line = require("@line/bot-sdk");
const middleware = require("@line/bot-sdk").middleware;
const { NlpManager } = require("node-nlp");
require("dotenv").config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

// initiate nlp
const manager = new NlpManager({ languages: ["en"] });
manager.load();

app.post("/webhook", middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});
// request body parser middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

const client = new line.Client(config);

async function handleEvent(e) {
  // if event is invalid type
  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }
  // pass user text to ML process and waiting for reasonable response
  const response = await manager.process("en", e.message.text);
  // replytoken(userToken, {text})
  return client.replyMessage(e.replyToken, {
    type: "text",
    text: response.answer,
  });
}

// TODO: error handler

// TODO: prod. logger
app.listen(port, () => console.log(`Server is running in port ${port}`));
