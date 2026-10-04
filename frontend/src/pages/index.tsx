import Link from 'next/link';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/MainLayout';
import { ArrowRight, Brain, FileText, MessageSquare, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-16 py-6">
        {/* Hero Section */}
        <section className="text-center space-y-6 py-12 md:py-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" /> Direct Access — No Login Needed
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Your AI-Powered Study Assistant
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your study materials and get instant, accurate answers to your questions using advanced RAG and Gemini AI.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/chat">
              <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20">
                Start Chatting Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/documents">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Upload Documents
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center p-6 rounded-xl border bg-card/50 shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">AI-Powered Responses</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Get accurate and contextual answers based on your study materials.
            </p>
          </div>

          <div className="space-y-4 text-center p-6 rounded-xl border bg-card/50 shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Document Upload</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Upload your PDFs, DOCs, and text notes for instant semantic retrieval.
            </p>
          </div>

          <div className="space-y-4 text-center p-6 rounded-xl border bg-card/50 shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Interactive Chat</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Have natural conversations with AI about your uploaded study materials.
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="space-y-8 p-8 rounded-2xl border bg-muted/30">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                1
              </div>
              <p className="font-semibold text-sm">Upload Documents</p>
              <p className="text-xs text-muted-foreground">Add your notes or course PDF files</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                2
              </div>
              <p className="font-semibold text-sm">Process & Index</p>
              <p className="text-xs text-muted-foreground">Vector embeddings are calculated</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                3
              </div>
              <p className="font-semibold text-sm">Ask Questions</p>
              <p className="text-xs text-muted-foreground">Type any query in the chatbox</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="mx-auto w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-lg">
                4
              </div>
              <p className="font-semibold text-sm">Get Instant Answers</p>
              <p className="text-xs text-muted-foreground">Receive context-rich AI answers</p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}