# Pull base image.
FROM node:8.1.1

# Create workdir
RUN mkdir -p /usr/src/ClientSide

# Copy PaymentClientLib sources
COPY ClientSide/PaymentClientLib /usr/src/ClientSide/PaymentClientLib
WORKDIR /usr/src/ClientSide/PaymentClientLib
RUN yarn install

# Copy Mediator Contract
RUN mkdir -p /usr/src/PaymentServer/MediatorContract
COPY PaymentServer/src/MediatorContract/Mediator.sol /usr/src/PaymentServer/src/MediatorContract

# Copy app sources
COPY IntegrationTests /usr/src/IntegrationTests
WORKDIR /usr/src/IntegrationTests
RUN yarn install

# Define default command.
CMD /usr/src/IntegrationTests/wait-for.sh payment-server:3000 -- yarn run test
