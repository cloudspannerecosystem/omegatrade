set -e
./gateway_main --hostname 0.0.0.0 --grpc_port 9010 --http_port 9020 & 
./ddl.sh && npm start 

#wait -n