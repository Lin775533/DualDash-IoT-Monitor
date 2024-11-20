const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const config = require('../config/aws-config');

class AWSSNSService {
    constructor() {
        this.snsClient = new SNSClient({
            region: config.region, // Use the region from config
            credentials: {
                accessKeyId: config.sns.accessKeyId,
                secretAccessKey: config.sns.secretAccessKey
            }
        });
    }

    async sendNotification(message, subject = 'Smart Environment Monitor Alert') {
        try {
            const params = {
                Message: message,
                Subject: subject,
                TopicArn: config.sns.topicArn
            };

            const command = new PublishCommand(params);
            const response = await this.snsClient.send(command);
            console.log('SNS notification sent:', response.MessageId);
            return response;
        } catch (error) {
            console.error('Error sending SNS notification:', error);
            throw error;
        }
    }
}

module.exports = new AWSSNSService();
