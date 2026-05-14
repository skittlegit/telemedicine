"use client";

import { useEffect, useRef, useState, useActionState } from "react";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import type SimplePeerType from "simple-peer";
import type { Role } from "@/lib/models/User";
import { saveLabRequestsAction, type LabRequest, type LabState } from "@/app/actions/lab";

interface ChatMsg {
  from: string;
  role: string;
  text: string;
  at: number;
  mine?: boolean;
}

interface Props {
  appointmentId: string;
  roomId: string;
  peerName: string;
  role: Role;
  reason: string | null;
  stunUrls: string;
  socketPath: string;
}

export function ConsultRoom({
  appointmentId,
  roomId,
  peerName,
  role,
  reason,
  stunUrls,
  socketPath,
}: Props) {
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<InstanceType<typeof SimplePeerType> | null>(null);
  const SimplePeerCtorRef = useRef<typeof SimplePeerType | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerSocketIdRef = useRef<string | null>(null);

  const [status, setStatus] = useState<"connecting" | "waiting" | "live" | "ended" | "error">(
    "connecting",
  );
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [labTests, setLabTests] = useState<LabRequest[]>([{ test: "" }]);
  const [labState, labAction, labPending] = useActionState<LabState, FormData>(
    saveLabRequestsAction,
    {},
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const mod = await import("simple-peer");
        SimplePeerCtorRef.current = (mod.default ?? mod) as typeof SimplePeerType;
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        const socket = io({
          path: socketPath,
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("connect_error", (err) => {
          setErrorMsg(`Signalling: ${err.message}`);
          setStatus("error");
        });

        socket.on("connect", () => {
          setStatus("waiting");
          socket.emit("room:join", roomId);
        });

        socket.on("room:members", ({ members }: { members: string[] }) => {
          if (members.length > 0) {
            // I'm the second peer — initiate.
            peerSocketIdRef.current = members[0]!;
            createPeer(true, members[0]!);
          }
        });

        socket.on("peer:joined", () => {
          // Other peer will send us an offer.
        });

        socket.on(
          "signal",
          ({ from, data }: { from: string; data: SimplePeerType.SignalData }) => {
            if (!peerRef.current) {
              peerSocketIdRef.current = from;
              createPeer(false, from);
            }
            try {
              peerRef.current?.signal(data);
            } catch (e) {
              console.error("signal error", e);
            }
          },
        );

        socket.on("peer:left", () => {
          setStatus("ended");
          peerRef.current?.destroy();
          peerRef.current = null;
        });

        socket.on("chat", (msg: ChatMsg) => {
          setChat((prev) => [...prev, { ...msg, mine: msg.from !== "self" && false }]);
        });
      } catch (e) {
        setErrorMsg(
          e instanceof Error ? e.message : "Could not access camera or microphone",
        );
        setStatus("error");
      }
    }

    function createPeer(initiator: boolean, peerSocketId: string) {
      const Ctor = SimplePeerCtorRef.current;
      if (!Ctor) return;
      const peer = new Ctor({
        initiator,
        trickle: true,
        stream: localStreamRef.current ?? undefined,
        config: {
          iceServers: stunUrls
            .split(",")
            .map((u) => u.trim())
            .filter(Boolean)
            .map((urls) => ({ urls })),
        },
      });

      peer.on("signal", (data) => {
        socketRef.current?.emit("signal", { to: peerSocketId, data });
      });
      peer.on("stream", (stream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = stream;
        setStatus("live");
      });
      peer.on("connect", () => setStatus("live"));
      peer.on("close", () => setStatus("ended"));
      peer.on("error", (err) => {
        console.error("peer error", err);
        setErrorMsg(err.message);
      });

      peerRef.current = peer;
    }

    init();
    return () => {
      cancelled = true;
      peerRef.current?.destroy();
      peerRef.current = null;
      socketRef.current?.disconnect();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, socketPath, stunUrls]);

  function toggleMute() {
    const tracks = localStreamRef.current?.getAudioTracks() ?? [];
    tracks.forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  }
  function toggleCam() {
    const tracks = localStreamRef.current?.getVideoTracks() ?? [];
    tracks.forEach((t) => (t.enabled = camOff));
    setCamOff(!camOff);
  }
  function hangUp() {
    peerRef.current?.destroy();
    socketRef.current?.disconnect();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus("ended");
  }
  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    socketRef.current?.emit("chat", { roomId, text });
    setChat((p) => [
      ...p,
      { from: "me", role, text, at: Date.now(), mine: true },
    ]);
    setDraft("");
  }

  return (
    <main className="min-h-screen bg-ink text-paper grid grid-rows-[auto_1fr_auto] md:grid-cols-[1fr_320px] md:grid-rows-[auto_1fr]">
      <header className="md:col-span-2 flex items-center justify-between px-6 py-3 border-b border-paper/10">
        <div>
          <p className="eyebrow text-paper/60">Consultation</p>
          <p className="font-display text-xl">{peerName}</p>
        </div>
        <div className="text-xs mono text-paper/60">
          {status === "live" && <span className="text-moss">● live</span>}
          {status === "waiting" && <span>waiting for peer…</span>}
          {status === "connecting" && <span>connecting…</span>}
          {status === "ended" && <span>call ended</span>}
          {status === "error" && <span className="text-clay">error: {errorMsg}</span>}
        </div>
      </header>

      <section className="relative bg-black md:row-start-2 flex items-center justify-center">
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="w-full h-full max-h-[calc(100vh-180px)] object-contain"
        />
        <div className="absolute bottom-4 right-4 w-40 aspect-video bg-black border border-paper/30 overflow-hidden">
          <video
            ref={localVideo}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <aside className="bg-paper text-ink p-4 md:row-start-2 flex flex-col min-h-[300px]">
        {role === "doctor" && reason && (
          <div className="mb-4 border border-[color:var(--rule)] p-3 text-sm">
            <p className="eyebrow mb-1">Patient&apos;s reason</p>
            <p className="text-ink-soft">{reason}</p>
          </div>
        )}

        {role === "doctor" && (
          <div className="mb-4 border border-[color:var(--rule)] p-3 text-sm">
            <p className="eyebrow mb-2">Lab Orders</p>
            <form
              action={(fd) => {
                fd.set("appointmentId", appointmentId);
                fd.set("labRequests", JSON.stringify(labTests.filter((t) => t.test.trim())));
                return labAction(fd);
              }}
            >
              <div className="space-y-1.5 mb-2">
                {labTests.map((t, i) => (
                  <div key={i} className="flex gap-1">
                    <input
                      value={t.test}
                      onChange={(e) =>
                        setLabTests((prev) => {
                          const next = [...prev];
                          next[i] = { ...next[i]!, test: e.target.value };
                          return next;
                        })
                      }
                      placeholder="Test name (e.g. CBC, LFT)"
                      className="field flex-1 text-xs py-1"
                    />
                    {labTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setLabTests((p) => p.filter((_, j) => j !== i))}
                        className="text-oxblood text-xs px-1.5"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLabTests((p) => [...p, { test: "" }])}
                  className="btn btn-ghost text-xs flex-1 py-1"
                >
                  + Add test
                </button>
                <button
                  type="submit"
                  disabled={labPending || labTests.every((t) => !t.test.trim())}
                  className="btn btn-clay text-xs flex-1 py-1"
                >
                  {labPending ? "Saving…" : labState.ok ? "Saved ✓" : "Save orders"}
                </button>
              </div>
              {labState.error && (
                <p className="text-oxblood text-xs mt-1">{labState.error}</p>
              )}
            </form>
          </div>
        )}

        <p className="eyebrow mb-2">Chat</p>
        <ul className="flex-1 overflow-y-auto space-y-2 text-sm">
          {chat.map((m, i) => (
            <li
              key={i}
              className={`px-2 py-1 ${m.mine ? "text-right" : ""}`}
            >
              <span
                className={`inline-block px-2 py-1 ${m.mine ? "bg-clay/20" : "bg-paper-tint"}`}
              >
                {m.text}
              </span>
            </li>
          ))}
        </ul>
        <form onSubmit={sendChat} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message…"
            className="field flex-1"
          />
          <button type="submit" className="btn btn-clay text-xs">
            Send
          </button>
        </form>
      </aside>

      <footer className="md:col-span-2 flex items-center justify-center gap-3 py-4 border-t border-paper/10">
        <button onClick={toggleMute} className="btn btn-ghost text-paper border-paper/30">
          {muted ? "Unmute" : "Mute"}
        </button>
        <button onClick={toggleCam} className="btn btn-ghost text-paper border-paper/30">
          {camOff ? "Camera on" : "Camera off"}
        </button>
        <button onClick={hangUp} className="btn btn-clay">
          End call
        </button>
        {role === "doctor" && (
          <Link
            href={`/dashboard/clinician/prescribe/${appointmentId}`}
            className="btn btn-ghost text-paper border-paper/30"
            target="_blank"
          >
            Issue Rx →
          </Link>
        )}
      </footer>
    </main>
  );
}
