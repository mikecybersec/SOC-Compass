FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (no package-lock.json yet, so use npm install)
RUN npm install --omit=dev

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "server.js"]

