FROM node:14
WORKDIR /usr/src/app
ADD / /usr/src/app
RUN npm install
ENV PORT 8080
EXPOSE 8080
CMD [ "npm", "start" ]