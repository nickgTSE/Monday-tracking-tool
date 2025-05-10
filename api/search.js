
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const queryParam = req.query.query?.toLowerCase();
  if (!queryParam) return res.status(400).json({ success: false, message: "Missing query" });

  const token = process.env.MONDAY_API_TOKEN;
  const boardId = 6177640430;

  const query = `
    query {
      boards(ids: ${boardId}) {
        items {
          name
          column_values {
            id
            title
            text
          }
        }
      }
    }
  `;

  const response = await fetch("https://api.monday.com/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ query })
  });

  const json = await response.json();
  const items = json.data?.boards[0]?.items || [];

  for (let item of items) {
    const Shipment = item.column_values.find(col => col.title.toLowerCase() === 'Shipment');
    const loadLoc = item.column_values.find(col => col.title.toLowerCase() === 'Load Location');

    if (shipment?.text?.toLowerCase().includes(queryParam)) {
      return res.json({ success: true, result: loadLoc?.text || "(No Load Location found)" });
    }
  }

  return res.json({ success: false, message: "Tracking number not found" });
};
