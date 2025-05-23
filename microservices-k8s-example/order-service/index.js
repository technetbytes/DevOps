const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json([{ message: "Hello from Order Service" }]);
});

app.listen(PORT, () => {
  console.log("Order Service running on port", PORT);
});
