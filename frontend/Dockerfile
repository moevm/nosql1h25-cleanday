FROM node:23-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Expose the port Vite runs on
EXPOSE 8080

# Command to run the app
CMD ["npm", "run", "dev", "--", "--host"]