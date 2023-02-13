import * as AWS from 'aws-sdk';

import { SNSEvent } from 'aws-lambda';

export const smsHandler = (event: SNSEvent) => {
  console.log('SMS Handler Received Event', event.Records[0].Sns.Message);
  const sns = new AWS.SNS({ region: 'us-west-2' });

  const params = {
    Message: 'Laundry is done!',
    PhoneNumber: `${process.env.PHONE_NUMBER}`,
  };

  console.log('Sending SMS', params);
  sns.publish(params, (err, data) => {
    if (err) {
      console.log('Error sending SMS', err);
    } else {
      console.log('Successfully sent SMS', data);
    }
  });
};

enum ClickType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  LONG = 'LONG',
}

type IoTEvent = {
  clickType: ClickType;
  serialNumber: string;
  batteryVoltage: string;
};

export const alarmHandler = (event: IoTEvent) => {
  console.log('Alarm Handler Received Event', event);

  // 30 minutes or 1 minute if local
  const timeVariable = !!process.env.IS_LOCAL ? 1 : 30;

  const futureTimestamp = new Date(
    new Date().getTime() + 60 * 1000 * timeVariable
  );

  const metric: AWS.CloudWatch.PutMetricDataInput = {
    MetricData: [
      {
        MetricName: 'LaundryAlerts',
        Timestamp: futureTimestamp,
        Unit: 'Count',
        Value: 1,
      },
    ],
    Namespace: 'IoT/Laundry',
  };

  const cloudwatch = new AWS.CloudWatch({ region: 'us-west-2' });
  cloudwatch.putMetricData(metric, (err, data) => {
    if (err) {
      console.log('Error putting metric data', err);
    } else {
      console.log('Successfully put metric data', data, futureTimestamp);
    }
  });
};
