'use strict';

const AWS = require("aws-sdk")
const dynamo = new AWS.DynamoDB.DocumentClient();
const queryString = require("query-string");

const DYNAMO_TABLENAME = "userList"

module.exports.get = (event, context, callback) => {
  const params = {
    TableName: DYNAMO_TABLENAME,
    Key: {
      id: event.pathParameters.id,
    },
  };

  dynamo.get(params, ( error, result) => {
    if( ! error) {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({status:true, data:result}),
      });
    }else{
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({status: false, message: `Could not scan item : ${error}`})
      });
    }
  })
};

module.exports.list = (event, context, callback) => {
  const params = {
    TableName: DYNAMO_TABLENAME
  };

  dynamo.scan(params,(error,result) => {
    if ( ! error) {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({status: true, data:result}),
      });
    }else{
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({status: false, message: `Could not scan item : ${error}`})
      })
    }
  })
}

module.exports.add = (event, context, callback) => {
  const body = queryString.parse(event.body);
  let err = [];
  if( ! ("id" in body && body.id.match(/^([0-9]{1,})$/)) ){
    err.push("invalid id")
  }
  if( ! ("uname" in body && body.uname.match(/^([a-zA-Z0-9]{1,})$/)) ){
    err.push("invalid uname")
  }

  if ( err.length >= 1 ) {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({status: false, message:err, body: body}),
    })

    return (false);
  }

  const params = {
    TableName: DYNAMO_TABLENAME,
    Item: {
      id: body.id,
      uname: body.uname
    },
  };

  dynamo.put(params, (error) => {
    if (! error) {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({status: true, data:params.Item}),
      })
    }else{
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({status:false, message: `Could not create item : ${error}`})
      })
    }
  });
}

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
