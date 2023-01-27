import aws from 'aws-sdk';
import config from '../config.js';

const S3 = new aws.S3({
  ...config.s3,
});

export default S3;
