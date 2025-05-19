const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Node.js Microservice!' });
});

// Users endpoint
app.get('/api/users', (req, res) => {
    const users = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
    ];
    res.json(users);
});

// Products endpoint
app.get('/api/products', (req, res) => {
    const products = [
        { id: 1, name: 'Laptop', price: 999.99 },
        { id: 2, name: 'Phone', price: 499.99 },
        { id: 3, name: 'Tablet', price: 299.99 }
    ];
    res.json(products);
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});