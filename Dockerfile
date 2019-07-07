FROM node:12.6.0-alpine
WORKDIR /usr/share/node
COPY . /usr/share/node
RUN npm install http-server -g -y
CMD ["http-server", "-p", "80"]
