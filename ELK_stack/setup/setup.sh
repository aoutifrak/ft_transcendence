#!/bin/bash

# verifier les variables d'environnement
function check_env_vars() {
  required_vars=("ELASTIC_PASSWORD" "KIBANA_PASSWORD" "ELASTIC_USERNAME")
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "Error: the variable $var is not defined."
      exit 1
    fi
  done
}


# creer le certificat CA si absent
function generate_ca_cert() {
  local ca_zip="config/certs/ca.zip"
  if [ ! -f "$ca_zip" ]; then
    echo "Generating the CA certificate..."
    bin/elasticsearch-certutil ca --silent --pem -out "$ca_zip"
    unzip "$ca_zip" -d config/certs
  fi
}

#creer les certificats pour les instances
function generate_instance_certs() {
  local certs_zip="config/certs/certs.zip"
  if [ ! -f "$certs_zip" ]; then
    echo "Generating the instance certificates..."
    cat > config/certs/instances.yml <<EOL
instances:
  - name: elasticsearch
    dns: ["elasticsearch", "localhost"]
  - name: kibana
    dns: ["kibana", "localhost"]
  - name: logstash
    dns: ["logstash", "localhost"]
EOL
    bin/elasticsearch-certutil cert --silent --pem -out "$certs_zip" \
      --in config/certs/instances.yml \
      --ca-cert config/certs/ca/ca.crt \
      --ca-key config/certs/ca/ca.key
    unzip "$certs_zip" -d config/certs
  fi
}

# fixer les permissions sur les fichiers
function set_permissions() {
  echo "Updating permissions..."
  chmod -R 750 config/certs
  find config/certs -type f -exec chmod 640 {} \;
}

# verifier la disponibilite d'Elasticsearch
function wait_for_service() {
  local service_url=$1
  local service_name=$2
  echo "Waiting for the $service_name service..."
  until curl -s -k "$service_url" | grep -q "missing authentication credentials"; do
    sleep 3
  done
}

# configurer la politique ILM 
function configure_ilm_policy() {
  echo "Configuring the ILM policy..."
  curl -s -X PUT "https://elasticsearch:9200/_ilm/policy/nginx-policy" \
    --cacert config/certs/ca/ca.crt \
    -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{
          "policy": {
            "phases": {
              "hot": {"actions": {}},
              "warm": {"min_age": "2d", "actions": {"shrink": {"number_of_shards": 1}}},
              "cold": {"min_age": "10d", "actions": {}},
              "delete": {"min_age": "30d", "actions": {"delete": {}}}
            }
          }
        }'
}

# definir le template d'index
function configure_index_template() {
  echo "Configuring the index template..."
  curl -s -X PUT "https://elasticsearch:9200/_index_template/nginx-template" \
    --cacert config/certs/ca/ca.crt \
    -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{
          "index_patterns": ["nginx-*"],
          "template": {
            "settings": {
              "index.lifecycle.name": "nginx-policy",
              "number_of_shards": 1
            }
          }
        }'
}


# mettre a jour le mot de passe de Kibana
function update_kibana_password() {
  echo "Updating the Kibana password..."
  curl -s -X POST "https://elasticsearch:9200/_security/user/kibana_system/_password" \
    --cacert config/certs/ca/ca.crt \
    -u "$ELASTIC_USERNAME:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -d '{"password": "'$KIBANA_PASSWORD'"}'
}

function import_dashboard() {
  echo "Importing dashboard..."
  curl -s -k -X POST "https://kibana:5601/api/saved_objects/_import" \
    -u "$ELASTIC_USERNAME:$KIBANA_PASSWORD" \
    -H "kbn-xsrf: true" \
    -H "Content-Type: multipart/form-data" \
    --form file=@/usr/share/elasticsearch/config/export.ndjson \
    | grep -q '"success":true' || exit 1
}

# Execution des Fonctions
check_env_vars
generate_ca_cert
generate_instance_certs
set_permissions
wait_for_service "https://elasticsearch:9200" "Elasticsearch"
configure_ilm_policy
configure_index_template
update_kibana_password
import_dashboard


echo "Configuration completed."