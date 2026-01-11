FROM node:18-bullseye

RUN apt-get update && \
    apt-get install -y wget apt-transport-https && \
    wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y dotnet-runtime-7.0

WORKDIR /app
COPY . .

RUN npm install

CMD ["npm", "start"]
