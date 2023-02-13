import { Api, StackContext } from 'sst/constructs';

export function API({ stack }: StackContext) {
  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        runtime: 'nodejs18.x',
      },
    },
    routes: {
      'GET /': 'packages/functions/src/lambda.handler',
    },
  });
  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
