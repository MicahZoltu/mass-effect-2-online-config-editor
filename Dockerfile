# FROM node:18.13.0-bullseye-slim
FROM node@sha256:bc946484118735406562f17c57ddf5fded436e175b6a51f827aa6540ba1e13de

# install wget, git and necessary certificates so we can install IPFS below
RUN apt update && apt install --yes --no-install-recommends wget git apt-transport-https ca-certificates && rm -rf /var/lib/apt/lists/*

# install IPFS
WORKDIR /home/root
RUN wget -qO - https://dist.ipfs.tech/kubo/v0.14.0/kubo_v0.14.0_linux-amd64.tar.gz | tar -xvzf - \
	&& cd kubo \
	&& ./install.sh \
	&& cd .. \
	&& rm -rf kubo
RUN ipfs init

# npm install first so we can cache this layer (speeds up iteration significantly)
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --ignore-scripts

WORKDIR /app/build
COPY build/ /app/build/
COPY app/index.html /app/app/index.html
RUN npm ci --ignore-scripts
RUN npm run vendor

WORKDIR /app
COPY app/css/ /app/app/css/
COPY app/ts/ /app/app/ts/
COPY tsconfig.json /app/tsconfig.json
RUN npm run build

# add the build output to IPFS and write the hash to a file
RUN ipfs add --cid-version 1 --quieter --only-hash --recursive ./app > ipfs_hash.txt
# print the hash for good measure in case someone is looking at the build logs
RUN cat ipfs_hash.txt

# this entrypoint file will `ipfs add` the build output using the docker host's IPFS API endpoint, so we can easily extract the IPFS build out of the docker image
RUN printf '#!/bin/sh\nipfs --api /ip4/`getent ahostsv4 host.docker.internal | grep STREAM | head -n 1 | cut -d \  -f 1`/tcp/5001 add --cid-version 1 -r ./app' >> entrypoint.sh
RUN chmod u+x entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]
