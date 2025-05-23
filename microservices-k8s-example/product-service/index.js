const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json([{ message: "Hello from Product Service" }]);
});

app.listen(PORT, () => {
  console.log("Product Service running on port", PORT);
});
