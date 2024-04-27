const express = require('express');
const bodyParser = require('body-parser');
const STATUS_CODES = require('./httpStatusCodes');
const jwt = require('jsonwebtoken');
const axios = require('axios');


const app = express();

app.use(bodyParser.json());

app.get('/status', (req, res) => {
    res.status(200).send('OK');
});

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader, "auth header")
    console.log(req.data, "data request")
    if (!authHeader) {
        return res.status(STATUS_CODES.UNAUTHORIZED).send('Authorization header is missing');
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(STATUS_CODES.UNAUTHORIZED).send('Bearer token is missing');
    }

    try {
        const payload = jwt.decode(token);//(token, SERVICE_CONFIG.JWT_SECRET, { algorithms: ['HS256'] });
        // Verify custom claims
        const validSubjects = ['starlord', 'gamora', 'drax', 'rocket', 'groot'];
        const isSubjectValid = validSubjects.includes(payload.sub);
        const isIssuerValid = payload.iss === 'cmu.edu';
        const isTokenExpired = payload && payload.exp ? Date.now() >= payload.exp * 1000 : true;

        if (!isSubjectValid || !isIssuerValid || isTokenExpired) {
            console.log("Invalid token claims")
            return res.status(STATUS_CODES.UNAUTHORIZED).send('Invalid token claims');
        }

        // Token is valid, attach payload to request
        req.user = payload;
        next();
    } catch (error) {
        console.log("Invalid token ERROR")
        return res.status(STATUS_CODES.UNAUTHORIZED).send('Invalid token');
    }

};

const clientTypeChecker = (req, res, next) => {
    // header check
    const clientType = req.headers['x-client-type'];

    if (!clientType) {
        return res.status(STATUS_CODES.BAD_REQUEST).send('X-Client-Type header is missing');
    }
    req.clientType = clientType.toLowerCase();
    next();
};

app.use(authenticate);
app.use(clientTypeChecker);

// const app = express.app();

// Define the book routes with their handlers from requestForwarder
app.post('/books', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, "/books bff web");
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, "/books bff web");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});
// app.post('/books', forwardRequest);

app.put('/books/:ISBN', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, "/books/:ISBN bff web");
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, "/books/:ISBN bff web");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});
// app.put('/books/:ISBN', forwardRequest);

app.get('/books/isbn/:ISBN', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, "/books/isbn/:ISBN bff web");
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, "error bff web /books/isbn/:ISBN");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});
// app.get('/books/isbn/:ISBN', forwardRequest);

app.get('/books/:ISBN', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.BOOKS_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, "/books/:ISBN bff web");

        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, "error bff web /books/:ISBN");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});
// app.get('/books/:ISBN', forwardRequest);

// Define the customer routes with their handlers from requestForwarder
app.post('/customers', (req, res) => {
    console.log('We are here');
    console.log(req.originalUrl)
    console.log(req.headers.authorization, "auth");
    // console.log(`localhost${SERVICE_CONFIG.SERVICE_PORT}${req.originalUrl}`, "-----")
    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    
    .then(response => {
        console.log(response.data, "/customers bff web");

        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, "error bff web");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/customers/:id', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, " response /customers/:id");
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, " error /customers/:id");

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

app.get('/customers', (req, res) => {
    axios({
        method: req.method,
        url: `${process.env.CUSTOMER_SERVICE}${req.originalUrl}`,
        // url: `http://localhost:3000/${req.originalUrl}`,
        data: req.body,
        headers: { 'Authorization': req.headers.authorization }, // Forward headers
    })
    .then(response => {
        console.log(response.data, " response /customers bff web");

        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log(error, " error /customers bff web");

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
        console.log("Related books data web bff",response.data);
        res.status(response.status).send(response.data);
    })
    .catch(error => {
        console.log("error Related books data web bff",error);

        res.status(error.response?.status || STATUS_CODES.INTERNAL_SERVER_ERROR).json(error.response?.data || { message: "Error forwarding request" });
    });
});

// Error handling
app.use(function(req, res, next) {
    res.status(STATUS_CODES.NOT_FOUND).send('BFF Endpoint not found');
});

const port = process.env.PORT || 80; // BFF typically runs on port 80
app.listen(port, () => {
    console.log(`BFF Web Service running at ${port}`);
});


