S3DirectUpload.config do |c|
  c.access_key_id =  ENV["aws_access_key_id"]      # your access key id
  c.secret_access_key = ENV["aws_secret_access_key"]   # your secret access key
  c.bucket = "rifff_bucket"              # your bucket name
  #c.region = ""              # region prefix of your bucket url (optional), eg. "s3-eu-west-1"
end
