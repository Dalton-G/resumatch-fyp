"use client";

import { api } from "@/config/directory";
import { useChat, Message } from "@ai-sdk/react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Bot,
  Send,
  User,
  Play,
  RefreshCw,
  Trophy,
  Target,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface InterviewPracticePanelProps {
  resumeContent: string;
  jobDescription: string;
  candidateName: string;
  persistentMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

interface InterviewState {
  currentSession: number;
  questionsAsked: number;
  isSessionActive: boolean;
  sessionComplete: boolean;
}

export const InterviewPracticePanel = ({
  resumeContent,
  jobDescription,
  candidateName,
  persistentMessages = [],
  onMessagesChange,
}: InterviewPracticePanelProps) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>({
    currentSession: 1,
    questionsAsked: 0,
    isSessionActive: false,
    sessionComplete: false,
  });

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    setMessages,
  } = useChat({
    api: api.interviewPractice,
    initialMessages: persistentMessages,
    body: {
      resumeContent: resumeContent || "No resume content available.",
      jobDescription: jobDescription || "No job description available.",
      candidateName: candidateName || "Unknown Candidate",
      interviewState,
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

  // Track interview state based on messages
  useEffect(() => {
    const userMessages = messages.filter((m) => m.role === "user");
    const aiMessages = messages.filter((m) => m.role === "assistant");

    // Filter out starter prompts to get actual answers
    const actualAnswers = userMessages.filter(
      (msg) =>
        !msg.content.includes("Hello! I'm ready to start practicing") &&
        !msg.content.includes("I'm ready for another practice session")
    );

    // Count session starter prompts to determine current session answers
    const sessionStarters = userMessages.filter(
      (msg) =>
        msg.content.includes("Hello! I'm ready to start practicing") ||
        msg.content.includes("I'm ready for another practice session")
    );

    // Calculate answers in current session
    const currentSessionAnswers =
      sessionStarters.length > 0
        ? actualAnswers.length - (sessionStarters.length - 1) * 3
        : 0;

    const actualAnswerCount = Math.max(0, currentSessionAnswers);
    const aiQuestionCount = aiMessages.length;

    // Session is complete when we have 3 answers in current session and AI has provided feedback
    if (actualAnswerCount >= 3 && aiQuestionCount > userMessages.length - 1) {
      setInterviewState((prev) => ({
        ...prev,
        questionsAsked: 3,
        sessionComplete: true,
        isSessionActive: false,
      }));
    } else if (
      userMessages.length > 0 &&
      actualAnswerCount < 3 &&
      actualAnswerCount >= 0
    ) {
      // Session is active when we have started but haven't completed 3 answers in current session
      setInterviewState((prev) => ({
        ...prev,
        questionsAsked: actualAnswerCount,
        isSessionActive: true,
        sessionComplete: false,
      }));
    }
  }, [messages]);

  const startNewSession = () => {
    const isNewSession = interviewState.sessionComplete;
    const sessionStartPrompt = isNewSession
      ? `I'm ready for another practice session. Please ask me 3 new questions.`
      : `Hello! I'm ready to start practicing for my interview. Please ask me the first question.`;

    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    const inputChangeEvent = {
      target: { value: sessionStartPrompt },
    } as React.ChangeEvent<HTMLInputElement>;

    handleInputChange(inputChangeEvent);

    setTimeout(() => {
      handleSubmit(fakeEvent);
      setInterviewState((prev) => ({
        ...prev,
        questionsAsked: 0,
        isSessionActive: true,
        sessionComplete: false,
        currentSession: prev.currentSession + (isNewSession ? 1 : 0),
      }));
    }, 50);
  };

  const handleClearInterview = () => {
    setMessages([]);
    setInterviewState({
      currentSession: 1,
      questionsAsked: 0,
      isSessionActive: false,
      sessionComplete: false,
    });
    if (onMessagesChange) {
      onMessagesChange([]);
    }
  };

  const progress = interviewState.isSessionActive
    ? (interviewState.questionsAsked / 3) * 100
    : interviewState.sessionComplete
    ? 100
    : 0;

  // Calculate current question number for display
  const currentQuestionNumber = interviewState.isSessionActive
    ? Math.min(interviewState.questionsAsked + 1, 3)
    : 1;

  return (
    <div className="flex flex-col h-full max-h-[80vh] w-full">
      {/* Interview Header & Progress */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[var(--r-blue)]" />
              <div className="text-sm font-medium text-[var(--r-boldgray)]">
                Interview Practice Session {interviewState.currentSession}
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearInterview}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          {(interviewState.isSessionActive ||
            interviewState.sessionComplete) && (
            <Badge variant="outline" className="text-xs">
              {interviewState.sessionComplete
                ? "Session Complete"
                : `Question ${currentQuestionNumber}/3`}
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {(interviewState.isSessionActive || interviewState.sessionComplete) && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-gray-600 text-center">
              {interviewState.sessionComplete
                ? "Great job! Review your feedback below."
                : `Answer the current question to proceed (${interviewState.questionsAsked}/3 completed)`}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {messages.length === 0 && (
          <Button
            onClick={startNewSession}
            disabled={status === "submitted" || status === "streaming"}
            className="w-full bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80 text-white flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Interview Practice
          </Button>
        )}

        {interviewState.sessionComplete && (
          <Button
            onClick={startNewSession}
            disabled={status === "submitted" || status === "streaming"}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mt-2"
          >
            <RefreshCw className="w-4 h-4" />
            Practice More Questions
          </Button>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-black py-8">
              <Target className="mx-auto h-12 w-12 mb-4 opacity-50 text-[var(--r-blue)]" />
              <div className="text-lg font-medium mb-2">
                Interview Practice Assistant
              </div>
              <div className="text-sm text-[var(--r-boldgray)] mb-4">
                Practice mock interviews for the{" "}
                {candidateName.split(" ")[0] || "position"} role
              </div>
              <div className="text-xs text-gray-500 max-w-md mx-auto">
                I'll ask you 3 questions per session, then provide detailed
                feedback. You can practice as many sessions as you'd like!
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
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-green-600" />
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
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
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
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-3 bg-muted">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      Preparing your interview...
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
            placeholder={
              interviewState.sessionComplete
                ? "Ask questions about your feedback or start a new session..."
                : "Type your answer here..."
            }
            disabled={status === "submitted" || status === "streaming"}
            className="flex-1"
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

        {interviewState.isSessionActive && (
          <div className="text-xs text-gray-500 mt-2 text-center">
            Take your time to provide thoughtful answers. This practice session
            helps you prepare for real interviews.
          </div>
        )}
      </div>
    </div>
  );
};
