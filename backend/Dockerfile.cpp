FROM gcc:12 AS builder
WORKDIR /app

# install ASIO and download crow headers 
RUN apt-get update && apt-get install -y --no-install-recommends libasio-dev git ca-certificates && \
    git clone https://github.com/CrowCpp/Crow.git /tmp/Crow && \
    cp -r /tmp/Crow/include/* /usr/local/include/ && \
    rm -rf /tmp/Crow

COPY . .
RUN make build
FROM debian:stable-slim

WORKDIR /app
COPY --from=builder /app/build /app/build
RUN mkdir -p /app/emulator/roms
# cpu architecture name aware
RUN ln -s /app/build/crow_server_$(uname -m) /app/crow_server

EXPOSE 6969

CMD ["/app/crow_server"]
