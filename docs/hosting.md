# Hosting & Usage Guide

MonoC CPU Emulator can be run either natively for personal local development, or via Docker as a server that multiple users can connect to over a network. 

As the Local Model might require better hardware, here are the three supported usage scenarios:

## 1. Local Native Usage 
**Best for:** Running the app on your own machine for personal use. 

Follow the [build instructions](../README.md#build).

AI usage is totally optional. If you have `ollama` installed its detected automatically, but make sure the set model is the right one in the `.env` file.

**Networking:** 
- The script uses the `localhost` loopback interface by default. 
- **NO other devices** on your Wi-Fi network will be able to access the emulator.

---

## 2. Docker + Ollama (Same Device)
**Best for:** Hosting the emulator on a home server, letting friends/devices connect, while running the heavy AI models on that same server.

When using Docker, the emulator is exposed to your local network (e.g. Wifi). However, Docker containers run in an isolated network, so it cannot connect to the host machine's Ollama instance using just `localhost`.

**Setup:**
1. You must tell Ollama to accept external connections (because Docker traffic counts as an external connection). Stop Ollama, and restart it with this environment variable:

   ```bash
   $ env OLLAMA_HOST="0.0.0.0" ollama serve
   ```
2. In your `.env` file, point the emulator to the special Docker host address:

   ```env
   # If using Mac/Windows Docker Desktop:
   OLLAMA_HOST=http://host.docker.internal:11434
   
   # If using Linux natively:
   OLLAMA_HOST=http://<your-lan-ip>:11434
   ```
3. Run `docker compose up -d --build`.
4. Other devices on your Wi-Fi can now access the emulator by visiting `http://<your-lan-ip>`.

---

## 3. Docker + Ollama (Different Devices)
**Best for:** Hosting the emulator on a lightweight server/VPS, but running the heavy AI models on a beefy PC across the house (or world via Tailscale).

**Setup:**
1. On your **AI PC** (the one running Ollama), you must tell Ollama to accept connections from the network. Stop Ollama, and restart it with:

   ```bash
   $ env OLLAMA_HOST="0.0.0.0" ollama serve
   ```
2. On your **Emulator PC** (where Docker runs), edit the `.env` file to point to the IP address of your AI PC (e.g., its Tailscale IP or LAN IP):

   ```env
   OLLAMA_HOST=http://100.x.y.z:11434
   ```
3. Run `docker compose up -d --build` on the emulator server.

> [!WARNING]
> By default, Ollama strictly blocks all traffic that does NOT originate from `127.0.0.1`. That's why Ollama must be started with `env OLLAMA_HOST="0.0.0.0" ollama serve`.
