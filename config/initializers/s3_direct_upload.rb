S3DirectUpload.config do |c|
  c.access_key_id =  ENV["aws_access_key_id"]      # your access key id
  c.secret_access_key = ENV["aws_secret_access_key"]   # your secret access key
  c.bucket = "rifff_bucket"              # your bucket name
 
end
