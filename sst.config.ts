import { SSTConfig } from 'sst';
import { API } from './stacks/MyStack';
import { IotStack } from './stacks/iot-stack';

export default {
  config(_input) {
    return {
      name: 'iot-laundry',
      region: 'us-west-2',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
    });
    app.stack(API).stack(IotStack);
  },
} satisfies SSTConfig;
