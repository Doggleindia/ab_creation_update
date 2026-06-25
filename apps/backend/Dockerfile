FROM node:18.20.2

WORKDIR /app

# Only copy package files first (to cache install layer)
COPY package*.json ./

RUN npm install

# Now copy the rest of the source code
COPY . .

EXPOSE 5500

CMD ["npm", "start"]
