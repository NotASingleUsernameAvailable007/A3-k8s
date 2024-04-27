const axios = require('axios');
// const express = require('express');
// Circuit breaker state
let circuitState = {
    open: false,
    lastOpened: null
};

const TIMEOUT = 3000; // milliseconds
const RESET_TIMEOUT = 60000; // milliseconds to wait before trying to close the circuit

async function fetchRelatedBooks(ISBN) {
    try {
        // const url = `${process.env.URL_BASE_RECOMMENDATION}${ISBN}`;
        const url = `http://52.72.198.36/recommended-titles/isbn/${ISBN}`;
        const response = await axios.get(url, { timeout: TIMEOUT });
        console.log(response, "response")
        return response;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            throw new Error('Timeout');
        }
        throw error;
    }
}

async function getRelatedBooks(req, res) {
    const { ISBN } = req.params;
    console.log('Coming get Related books')
    // Check if the circuit is open
    if (circuitState.open) {
        console.log('circuit breaker open')
        const currentTime = Date.now();
        if (currentTime - circuitState.lastOpened < RESET_TIMEOUT) {
            // Circuit is still open
            return res.status(503).json({ message: "Service Unavailable: The circuit breaker is open." });
        } else {
            // Time has elapsed, attempt to close the circuit by making a request
            try {
                const books = await fetchRelatedBooks(ISBN);
                console.log(books, "books")
                if (books.data.length === 0) {
                    return res.status(204).send();
                }
                circuitState.open = false; // Close the circuit
                return res.json(books.data);
            } catch (error) {
                circuitState.lastOpened = Date.now(); // Reset the timer
                return res.status(503).json({ message: "Service Unavailable: The circuit remains open." });
            }
        }
    }

    // If the circuit is closed, attempt to fetch books
    try {
        const books = await fetchRelatedBooks(ISBN);
        if (books.data.length === 0) {
            return res.status(204).send();
        }
        return res.json(books.data);
    } catch (error) {
        if (error.message === 'Timeout') {
            console.log('timeout error circuit breaker')
            // Open the circuit on timeout
            circuitState.open = true;
            circuitState.lastOpened = Date.now();
            return res.status(504).json({ message: "Gateway Timeout: Service request timed out." });
        }
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = { getRelatedBooks }