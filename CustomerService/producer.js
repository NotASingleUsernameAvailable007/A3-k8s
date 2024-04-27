const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'customer-service',
    brokers: ['52.72.198.36:9092', '54.224.217.168:9092', '44.208.221.62:9092']
});

const producer = kafka.producer();

const sendCustomerRegisteredEvent = async (customerData) => {
    await producer.connect();
    "PRODUCER CONNECTED--------------"
    let values = await producer.send({
        topic: 'mchavali.customer.evt',
        messages: [{ value: JSON.stringify(customerData) }],
    });
    console.log(values, "values-----------------------")
    // await producer.disconnect();
};

module.exports = { sendCustomerRegisteredEvent };
