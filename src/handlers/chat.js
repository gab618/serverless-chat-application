import AWS from "aws-sdk";
import ChatConnection from "../models/chatConnection";

const successfulResponse = {
  statusCode: 200,
  body: "Success",
};

const failedResponse = (error, statusCode = 500) => ({
  statusCode,
  body: error,
});

export const connectHandler = (event, context, callback) => {
  const { user } = event.queryStringParameters;
  const { connectionId } = event.requestContext;

  ChatConnection.create(
    { connectionId, user, sortId: "SORT" },
    (err, connection) => {
      if (err) {
        callback(failedResponse(JSON.stringify(err)));
      } else {
        callback(null, successfulResponse);
      }
    }
  );
};

export const disconnectHandler = (event, context, callback) => {
  const { connectionId } = event.requestContext;

  ChatConnection.delete({ connectionId, sortId: "SORT" }, (err) => {
    if (err) {
      callback(failedResponse(JSON.stringify(err)));
    } else {
      callback(null, successfulResponse);
    }
  });
};

export const defaultHandler = (event, context, callback) => {
  callback(null, { statusCode: 404, body: "No event fount" });
};

export const sendMessageHandler = (event, context, callback) => {
  const body = JSON.parse(event.body);

  if (body) {
    const { to, data } = body;
    ChatConnection.query({ user: to, sortId: "SORT" }).exec(
      (err, connection) => {
        if (err) {
          callback(failedResponse(JSON.stringify(err)));
        }
        if (connection.length === 0) {
          callback(
            failedResponse(
              JSON.stringify({ statusCode: 404, body: "User not found" })
            )
          );
        }

        const { connectionId } = connection[0];

        const endpoint =
          event.requestContext.domainName + "/" + event.requestContext.stage;
        const apigwManagementApi = new AWS.ApiGatewayManagementApi({
          apiVersion: "2018-11-29",
          endpoint: endpoint,
        });

        const params = {
          ConnectionId: connectionId,
          Data: data,
        };

        apigwManagementApi
          .postToConnection(params)
          .promise()
          .then((res) => {
            callback(null, successfulResponse);
          });
      }
    );
  } else {
    callback(
      failedResponse(JSON.stringify({ statusCode: 400, body: "Invalid body" }))
    );
  }
};
