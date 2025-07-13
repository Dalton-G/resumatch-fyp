"use client";
import { api } from "@/config/directory";
import { useCurrentResumeContent } from "@/hooks/use-resume-content";
import { useChat } from "@ai-sdk/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef } from "react";

interface ResumeChatPanelProps {
  s3Url: string;
}

export const ResumeChatPanel = ({ s3Url }: ResumeChatPanelProps) => {
  console.log("ResumeChatPanel rendered with s3Url:", s3Url);

  const {
    data: extractedText,
    isLoading,
    isError,
    error,
  } = useCurrentResumeContent({ s3Url });

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: api.chatWithResume,
    body: {
      resumeContext: extractedText || "No resume content available yet.",
      metadata: {
        resumeUrl: s3Url,
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          Extracting text from your resume...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-red-500">
        <div className="text-center">
          <p className="font-semibold">Failed to extract resume text</p>
          <p className="text-sm mt-1">
            {(error as Error).message ||
              "Please try uploading your resume again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-10.1rem)] max-h-[calc(100vh-10.1rem)] min-w-full mx-auto p-4 bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-black py-8 text-2xl my-6">
              <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Start a conversation with ResuMatch's AI Assistant!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === "user" ? (
                    <div className="w-8 h-8 bg-[var(--r-blue)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-[var(--r-blue)] text-white"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-[var(--r-blue)]"
            disabled={isLoading || !input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
