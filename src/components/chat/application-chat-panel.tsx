"use client";

import { api } from "@/config/directory";
import { useChat, Message } from "@ai-sdk/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Bot,
  Send,
  User,
  FileText,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  Trash2,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Badge } from "../ui/badge";

interface ApplicationChatPanelProps {
  resumeContent: string;
  jobDescription: string;
  candidateName: string;
  persistentMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompt: string;
}

const quickActions: QuickAction[] = [
  {
    id: "summarize",
    label: "Summarize Resume",
    icon: <FileText className="w-4 h-4" />,
    prompt:
      "Please provide a concise summary of this candidate's background, key skills, and experience level.",
  },
  {
    id: "strengths",
    label: "Identify Strengths",
    icon: <Lightbulb className="w-4 h-4" />,
    prompt:
      "What are the candidate's main strengths and how do they align with our job requirements?",
  },
  {
    id: "gaps",
    label: "Skill Gaps",
    icon: <HelpCircle className="w-4 h-4" />,
    prompt:
      "What skills or experience might be missing from this candidate's background for this role?",
  },
  {
    id: "interview",
    label: "Interview Questions",
    icon: <MessageCircle className="w-4 h-4" />,
    prompt:
      "Generate 5-7 specific interview questions I should ask this candidate based on their background and our job requirements.",
  },
];

export const ApplicationChatPanel = ({
  resumeContent,
  jobDescription,
  candidateName,
  persistentMessages = [],
  onMessagesChange,
}: ApplicationChatPanelProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: api.chatWithApplication,
    initialMessages: persistentMessages,
    body: {
      resumeContent: resumeContent || "No resume content available.",
      jobDescription: jobDescription || "No job description available.",
      candidateName: candidateName || "Unknown Candidate",
    },
  });

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Update parent component with current messages for persistence
  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  const handleQuickAction = async (action: QuickAction) => {
    // Create a synthetic form submission event
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    // Update input field with the prompt
    const inputChangeEvent = {
      target: { value: action.prompt },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(inputChangeEvent);

    // Submit the form with the action prompt
    setTimeout(() => {
      handleSubmit(fakeEvent);
    }, 50);
  };

  const handleClearChat = () => {
    setMessages([]);
    if (onMessagesChange) {
      onMessagesChange([]);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full">
      {/* Quick Actions */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="text-md font-medium text-[var(--r-boldgray)]">
            Quick Actions
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Chat
            </Button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAction(action)}
              disabled={status === "submitted" || status === "streaming"}
              className="flex items-center gap-2 justify-start text-md h-10"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-black py-8">
              <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <div className="text-lg font-medium mb-2">
                Chat with Application Assistant
              </div>
              <div className="text-sm text-[var(--r-boldgray)] mb-4">
                Get insights about {candidateName}'s qualifications and fit for
                this role
              </div>
              <div className="text-xs text-gray-500">
                Try the quick actions above or ask your own questions!
              </div>
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
                className={`flex gap-3 max-w-[85%] ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === "user" ? (
                    <div className="w-8 h-8 bg-[var(--r-blue)] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-[var(--r-blue)] text-white"
                      : "bg-muted"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-md leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show thinking bubble when AI is processing */}
          {status === "submitted" && (
            <div className="flex gap-3 justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted">
                  <div className="flex items-center space-x-2">
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
                    <span className="text-sm text-gray-500 ml-2">
                      AI is analyzing...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about this candidate..."
            disabled={status === "submitted" || status === "streaming"}
            className="flex-1 text-md"
          />
          <Button
            type="submit"
            className="bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80"
            disabled={
              status === "submitted" || status === "streaming" || !input.trim()
            }
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
