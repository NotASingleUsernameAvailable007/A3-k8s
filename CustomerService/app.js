const express = require('express');
const bodyParser = require('body-parser');
const STATUS_CODES = require('./httpStatusCodes');
const mysql = require('mysql2/promise');
// const STATUS_CODES = require('./httpStatusCodes');
const dbConfig = require('./dbconfig');
// const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');
const { sendCustomerRegisteredEvent } = require('./producer');
const app = express();
const port = 3000; 

app.use(bodyParser.json());

app.get('/status', (req, res) => {
    console.log('Coming to status customer service')
    res.status(200).send('OK');
});


app.post('/customers', async (req, res) => {
    const { userId, name, phone, address, address2, city, state, zipcode } = req.body;
    console.log('coming to post /customers')
    // Validate mandatory fields (note: 'address2' is optional)
    if (!userId || !name || !phone || !address || !city || !state || !zipcode) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "All fields are required, except 'address2'" });
    }

    // Validate email and state (basic validation examples)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid email format" });
    }
    if (state.length !== 2) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "State must be a 2-letter abbreviation" });
    }

    // Database operation
    try {
        const connection = await mysql.createConnection(dbConfig);
        // Check if userId already exists
        const [existing] = await connection.execute('SELECT userId FROM customers WHERE userId = ?', [userId]);

        if (existing.length > 0) {
            await connection.end();
            return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({ message: "This user ID already exists in the system." });
        }

        // Insert new customer
        const [result] = await connection.execute(
            'INSERT INTO customers (userId, name, phone, address, address2, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, name, phone, address, address2, city, state, zipcode]
        );

        const customerData = {
            id: result.insertId,
            userId,
            name,
            phone,
            address,
            address2,
            city,
            state,
            zipcode
        };
        
        // Send the customer registered event to Kafka
        await sendCustomerRegisteredEvent(customerData);

        await connection.end();

        const newId = result.insertId;  // Assuming 'id' is an auto-increment field in your customers table
        res.status(STATUS_CODES.CREATED)
           .location(`${req.protocol}://${req.get('host')}/customers/${newId}`)
           .json({ id: newId, userId, name, phone, address, address2, city, state, zipcode });

    } catch (error) {
        console.error('Database operation failed /customers', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});


//route for retrieving a customer by ID
app.get('/customers/:id', async (req, res) => {
    console.log('coming /customers/:id')

    const { id } = req.params; // Extracting id from the request parameters

    // Validate that the id is a numeric value
    if (isNaN(id)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid ID format" });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [customers] = await connection.execute('SELECT * FROM customers WHERE id = ?', [id]);

        await connection.end();

        if (customers.length > 0) {
            res.status(STATUS_CODES.OK).json(customers[0]); // Return the first (and should be only) customer with that ID
        } else {
            res.status(STATUS_CODES.NOT_FOUND).json({ message: "Customer ID does not exist in the system" });
        }
    } catch (error) {
        console.error('Database operation failed /customers/:id', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});

//route for retrieving a customer by user ID
app.get('/customers', async (req, res) => {
    console.log('coming /customers get')

    const { userId } = req.query; // Extracting userId from the request query parameters

    // Validate that the userId is provided
    if (!userId) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "User ID is required" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userId)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid email format" });
    }

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [customers] = await connection.execute('SELECT * FROM customers WHERE userId = ?', [userId]);

        await connection.end();

        if (customers.length > 0) {
            res.status(STATUS_CODES.OK).json(customers[0]); // Return the first (and should be only) customer with that userId
        } else {
            res.status(STATUS_CODES.NOT_FOUND).json({ message: "User ID does not exist in the system" });
        }
    } catch (error) {
        console.error('Database operation failed /customers', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Customer Server running at ${port}`);
});
