const express = require('express');
const bodyParser = require('body-parser');
const STATUS_CODES = require('./httpStatusCodes');
const app = express();
const axios = require('axios');
// const SERVICE_CONFIG = require("./service_config");
const jwt = require('jsonwebtoken');
require('dotenv').config();

app.use(bodyParser.json());

app.get('/status', (req, res) => {
console.log('Coming to /status')
    res.status(200).send('OK');
});

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('Auth header missing')

        return res.status(STATUS_CODES.UNAUTHORIZED).send('Authorization header is missing');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).send('Bearer token is missing');
    }

    try {
        const payload = jwt.decode(token);
        // Verify custom claims
        const validSubjects = ['starlord', 'gamora', 'drax', 'rocket', 'groot'];
        const isSubjectValid = validSubjects.includes(payload.sub);
        const isIssuerValid = payload.iss === 'cmu.edu';
        const isTokenExpired = payload && payload.exp ? Date.now() >= payload.exp * 1000 : true;

        if (!isSubjectValid || !isIssuerValid || isTokenExpired) {
            console.log(isSubjectValid, "isSubjectValid")
            console.log(isIssuerValid, "isIssuerValid")
            console.log(isTokenExpired, "isTokenExpired")
            
            return res.status(STATUS_CODES.UNAUTHORIZED).send('Invalid token claims');
        }

        // Token is valid, attach payload to request
        req.user = payload;
        next();
    } catch (error) {
        return res.status(STATUS_CODES.UNAUTHORIZED).send('Invalid token');
    }

};

const clientTypeChecker = (req, res, next) => {
    // header check
    const clientType = req.headers['x-client-type'];
    if (!clientType) {
    console.log('Coming here because client type missing')
    return res.status(STATUS_CODES.BAD_REQUEST).send('X-Client-Type header is missing');
    }
    req.clientType = clientType.toLowerCase();
    next();
};

// Helper function to remove sensitive attributes from customer object
function removeSensitiveAttributes(customer) {
    const { address, address2, city, state, zipcode, ...rest } = customer;
    return rest;
}

app.use(authenticate);
app.use(clientTypeChecker);

// console.log('coming to app.post areas')

// app.get('/health', (req, res) => {
//     res.status(200).send('OK');
// });

app.post('/books', (req, res) => {
    console.log(req, "req")
    console.log(req.data, "req.data")
    console.log(req.url, "req.url")


    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data);
        res.status(response.status).send(response.data);
    })
    .catch(error => {
    console.log(error, "error forward request");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

// router.post('/books', forwardRequest);
app.put('/books/:ISBN', (req, res) => {
    console.log(req, "req")
    console.log(req.data, "req.data")
    console.log(req.url, "req.url")


    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data);
        res.status(response.status).send(response.data);
    })
    .catch(error => {
    console.log(error, "error forward request");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/books/:ISBN/related-books', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log("Related books data mobile bff",response.data);
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, 'Coming here related-books error')

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/books/isbn/:ISBN', (req, res) => {
    console.log(req.data, "req.data forwardBookRequestAndTransform");

    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        // console.log(response, "respnsee")
        let data = response.data;
        console.log(data, "/books/isbn/:ISBN data")
        // If the client is mobile, replace "non-fiction" with 3 in the genre field
        if (data.genre === 'non-fiction') { // WE DONT NED THE MOBILE CHECK ??? req.clientType === 'ios' || req.clientType === 'android') && 
            data = { ...data, genre: 3 };
        }
        // console.log(response.data);
        res.status(response.status).send(data);
    })
    .catch(error => {
    console.log(error, "error forward book request");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/books/:ISBN', (req, res) => {
    console.log(req.data, "req.data /books/:ISBN");

    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        let data = response.data;
        console.log(data, "data /books/:ISBN")
        // If the client is mobile, replace "non-fiction" with 3 in the genre field
        if (data.genre === 'non-fiction') { // WE DONT NED THE MOBILE CHECK ??? req.clientType === 'ios' || req.clientType === 'android') && 
            data = { ...data, genre: 3 };
        }
        // console.log(response.data);
        res.status(response.status).send(data);
    })
    .catch(error => {
    console.log(error, "error forward book request");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

// Define the customer routes with their handlers from requestForwarder
app.post('/customers', (req, res) => {
    console.log(req, "req")
    console.log(req.data, "req.data")
    console.log(req.url, "req.url")


    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, "/customers");
        res.status(response.status).send(response.data);
    })
    .catch(error => {
    console.log(error, "error forward request");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/customers/:id', (req, res) => {
    console.log(req.data, "req.data /customers/:id");

    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        let data = response.data;
        data = removeSensitiveAttributes(data);
        console.log(data, "/customers/:id");
        res.status(response.status).send(data);
    })
    .catch(error => {
    console.log(error, "error /customers/:id");
        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/customers', (req, res) => {
    console.log(req.data, "req.data /customers");

    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        let data = response.data;
        console.log(data, "/customers")
        data = removeSensitiveAttributes(data);
        res.status(response.status).send(data);
    })
    .catch(error => {
    console.log(error, "error /customers");
        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});


const port = process.env.PORT || 80; // BFF typically runs on port 80
// const port = process.env.PORT || 8080; // BFF typically runs on port 8080
app.listen(port, () => {
    console.log(`BFF Web Service running at ${port}`);
});


//-------------






