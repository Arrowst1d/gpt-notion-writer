const express = require("express");
const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const notion = new Client({ auth: process.env.NOTION_SECRET });

app.post("/write-to-notion", async (req, res) => {
  const payload = req.body;

  // If this is a bulk request
  if (Array.isArray(payload.tasks)) {
    const results = [];
    for (const task of payload.tasks) {
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
                    content: task.title
                  }
                }
              ]
            },
            Subject: task.Subject
              ? {
                  select: {
                    name: task.Subject
                  }
                }
              : undefined,
            Date: task.Date
              ? {
                  date: {
                    start: task.Date
                  }
                }
              : undefined
          },
          children: task.content
            ? [
                {
                  object: "block",
                  type: "paragraph",
                  paragraph: {
                    rich_text: [
                      {
                        type: "text",
                        text: {
                          content: task.content
                        }
                      }
                    ]
                  }
                }
              ]
            : []
        });
        results.push(response.id);
      } catch (error) {
        console.error("Error writing task:", task.title, error.message);
      }
    }
    return res.json({ success: true, pages: results });
  }

  // Otherwise, treat it as a single task
  const { title, content, Subject, Date } = payload;

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
        },
        Subject: subject
  ? {
      multi_select: subject.split(",").map((item) => ({
        name: item.trim()
      }))
    }
  : undefined,
        Date: Date
          ? {
              date: {
                start: Date
              }
            }
          : undefined
      },
      children: content
        ? [
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
        : []
    });

    res.json({ success: true, pageId: response.id });
  } catch (error) {
    console.error("Error writing to Notion:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port", PORT);
});
