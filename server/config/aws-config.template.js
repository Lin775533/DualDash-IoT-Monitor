const awsConfig = {
    region: 'YOUR_AWS_REGION', // e.g., 'us-east-1'
    iot: {
        endpoint: 'YOUR_IOT_ENDPOINT', // e.g., 'xxxxxxxxxxxxxx-ats.iot.region.amazonaws.com'
        clientId: 'smart-environment-monitor',
        // Certificate paths - matching your actual certificate filenames
        certPath: './certs/Monitor.cert.pem',
        keyPath: './certs/Monitor.private.key',
        caPath: './certs/root-CA.crt'
    },
    sns: {
        topicArn: 'YOUR_SNS_TOPIC_ARN', // e.g., 'arn:aws:sns:region:account-id:topic-name'
        accessKeyId: 'YOUR_ACCESS_KEY_ID',
        secretAccessKey: 'YOUR_SECRET_ACCESS_KEY'
    }
};

module.exports = awsConfig;
