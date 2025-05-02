const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const questionRoutes = require("./routes/question.routes");
const answerRoutes = require("./routes/answer.routes");
const roomRoutes = require("./routes/room.routes");
const commentRoutes = require("./routes/comment.routes");
const leaderBoardRoutes = require("./routes/leaderBoard.routes");


app.get("/api/ping", (req, res) => {
    console.log("Pinged at", new Date().toISOString());
    res.status(200).send("pong");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/leaderboard", leaderBoardRoutes)

module.exports = app;
