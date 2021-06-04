const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const id = randomBytes(4).toString("hex");

  const { content } = req.body;

  const comment = commentsByPostId[req.params.id] || [];

  comment.push({
    id,
    content,
    status: "pending"
  });

  commentsByPostId[req.params.id] = comment;

  await axios.post("http://localhost:5000/events", {
    type: "CreateComment",
    data: {
      id,
      content,
      postId: req.params.id,
      status: "pending"
    }
  });

  res.status(201).send(comment);
});

app.post("/events", async (req, res) => {
  const {
    type,
    data: { id, postId, content, status }
  } = req.body;

  if (type === "CommentModerated") {
    const comments = commentsByPostId[postId];

    const findedComment = comments.find(comment => comment.id === id);

    findedComment.status = status;

    await axios.post("http://localhost:5000/events", {
      type: "CommentUpdated",
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

app.listen(4001, () => console.log("Listening on 4001"));
