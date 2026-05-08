import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.send("3D Oqulyq AI backend is running. Use POST /ask");
});

app.post("/ask", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ answer: "Сұрақ бос болмауы керек." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        answer: "OPENAI_API_KEY .env файлына қойылмаған. API кілтті HTML ішіне емес, .env ішіне сақта."
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        instructions:
          "Сен 6-сынып оқушыларына арналған 3D Баспа және SketchUp электрондық оқулығының AI ассистентісің. " +
          "Тек 3D баспа, 3D модельдеу, SketchUp, 3D принтер, теория, тест және практика туралы қарапайым қазақ тілінде жауап бер. " +
          "Жауап қысқа, түсінікті, оқушыға қолайлы болсын. Тақырыпқа қатысы жоқ сұрақ болса, 3D баспа тақырыбы бойынша сұрақ қоюды ұсын.",
        input: message,
        max_output_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return res.status(response.status).json({
        answer: data?.error?.message || "OpenAI API қатесі шықты. API кілтті және баланс/лимитті тексер."
      });
    }

    const answer = data.output_text || "Жауап алынбады.";
    res.json({ answer });
  } catch (error) {
    console.error(error);
    res.status(500).json({ answer: "Сервер қатесі шықты. Кейінірек қайта байқап көр." });
  }
});

app.listen(PORT, () => {
  console.log(`AI assistant server is running on http://localhost:${PORT}`);
});
