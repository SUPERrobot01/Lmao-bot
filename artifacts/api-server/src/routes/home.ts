import { Router, type IRouter } from "express";
import { getCount, getWord } from "../bot/counter.js";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  const count = getCount();
  const word = getWord();
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Lmao Bot</title>
  <style>
    body { font-family: sans-serif; background: #23272a; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    h1 { font-size: 3rem; margin-bottom: 0.5rem; }
    p { font-size: 1.2rem; color: #b9bbbe; }
    .counter { font-size: 5rem; font-weight: bold; color: #5865f2; margin: 1rem 0; }
    .word { font-size: 1.5rem; color: #57f287; }
  </style>
</head>
<body>
  <h1>Lmao Bot</h1>
  <p>Currently tracking:</p>
  <div class="word">${word}</div>
  <div class="counter">${count}</div>
  <p>times</p>
</body>
</html>`);
});

export default router;
