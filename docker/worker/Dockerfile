# docker/worker/Dockerfile

# Use an official Node runtime as the base image
FROM node:19

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./queue/package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY ./queue .

# This command will run your application
CMD ["npm", "run", "process-blocks"]
