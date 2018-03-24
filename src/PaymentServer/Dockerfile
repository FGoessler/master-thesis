# Pull base image.
FROM node:8.1.1

# Create workdir
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json /usr/src/app/
RUN yarn install

# Copy app sources
COPY . /usr/src/app

# Define default command.
CMD yarn run start

# Expose ports.
EXPOSE 3000 9229
