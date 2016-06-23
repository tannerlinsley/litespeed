// import fs from 'fs'
// import path from 'path'
// import Aws from 'aws-sdk'
// import uuid from 'uuid'

export default async function () {
//   const gateway = new Aws.APIGateway({ region: 'us-east-1' })
//   const lambda = new Aws.Lambda({ region: 'us-east-1' })

  // const restApi = await gateway.createRestApi({
  //   name: uuid.v4(),
  //   description: 'Created from the Airwave CLI'
  // }).promise()

  // const resource = await gateway.createResource({
  //   restApiId: '1ioekspjua',
  //   parentId: '3u0vi4brba',
  //   pathPart: 'testing'
  // }).promise()

  // const method = await gateway.putMethod({
  //   restApiId: '1ioekspjua',
  //   resourceId: '8cpdn7',
  //   httpMethod: 'GET',
  //   authorizationType: 'NONE'
  // }).promise()

  // // TODO: create role
  // const ZipFile = fs.readFileSync(path.resolve(__dirname, '../../example/lambda.zip'))
  // const func = await lambda.createFunction({
  //   Code: { ZipFile },
  //   FunctionName: uuid.v4(),
  //   Handler: 'index.handler',
  //   Role: 'arn:aws:iam::606854932809:role/lambda_basic_execution',
  //   Runtime: 'nodejs4.3',
  //   Description: 'Created from the Airwave CLI'
  // }).promise()

  // await gateway.putIntegration({
  //   restApiId: '1ioekspjua',
  //   resourceId: '8cpdn7',
  //   type: 'AWS',
  //   httpMethod: 'GET',
  //   integrationHttpMethod: 'POST',
  //   uri: 'arn:aws:lambda:us-east-1:606854932809:function:1f81e574-4d56-422e-95e2-514535475c7b/invocations'
  // }).promise()
}
