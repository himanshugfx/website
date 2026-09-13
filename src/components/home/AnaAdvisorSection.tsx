'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  MessageCircle,
  ArrowRight,
  Send,
  Bot,
  Zap,
  ShieldCheck,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  {
    icon: '✨',
    text: 'Build my 3-step morning skincare routine',
    query: 'Can you build a simple 3-step morning skincare routine for my skin?',
  },
  {
    icon: '🧴',
    text: 'Which facewash is best for oily & acne-prone skin?',
    query: 'Which Anose facewash is best for oily and acne-prone skin?',
  },
  {
    icon: '🌿',
    text: 'Indian home remedies for glowing skin',
    query: 'Share some authentic Indian home remedies for natural glowing skin',
  },
  {
    icon: '🎁',
    text: 'What promo codes or discounts are active today?',
    query: 'What promo codes or active discounts are available right now?',
  },
  {
    icon: '☀️',
    text: 'Is SPF50 sunscreen safe for daily use without white cast?',
    query: 'Tell me about the SPF50 Sunscreen. Does it leave a white cast in hot weather?',
  },
];

export default function AnaAdvisorSection() {
  const [customQuestion, setCustomQuestion] = useState('');

  const triggerAna = (message?: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-ana', {
          detail: { message: message?.trim() || undefined },
        })
      );
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) {
      triggerAna();
      return;
    }
    triggerAna(customQuestion);
    setCustomQuestion('');
  };

  return (
    <section className="ana-advisor-section py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Luxury Glowing Container */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-purple-950 via-zinc-950 to-purple-950 border border-purple-500/25 shadow-2xl p-6 sm:p-10 lg:p-14 text-white">
          {/* Ambient Glows */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-purple-600/30 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Value Prop, Question Chips */}
            <div className="lg:col-span-7 flex flex-col items-start">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-purple-200 text-xs font-bold tracking-wider uppercase mb-5 shadow-sm backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
                <span>Meet Ana • 24/7 AI Skincare Advisor</span>
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter uppercase leading-[1.1] mb-4">
                Not Sure What Your Skin Needs?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-200 to-white">
                  Ask Ana.
                </span>
              </h2>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed mb-6 font-normal">
                Skip the confusion. Ana is your personal AI beauty consultant —
                trained on Ayurvedic botanicals, modern dermatological science, and
                every Anose formula. Get personalized routines, ingredient breakdowns,
                and active promo codes in seconds.
              </p>

              {/* Interactive Prompt Chips */}
              <div className="w-full mb-6">
                <div className="text-xs uppercase tracking-widest text-purple-300 font-bold mb-3 flex items-center gap-1.5">
                  <span>Popular Questions People Ask Ana:</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerAna(q.query)}
                      className="group flex items-center gap-2 text-xs sm:text-sm font-medium bg-white/10 hover:bg-purple-600/40 active:scale-95 border border-white/15 hover:border-purple-400/50 rounded-full px-3.5 py-2 transition-all duration-300 text-zinc-200 hover:text-white backdrop-blur-sm"
                    >
                      <span>{q.icon}</span>
                      <span>{q.text}</span>
                      <ArrowRight className="w-3 h-3 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Area: Custom Question Input & CTA */}
              <div className="w-full max-w-lg mt-2">
                <form
                  onSubmit={handleCustomSubmit}
                  className="relative flex items-center bg-white/10 border border-purple-400/30 rounded-2xl p-1.5 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/30 transition-all backdrop-blur-md"
                >
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder="Type your skin question here (e.g. routine for glow)..."
                    className="w-full bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-400 outline-none"
                  />
                  <button
                    type="submit"
                    className="flex-shrink-0 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/30"
                  >
                    <span>Ask Ana</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Trust Micro-Pills */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-white/10 text-[11px] sm:text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Answers</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>Custom Routine Generator</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>100% Free Consultation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Simulated Live Chat Preview Card */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 sm:p-6 shadow-2xl relative">
                {/* Chat Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-purple-700/60 p-0.5 ring-2 ring-purple-400/40 overflow-hidden flex items-center justify-center">
                        <Image
                          src="/assets/images/ana-character.webp"
                          alt="Ana AI"
                          width={44}
                          height={44}
                          className="object-cover rounded-full"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-zinc-900 rounded-full" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <span>Ana</span>
                        <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full font-medium">
                          AI Skincare Expert
                        </span>
                      </div>
                      <div className="text-[11px] text-green-400 font-medium">
                        ● Online • Ready to help
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAna()}
                    className="text-[11px] font-bold text-purple-300 hover:text-white transition-colors uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full border border-white/10 hover:border-purple-400/40"
                  >
                    Open Full Chat
                  </button>
                </div>

                {/* Simulated Conversation */}
                <div className="space-y-3.5 text-xs sm:text-sm">
                  {/* Visitor Message */}
                  <div className="flex justify-end">
                    <div className="bg-purple-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-md">
                      My skin feels dry & dull after travel. Which product will help restore my glow?
                    </div>
                  </div>

                  {/* Ana Reply */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-purple-600/40 flex-shrink-0 mt-1">
                      <Image
                        src="/assets/images/ana-character.webp"
                        alt="Ana"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <div className="bg-white/15 border border-white/10 text-zinc-100 rounded-2xl rounded-tl-none p-3.5 max-w-[90%] space-y-2 leading-relaxed backdrop-blur-md">
                      <p>
                        I recommend starting with our gentle <strong>Herbal Facewash</strong>, followed immediately by <strong>Anose FaceCream (15g)</strong> ✨
                      </p>
                      <p className="text-[11px] text-purple-200">
                        🌿 It contains Sandalwood and Jojoba to deeply lock in moisture without clogging pores. Use coupon code <span className="bg-white/20 px-1 py-0.5 rounded font-bold text-white">DR-OAS</span> for an extra 10% off!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Launch Button */}
                <button
                  onClick={() => triggerAna('Hi Ana, I would like personalized skincare recommendations for my skin')}
                  className="w-full mt-5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 group"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Live Conversation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
