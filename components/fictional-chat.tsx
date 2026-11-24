"use client";

import Image from "next/image";
import { ArrowLeft, Heart, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/ai-chat";
import type { FictionalProfile } from "@/lib/fictional-profiles";

type Props = {
  profile: FictionalProfile;
  messages: ChatMessage[];
  loading: boolean;
  mode: "demo" | "ai";
  onBack: () => void;
  onSend: (message: string) => void;
};

const starters = [
  "What have you been enjoying lately?",
  "What's your ideal weekend?",
  "Tell me about your favourite hobby.",
];

export default function FictionalChat({
  profile,
  messages,
  loading,
  mode,
  onBack,
  onSend,
}: Props) {
  const [draft, setDraft] = useState("");
  const endOfMessages = useRef<HTMLDivElement>(null);
  const hasUserMessage = messages.some((message) => message.role === "user");

  useEffect(() => {
    endOfMessages.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || loading) return;
    setDraft("");
    onSend(message);
  }

  return (
    <section className="chat-page page-wrap" aria-label={`Fictional AI chat with ${profile.name}`}>
      <button className="back-link" onClick={onBack}><ArrowLeft size={16} /> Back to AI matches</button>
      <div className="chat-shell">
        <header className="chat-header">
          <button className="chat-back-button" onClick={onBack} aria-label="Back to AI matches"><ArrowLeft size={18} /></button>
          <span className="chat-avatar"><Image src={profile.portrait} alt="" fill sizes="48px" /></span>
          <div className="chat-title">
            <h1>{profile.name}, {profile.age}</h1>
            <span><i /> Simulated presence · fictional AI character</span>
          </div>
          <span className="chat-ai-badge"><Sparkles size={13} /> AI</span>
        </header>

        <div className="chat-disclosure" role="note">
          <Sparkles size={15} />
          <span>You&apos;re chatting with a fictional AI character, not a real person. {mode === "demo" ? "Demo conversation mode is active; no AI API key is configured." : "AI replies use your server-configured chat provider."}</span>
        </div>

        <div className="chat-messages" aria-live="polite" aria-label="Conversation">
          <div className="chat-welcome">
            <span className="chat-welcome-icon"><Heart size={15} fill="currentColor" /></span>
            <b>You and {profile.name} matched on {profile.hobbies.slice(0, 2).join(" and ")}.</b>
            <span>Say hello and see where a little conversation goes.</span>
          </div>
          {messages.map((message) => (
            <article className={`chat-message ${message.role === "user" ? "chat-message-user" : "chat-message-character"}`} key={message.id}>
              {message.role === "assistant" && <span className="chat-message-avatar"><Image src={profile.portrait} alt="" fill sizes="28px" /></span>}
              <div className="chat-bubble-wrap">
                <p className="chat-bubble">{message.content}</p>
                <time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</time>
              </div>
            </article>
          ))}
          {loading && (
            <div className="chat-typing" role="status" aria-label={`${profile.name} is typing a simulated reply`}>
              <span className="chat-message-avatar"><Image src={profile.portrait} alt="" fill sizes="28px" /></span>
              <span className="chat-typing-dots"><i /><i /><i /></span>
              <small>{profile.name} is typing · simulated</small>
            </div>
          )}
          {!hasUserMessage && !loading && messages.length > 0 && (
            <div className="chat-starters">
              <span>Conversation starters</span>
              {starters.map((starter) => <button key={starter} onClick={() => onSend(starter)}>{starter}</button>)}
            </div>
          )}
          <div ref={endOfMessages} />
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <div className="chat-emoji-row" aria-label="Add an emoji">
            {["😊", "✨", "💛", "😂"].map((emoji) => (
              <button type="button" key={emoji} aria-label={`Add ${emoji}`} onClick={() => setDraft((value) => `${value}${emoji}`)}>{emoji}</button>
            ))}
          </div>
          <label className="chat-input-wrap">
            <span className="sr-only">Your message</span>
            <input maxLength={1000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={`Message ${profile.name}…`} disabled={loading} />
          </label>
          <button className="chat-send-button" type="submit" disabled={!draft.trim() || loading} aria-label="Send message"><Send size={17} /></button>
        </form>
        <p className="chat-local-note">Demo chat history is saved only in this browser. Character replies are simulated.</p>
      </div>
    </section>
  );
}
