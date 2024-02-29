# Use the official Node.js image as base
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY . /app

# Install dependencies
RUN npm install

# Expose the port your app runs on
EXPOSE 8080

# Command to run your app
CMD node index.js
