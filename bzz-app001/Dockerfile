FROM node:12-alpine as web
RUN mkdir /app
WORKDIR /app
COPY frontend/package.json .
RUN npm install 
COPY frontend .
RUN npm run build

FROM node:12-alpine
ENV NODE_ENV=production
RUN mkdir /app
WORKDIR /app
COPY backend/package.json .
RUN apk add --no-cache python3
RUN apk add imagemagick ghostscript poppler-utils 
RUN apk add tesseract-ocr
RUN apk add --update --no-cache make g++ jpeg-dev cairo-dev giflib-dev pango-dev libtool autoconf automake
RUN npm install --production
COPY backend .
COPY --from=web /app/build /app/public/
CMD ["npm", "start"]
