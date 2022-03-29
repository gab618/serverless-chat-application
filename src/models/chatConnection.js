import * as dynamoose from "dynamoose";
export function DynamooseDataBase() {
  if (process.env.DB === "local") {
    dynamoose.aws.ddb.local();
    return dynamoose;
  } else {
    // dynamoose.aws.sdk.config.update({
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   region: "sa-east-1",
    // });
    return dynamoose;
  }
}

const db = DynamooseDataBase();
const chatConnectionSchema = new db.Schema(
  {
    connectionId: {
      type: String,
      hashKey: true,
    },
    sortId: {
      type: String,
      rangeKey: true,
      index: [
        {
          global: true,
          name: "ChatConnectionTimestamp",
          rangeKey: "timestamp",
        },
        {
          global: true,
          name: "ChatConnectionUser",
          rangeKey: "user",
        },
      ],
      required: true,
      default: "SORT",
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
    user: {
      type: String,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);
export default db.model(`ChatConnection`, chatConnectionSchema);
