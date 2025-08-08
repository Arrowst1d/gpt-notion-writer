const express = require("express");
const { Client } = require("@notionhq/client");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

dotenv.config();

const app = express();
app.use(bodyParser.json());

const notion = new Client({ auth: process.env.NOTION_SECRET });

app.post("/write-to-notion", async (req, res) => {
  let tasks = [];

  // Support both single and multiple task formats
  if (Array.isArray(req.body.tasks)) {
    tasks = req.body.tasks;
  } else if (req.body.title && req.body.content) {
    tasks = [req.body];
  } else {
    return res.status(400).json({ success: false, error: "Invalid task format." });
  }

  const createdPages = [];

  for (const task of tasks) {
    const title = task.title;
    const content = task.content;
    const subject = task.Subject || task.subject || "General";
    const dateInput = task.Date || task.date;
    const formattedDate = dateInput ? new Date(dateInput).toISOString().split("T")[0] : undefined;

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
                multi_select: Array.isArray(subject)
                  ? subject.map(name => ({ name }))
                  : [{ name: subject }]
              }
            : undefined,
          Date: formattedDate
            ? {
                date: {
                  start: formattedDate
                }
              }
            : undefined
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

      createdPages.push(response.id);
    } catch (error) {
      console.error("Error creating task:", title, error.message);
    }
  }

  res.json({ success: true, pages: createdPages });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on port", PORT);
});
