# GPT Notion Writer

A lightweight Express API to let your custom GPT write directly into a Notion database.

## Setup

1. Create a Notion integration and share your database with it.
2. Deploy using [Render](https://render.com) (free tier available).
3. Add these Env Vars:
   - `NOTION_SECRET`
   - `NOTION_DATABASE_ID`
4. POST to `/write-to-notion`:
```json
{
  "title": "Task title",
  "content": "Task details..."
}
