const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json([{ message: "Hello from User Service" }]);
});

app.listen(PORT, () => {
  console.log("User Service running on port", PORT);
});
