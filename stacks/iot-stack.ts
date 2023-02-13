import * as actions from '@aws-cdk/aws-iot-actions-alpha';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cw_actions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as iot from '@aws-cdk/aws-iot-alpha';

import { Function, StackContext, Topic } from 'sst/constructs';

import { Duration } from 'aws-cdk-lib';

export function IotStack({ stack }: StackContext) {
  const funcAlarmSetter = new Function(stack, 'iot-alarm-function', {
    handler: 'packages/functions/src/iot.alarmHandler',
    permissions: ['cloudwatch:PutMetricData'],
  });

  const funcSmsSender = new Function(stack, 'iot-sms-function', {
    handler: 'packages/functions/src/iot.smsHandler',
    environment: {
      PHONE_NUMBER: process.env.PHONE_NUMBER as string,
    },
    permissions: ['sns:Publish'],
  });

  const topic = new Topic(stack, 'iot-topic', {
    subscribers: {
      smsSub: funcSmsSender,
    },
  });

  const metric = new cloudwatch.Metric({
    namespace: 'IoT/Laundry',
    metricName: 'LaundryAlerts',
    period: Duration.minutes(1),
  });

  const alarm = new cloudwatch.Alarm(stack, 'iot-alarm', {
    actionsEnabled: true,
    alarmName: 'AlarmLaundryAlerts',
    comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
    metric,
    threshold: 0,
    evaluationPeriods: 1,
    treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
  });

  alarm.addAlarmAction(new cw_actions.SnsAction(topic.cdk.topic));

  new iot.TopicRule(stack, 'iot-topic-rule', {
    topicRuleName: 'IotLaundryTopicRule',
    description: 'Invoke the Laundry Notification Function',
    sql: iot.IotSql.fromStringAsVer20160323(
      `SELECT * FROM 'iotbutton/${process.env.BUTTON_ID}'`
    ),
    actions: [new actions.LambdaFunctionAction(funcAlarmSetter)],
  });
}
