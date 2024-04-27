const service_config = {
    // URL of ALB where behind which book and customer service is hosted
    // BASE_SERVICE_URL: 'http://localhost',
    BASE_SERVICE_URL:'http://internal-InternalALB-139587121.us-east-1.elb.amazonaws.com',
    SERVICE_PORT: ":3000",
    //secret used to sign JWT tokens
    JWT_SECRET: 'your-256-bit-secret'
};

module.exports = service_config;
