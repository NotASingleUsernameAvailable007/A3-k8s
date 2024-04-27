const { Kafka } = require('kafkajs');
const nodemailer = require('nodemailer');
// const sendEmail = require('./app').sendEmail; // Assuming you expose this function from app.js

const kafka = new Kafka({
    clientId: 'customer-service',
    brokers: ['52.72.198.36:9092', '54.224.217.168:9092', '44.208.221.62:9092']
});

// Create a transporter using the same settings as the Spring Boot example
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'madhuchavali87@gmail.com', // replace with your email
      pass: 'zhyb dgxi cmpp ibpq'  // replace with your app password
    },
    // tls: {
    //   rejectUnauthorized: false
    // }
  });

// Function to send an email
const sendEmail = async (customerEmail, customerName, andrewID) => {
    // Setup email data
    let mailOptions = {
      from: '"Book Store" madhuchavali87@gmail.com', // sender address
      to: customerEmail, // list of receivers
      subject: 'Activate your book store account', // Subject line
      text: `Dear ${customerName},
  Welcome to the Book store created by ${andrewID}.
  Exceptionally this time we won’t ask you to click a link to activate your account.`, // plain text body
}
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

const consumer = kafka.consumer({ groupId: 'crm-group89' });

const runConsumer = async () => {
    try {
        await consumer.connect();
        "CONSUMER CONNECT----------------------------"
       await consumer.subscribe({ topic: 'mchavali.customer.evt', fromBeginning: true });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                console.log('--------------------------------------', `Received message from ${topic}: ${message.value}`);
                const customerData = JSON.parse(message.value.toString());
                const { name, userId } = customerData;
                await sendEmail(userId, name, 'mchavali');
            },
        });
    } catch (error) {
        console.error('Failed to start the consumer:', error);
    }
};

runConsumer().catch(err => {
    console.error('Failed to start Kafka consumer:', err);
});

module.exports = { runConsumer };
