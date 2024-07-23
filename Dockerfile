# Use an official Node runtime as a base image
FROM node:18.17.0


# Set the working directory in the container to /usr/src/app
WORKDIR /usr/src/app

# Copy package.json and package-lock.json before other files
# Utilize cache to save Docker build time
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Define command to run the application
CMD ["npm", "run", "start"]
