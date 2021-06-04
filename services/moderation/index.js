const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const {
    type,
    data: { id, postId, content }
  } = req.body;

  if (type === "CreateComment") {
    const status = content.includes("orange") ? "rejected" : "approved";

    await axios.post("http://localhost:5000/events", {
      type: "CommentModerated",
      data: {
        id,
        postId,
        content,
        status
      }
    });
  }

  res.send({});
});

app.listen(4002, () => console.log("Listening on 4002"));
