S3DirectUpload.config do |c|
  c.access_key_id =  ENV["AWS_ACCESS_KEY_ID"]      # your access key id
  c.secret_access_key = ENV["AWS_SECRET_KEY_ID"]   # your secret access key
  c.bucket = "rifff_bucket"              # your bucket name
 
end
