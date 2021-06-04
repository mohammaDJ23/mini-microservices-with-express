const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(bodyParser.json());
app.use(cors());

const posts = {};

function handleEvents(type, data) {
  switch (type) {
    case "CreatePost": {
      const { id, title } = data;

      posts[id] = {
        id,
        title,
        comments: []
      };

      break;
    }

    case "CreateComment": {
      const { id, postId, content, status } = data;

      posts[postId].comments.push({
        id,
        content,
        status
      });

      break;
    }

    case "CommentUpdated": {
      const { id, postId, content, status } = data;

      const post = posts[postId];

      const comments = post.comments.find(comment => comment.id === id);

      comments.status = status;
      comments.content = content;

      break;
    }
  }
}

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;

  handleEvents(type, data);

  res.send({});
});

app.listen(4004, async () => {
  console.log("Listening on 4004");

  const res = await axios.get("http://localhost:5000/events");

  for (const event of res.data) {
    handleEvents(event.type, event.data);
  }
});
