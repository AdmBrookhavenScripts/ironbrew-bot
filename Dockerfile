FROM node:18-bullseye

# Instala dependências básicas
RUN apt-get update && \
    apt-get install -y wget apt-transport-https ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Adiciona repositório da Microsoft
RUN wget https://packages.microsoft.com/config/debian/11/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    rm packages-microsoft-prod.deb

# Instala .NET Core 3.1 (necessário para IronBrew 2)
RUN apt-get update && \
    apt-get install -y dotnet-runtime-3.1 && \
    rm -rf /var/lib/apt/lists/*

# Diretório da aplicação
WORKDIR /app

# Copia dependências primeiro (melhora cache)
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Comando de inicialização
CMD ["npm", "start"]
