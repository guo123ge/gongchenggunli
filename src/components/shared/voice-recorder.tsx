"use client";

import { Mic, Square, UploadCloud } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type VoiceRecorderProps = {
  onTranscript?: (text: string) => void;
};

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recordingSupport, setRecordingSupport] = useState<RecordingSupport>({
    checked: false,
    supported: false,
    message: "正在检测当前浏览器录音能力。",
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const busy = recording || transcribing || uploading;
  const actionText = recording ? "停止" : uploading ? "上传中" : transcribing ? "转写中" : recordingSupport.supported ? "录音" : "无法录音";

  useEffect(() => {
    setRecordingSupport(checkRecordingSupport());
    return () => {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    };
  }, []);

  async function startRecording() {
    if (busy) return;
    const support = checkRecordingSupport();
    setRecordingSupport(support);
    if (!support.supported) {
      toast.error(support.message);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];
        stream.getTracks().forEach((track) => track.stop());
        void transcribe(audioBlob);
      };
      recorder.start();
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      setRecording(true);
      toast.success("开始录音。");
    } catch {
      toast.error("无法访问麦克风，请检查浏览器权限。");
    }
  }

  function resetAudioState() {
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];
    setRecording(false);
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    setRecording(false);
  }

  async function transcribe(audioBlob: Blob, options: { upload?: boolean; fileName?: string } = {}) {
    setTranscribing(true);
    try {
      if (options.upload !== false) {
        await uploadAudio(audioBlob, options.fileName);
      }

      const response = await fetch("/api/ai/transcribe", {
        method: "POST",
        headers: { "Content-Type": audioBlob.type || "application/octet-stream" },
        body: audioBlob,
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; data?: { transcript?: string }; error?: string };
      if (!response.ok || body.ok === false) {
        toast.error(body.error ?? "语音转写失败，语音文件已保存。");
        return;
      }
      const text = body.data?.transcript?.trim() ?? "";
      if (!text) {
        toast.error("未识别到语音内容。");
        return;
      }
      setTranscript(text);
      onTranscript?.(text);
      toast.success("语音转写完成，语音文件已进入资料库。");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "语音转写失败");
    } finally {
      setTranscribing(false);
      resetAudioState();
    }
  }

  async function uploadAudio(audioBlob: Blob, fileName = `voice-${Date.now()}.webm`) {
    const formData = new FormData();
    formData.set("file", new File([audioBlob], fileName, { type: audioBlob.type || "audio/webm" }));
    formData.set("title", `现场语音记录-${new Date().toLocaleString("zh-CN")}`);
    formData.set("module", "documents");
    formData.set("registerDocument", "true");
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.ok === false) {
      throw new Error(String(body.error ?? "语音文件上传失败"));
    }
  }

  async function handleAudioFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || busy) return;
    setUploading(true);
    try {
      await uploadAudio(file, file.name || `voice-upload-${Date.now()}`);
      setUploading(false);
      toast.success("语音文件已进入资料库，正在尝试转写。");
      await transcribe(file, { upload: false });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "语音文件上传失败");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-panel/60 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">语音备注</p>
          <p className="mt-1 text-sm text-muted">可直接录音或上传音频，语音文件会同步进入资料库集中保存。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={recording ? "danger" : "secondary"} onClick={recording ? stopRecording : startRecording} disabled={!recording && (transcribing || uploading)}>
            {recording ? <Square className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
            {actionText}
          </Button>
          <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFileChange} />
          <Button type="button" variant="secondary" onClick={() => audioInputRef.current?.click()} disabled={busy}>
            <UploadCloud className="mr-2 size-4" />
            上传音频
          </Button>
        </div>
      </div>
      {recordingSupport.checked && !recordingSupport.supported && <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{recordingSupport.message}</div>}
      {transcript && <div className="mt-3 rounded-xl border border-border/70 bg-panel-soft p-3 text-sm text-slate-100">{transcript}</div>}
    </div>
  );
}

type RecordingSupport = {
  checked: boolean;
  supported: boolean;
  message: string;
};

function checkRecordingSupport(): RecordingSupport {
  if (typeof window === "undefined") {
    return { checked: false, supported: false, message: "正在检测当前浏览器录音能力。" };
  }
  const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
  if (!window.isSecureContext && !isLocalhost) {
    return {
      checked: true,
      supported: false,
      message: "当前访问地址不支持麦克风，请使用 HTTPS 正式域名或上传音频文件。",
    };
  }
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
    return {
      checked: true,
      supported: false,
      message: "当前浏览器不支持网页录音，请更换浏览器或上传音频文件。",
    };
  }
  return { checked: true, supported: true, message: "当前浏览器支持录音。" };
}
