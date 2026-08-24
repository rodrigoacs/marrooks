FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
ENV PORT=3344
EXPOSE 3344
CMD ["node", "server.js"]
