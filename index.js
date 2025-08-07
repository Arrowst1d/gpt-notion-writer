const express = require("express");
const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const notion = new Client({ auth: process.env.NOTION_SECRET });

app.post("/write-to-notion", async (req, res) => {
  const { title, content } = req.body;

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: title
              }
            }
          ]
        }
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: content
                }
              }
            ]
          }
        }
      ]
    });

    res.json({ success: true, pageId: response.id });
  } catch (error) {
    console.error("Error writing to Notion:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Your GPT-to-Notion robot is alive ✨");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port", PORT);
});
