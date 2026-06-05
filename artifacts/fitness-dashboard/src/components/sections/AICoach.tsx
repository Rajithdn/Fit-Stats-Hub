import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";

type Message = {
  role: "user" | "ai";
  content: string;
};

export function AICoach() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI Fitness Coach. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const suggestions = [
    "How much protein is in 4 eggs?",
    "What should I eat after workout?",
    "How many calories do I need to lose weight?",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    // Mock AI response
    setTimeout(() => {
      let response = "That's a great question. Maintaining a balanced diet and consistent workout routine is key.";
      if (text.toLowerCase().includes("protein") && text.toLowerCase().includes("eggs")) {
        response = "4 large eggs contain approximately 24-25 grams of high-quality protein (about 6g per egg).";
      } else if (text.toLowerCase().includes("after workout")) {
        response = "After a workout, aim for a mix of fast-digesting protein and carbs. A whey protein shake with a banana, or chicken breast with white rice are excellent choices to replenish glycogen and start muscle repair.";
      }
      
      setMessages(prev => [...prev, { role: "ai", content: response }]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <Card className="h-full flex flex-col bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> TermFit AI Coach
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className={`p-3 rounded-lg max-w-[80%] text-sm ${
                  msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
                }`}>
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/40 bg-card/50">
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestions.map((s, i) => (
              <button 
                key={i} 
                onClick={() => handleSend(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border/60 bg-background hover:bg-accent/10 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex gap-2"
          >
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1"
              data-testid="input-ai-chat"
            />
            <Button type="submit" size="icon" disabled={!input.trim()} data-testid="button-send-chat">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
