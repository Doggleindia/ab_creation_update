import AWS from 'aws-sdk'
const s3 = new AWS.S3();

export const deleteFileFromS3ByUrl = async (url) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const key = decodeURIComponent(new URL(url).pathname).substring(1); // remove leading "/"

  return s3
    .deleteObject({ Bucket: bucketName, Key: key })
    .promise()
    .catch((err) => console.error(`Failed to delete ${key}:`, err.message));
};
