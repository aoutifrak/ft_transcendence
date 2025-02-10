FROM docker.elastic.co/elasticsearch/elasticsearch:8.14.3

COPY ./setup.sh /usr/share/elasticsearch/setup.sh

COPY ./export.ndjson /usr/share/elasticsearch/config/export.ndjson

USER root

RUN chmod +x /usr/share/elasticsearch/setup.sh

CMD ["/bin/bash", "/usr/share/elasticsearch/setup.sh"]
