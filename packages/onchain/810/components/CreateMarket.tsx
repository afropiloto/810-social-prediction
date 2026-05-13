'use client';

import { useState } from 'react';
import { Info, Image as ImageIcon, Plus, ArrowRight, ArrowLeft, CheckCircle2, Share2, ExternalLink } from 'lucide-react';
import { createMarket } from '@/lib/api';

export default function CreateMarket({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [liquidity, setLiquidity] = useState(500);

  const [question, setQuestion] = useState('');
  const [creatorHandle, setCreatorHandle] = useState('');
  const [platform, setPlatform] = useState('X (Twitter)');
  const [metric, setMetric] = useState('Reposts / Retweets');
  const [targetUrl, setTargetUrl] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createMarket({
        question,
        creatorHandle,
        platform,
        metric,
        targetUrl,
        deadline,
        yesPool: liquidity,
        noPool: liquidity,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Failed to create market. Please try again.");
    }
  };

  const resetForm = () => {
    setStep(1);
    setIsSuccess(false);
    setLiquidity(500);
    setQuestion('');
    setCreatorHandle('');
    setPlatform('X (Twitter)');
    setMetric('Reposts / Retweets');
    setTargetUrl('');
    setDeadline('');
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl text-center py-12">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-ink">Market Created!</h1>
        <p className="mb-8 text-muted">Your market is now live and ready for trading.</p>
        
        <div className="rounded-xl border border-border bg-panel p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-bg border border-border flex items-center justify-center text-xl font-bold">
              @
            </div>
            <div>
              <h3 className="font-medium text-ink">{question || 'Will my launch tweet get 5,000 reposts?'}</h3>
              <p className="text-sm text-muted">Initial Liquidity: {liquidity} USDT</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold text-black hover:opacity-90 transition-opacity">
            <Share2 className="h-4 w-4" /> Share Market
          </button>
          <button onClick={onSuccess} className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-border bg-panel px-6 py-3 font-medium text-ink hover:bg-bg transition-colors">
            <ExternalLink className="h-4 w-4" /> View Market
          </button>
        </div>
        <button onClick={resetForm} className="mt-8 text-sm text-muted hover:text-ink transition-colors">
          Create another market
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Create New Market</h1>
        <p className="text-muted">Define a clear, measurable social outcome.</p>
      </div>

      <div className="rounded-xl border border-border bg-panel p-6 md:p-8">
        <div className="mb-8 flex items-center gap-2 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 thumb-scrollbar">
          <Step number={1} label="Details" active={step === 1} completed={step > 1} />
          <div className="h-px w-8 sm:flex-1 bg-border shrink-0"></div>
          <Step number={2} label="Resolution" active={step === 2} completed={step > 2} />
          <div className="h-px w-8 sm:flex-1 bg-border shrink-0"></div>
          <Step number={3} label="Funding" active={step === 3} completed={step > 3} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: DETAILS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Market Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Will my launch tweet get 5,000 reposts?"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
                <p className="text-xs text-muted">Frame this as a prediction about a specific outcome.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Target Entity / Handle</label>
                <input
                  type="text"
                  required
                  value={creatorHandle}
                  onChange={(e) => setCreatorHandle(e.target.value)}
                  placeholder="e.g. @LouisVuitton, @ManUtd, @mrbeast"
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Platform</label>
                  <select 
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
                  >
                    <option>X (Twitter)</option>
                    <option>YouTube</option>
                    <option>Instagram</option>
                    <option>TikTok</option>
                    <option>LinkedIn</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink">Target Metric</label>
                  <select 
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
                  >
                    <option>Reposts / Retweets</option>
                    <option>Likes</option>
                    <option>Views / Impressions</option>
                    <option>Comments</option>
                    <option>Follower Growth</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Link to Post / Profile</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://x.com/username/status/..."
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* STEP 2: RESOLUTION */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Resolution Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent focus:ring-1 focus:ring-accent text-ink"
                />
                <p className="text-xs text-muted">When will this market officially close and resolve?</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Resolution Source</label>
                <select className="w-full rounded-lg border border-border bg-bg px-4 py-3 outline-none focus:border-accent">
                  <option>810 Automated Oracle (API)</option>
                  <option>Manual Resolution (Creator)</option>
                  <option>Community Vote (UMA)</option>
                </select>
                <p className="flex items-center gap-1 text-xs text-muted mt-2">
                  <Info className="h-3 w-3" /> Automated Oracle is recommended for standard social metrics.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-ink">Market Image (Optional)</label>
                <div className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-bg py-8 transition-colors hover:border-muted">
                  <ImageIcon className="mb-2 h-8 w-8 text-muted" />
                  <p className="text-sm text-muted">Click to upload or drag and drop</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FUNDING */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-accent">Initial Liquidity Provision</h3>
                  <p className="text-xs text-muted mt-1">Seed the market to make it tradeable. You will earn 1% of all trading volume as the market creator.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">Amount (USDT)</span>
                    <span className="text-sm font-mono font-bold text-ink">{liquidity.toLocaleString()}.00</span>
                  </div>
                  <input 
                    type="range" 
                    min="100" 
                    max="10000" 
                    step="100"
                    value={liquidity}
                    onChange={(e) => setLiquidity(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-xs text-muted">
                    <span>Min: 100</span>
                    <span>Max: 10,000</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-bg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Network Fee</span>
                  <span className="font-mono text-ink">2.50 USDT</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Liquidity Provision</span>
                  <span className="font-mono text-ink">{liquidity.toLocaleString()}.00 USDT</span>
                </div>
                <div className="h-px w-full bg-border"></div>
                <div className="flex justify-between font-medium">
                  <span className="text-ink">Total Required</span>
                  <span className="font-mono text-ink">{(liquidity + 2.5).toLocaleString()} USDT</span>
                </div>
              </div>
            </div>
          )}

          {/* NAVIGATION BUTTONS */}
          <div className="pt-6 flex items-center justify-between border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-ink transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div></div> // Empty div to keep "Next" button on the right
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-lg bg-accent px-6 py-2.5 text-sm font-bold text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
                    Confirming...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create & Stake
                  </span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Step({ number, label, active, completed }: { number: number, label: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${
          active
            ? "border-accent bg-accent text-black"
            : completed
            ? "border-success bg-success text-white"
            : "border-border bg-bg text-muted"
        }`}
      >
        {completed ? "✓" : number}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${active ? "text-ink" : "text-muted"}`}>{label}</span>
    </div>
  );
}
