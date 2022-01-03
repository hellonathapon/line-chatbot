const express = require("express");
const port = process.env.PORT || 5000;
const line = require("@line/bot-sdk");
const middleware = require("@line/bot-sdk").middleware;
require("dotenv").config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const app = express();

// webhook server
app.post("/webhook", middleware(config), (req, res) => {
  // console.log(req.body.events[0].message);
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

function handleEvent(e) {
  // if event is invalid type
  if (e.type !== "message" || e.message.type !== "text") {
    return Promise.resolve(null);
  }
  // replytoken(userToken, {text})
  return client.replyMessage(e.replyToken, {
    type: "text",
    text: e.message.text,
  });
}

// TODO: error handler

// TODO: prod. logger
app.listen(port, () => console.log(`Server is running in port ${port}`));
