// Create a peer connection only in a browser environment
let peerConnection;

if (typeof window !== "undefined") {
  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:global.stun.twilio.com:3478",
        ],
      },
    ],
  });
}

// PeerService class definition
class PeerService {
  constructor() {
    // Assign the dynamic peer connection
    this.peer = peerConnection || null;
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    }
    throw new Error("Peer connection is not initialized.");
  }

  async setLocalDescription(answer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer));
    } else {
      throw new Error("Peer connection is not initialized.");
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
    throw new Error("Peer connection is not initialized.");
  }
}

export default new PeerService();
