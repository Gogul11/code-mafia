# Use an official Node.js runtime
FROM node:23-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose your server port (adjust if needed)
EXPOSE 8080

# Start the backend
CMD [ "npm", "start" ]
