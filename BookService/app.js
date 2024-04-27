const express = require('express');
const bodyParser = require('body-parser');
const { bookSchema} = require('./validation.js'); // Import your Joi validation schema
const { getRelatedBooks } = require('./circuit_breaker.js')
const app = express();
const port = 3000; 

const mysql = require('mysql2/promise');
const STATUS_CODES = require('./httpStatusCodes');
const dbConfig = require('./dbconfig');

app.use(bodyParser.json());

app.get('/status', (req, res) => {
    res.status(200).send('OK');
});

app.post('/books', async (req, res) => {
    const { error } = bookSchema.validate(req.body);
    if (error) {
        console.log(error, "/book book service error");
        return res.status(400).send({
          message: "Illegal, missing, or malformed input.",
          detail: error.details[0].message
        });
      }
    const { ISBN, title, Author, description, genre, price, quantity } = req.body;

    if (!(/^\d+(\.\d{1,2})?$/.test(price.toString()))) {
        return res.status(400).send({
          message: "Price must be a valid number with up to 2 decimal places."
        });
    }

    // Database operation
    try { 
        const connection = await mysql.createConnection(dbConfig);
        const [books] = await connection.execute('SELECT ISBN FROM books WHERE ISBN = ?', [ISBN]);

        if (books.length > 0) {
            await connection.end();
            return res.status(STATUS_CODES.UNPROCESSABLE_ENTITY).json({ message: "This ISBN already exists in the system." });
        }

        const result = await connection.execute(
            'INSERT INTO books (ISBN, title, Author, description, genre, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [ISBN, title, Author, description, genre, price, quantity]
        );
        
        if (result[0].affectedRows > 0) {
            res.status(STATUS_CODES.CREATED)
            .location(`${req.protocol}://${req.get('host')}/books/${ISBN}`)
            .json(req.body);
            console.log(res, "res book service /books");
        } else {``
        throw new Error('Failed to add the book');
    }
    await connection.end();
} catch (error) {
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
    
});


// Use the updateBook function from bookController for the PUT /books/:ISBN route
// router.put('/books/:ISBN', updateBook);
app.put('/books/:ISBN', async (req, res) => {
    const { ISBN } = req.params;
    const { title, Author, description, genre, price, quantity } = req.body;

    const { error } = bookSchema.validate(req.body);
    if (error) {
        return res.status(400).send({
          message: "Illegal, missing, or malformed input.",
          detail: error.details[0].message
        });
      }

       // Ensure the price has exactly two decimal places
    if (!(/^[0-9]+\.[0-9]{2}$/.test(price.toString()))) {
        return res.status(400).send({
        message: "Price must be a valid number with exactly 2 decimal places."
        });
    }

    // Database operation
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [books] = await connection.execute('SELECT ISBN FROM books WHERE ISBN = ?', [ISBN]);

        if (books.length === 0) {
            await connection.end();
            return res.status(STATUS_CODES.NOT_FOUND).json({ message: "This ISBN does not exist in the system." });
        }

        const result = await connection.execute(
            'UPDATE books SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ? WHERE ISBN = ?',
            [title, Author, description, genre, price, quantity, ISBN]
        );

        await connection.end();

        if (result[0].affectedRows > 0) {
            res.status(STATUS_CODES.OK)
            .json({ ISBN, title, Author, description, genre, price, quantity });
        } else {
            throw new Error('Failed to update the book');
        }
    } catch (error) {
        console.error('Database operation failed /books/:ISBN', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});


// Retrieving book by ISBN
// router.get('/books/isbn/:ISBN', getBookByISBN);
app.get('/books/isbn/:ISBN', async (req, res) => {
    const { ISBN } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [books] = await connection.execute('SELECT * FROM books WHERE ISBN = ?', [ISBN]);

        await connection.end();

        if (books.length > 0) {
            res.status(STATUS_CODES.OK).json(books[0]);
        } else {
            res.status(STATUS_CODES.NOT_FOUND).json({ message: "This ISBN does not exist in the system." });
        }
    } catch (error) {
        console.error('Database operation failed /books/isbn/:ISBN', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});

// router.get('/books/:ISBN', getBookByISBN);
app.get('/books/:ISBN', async (req, res) => {
    const { ISBN } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [books] = await connection.execute('SELECT * FROM books WHERE ISBN = ?', [ISBN]);

        await connection.end();

        if (books.length > 0) {
            res.status(STATUS_CODES.OK).json(books[0]);
        } else {
            res.status(STATUS_CODES.NOT_FOUND).json({ message: "This ISBN does not exist in the system." });
        }
    } catch (error) {
        console.error('Database operation failed /books/:ISBN', error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
});

app.get('/books/:ISBN/related-books' , getRelatedBooks)


// Default response for any other request
app.use(function(req, res) { 
    console.log("if I see this I'll be pissed")
    // res.status(STATUS_CODES.NOT_FOUND).send('Endpoint not found');
});

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});


//==============================



