FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
EXPOSE 4003
# CMD ["npm", "run", "dev"]
CMD ["npm", "start"]
