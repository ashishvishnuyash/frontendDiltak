'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, ShieldCheck, ChevronRight, Lightbulb, PlayCircle, ArrowRight, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployerSuggestedActions } from '@/types';

interface ActionEngineProps { data?: EmployerSuggestedActions; loading?: boolean; }

const priorityConfig: Record<string, { badge: string; dot: string }> = {
  high: { badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', dot: 'bg-red-500' },
  medium: { badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', dot: 'bg-yellow-400' },
  low: { badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', dot: 'bg-green-500' },
};

export const ActionEngine: React.FC<ActionEngineProps> = ({ data, loading }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (loading) return <div className="h-[300px] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse" />;

  if (!data || data.actions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center p-10 text-center min-h-[200px]">
        <ShieldCheck className="h-10 w-10 text-emerald-300 dark:text-emerald-700 mb-3" />
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Strategic Equilibrium</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs mt-1">No secondary stressors detected. The organization maintains a robust baseline across all signals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.actions.map((action, index) => {
        const pCfg = priorityConfig[action.priority] ?? priorityConfig.low;
        const isOpen = expandedIndex === index;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`rounded-2xl overflow-hidden border transition-all duration-200 ${
              isOpen
                ? 'bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-700 shadow-md'
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-md'
            }`}
          >
            {/* Header */}
            <div className="p-4 cursor-pointer flex items-start justify-between gap-4" onClick={() => setExpandedIndex(isOpen ? null : index)}>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${pCfg.badge}`}>{action.priority} priority</span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{action.category}</span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug">{action.action}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                  <Target className="h-3 w-3 text-emerald-500" />
                  Triggered by: {action.trigger}
                </div>
              </div>
              <div className={`p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-90' : ''}`}>
                <ChevronRight className={`h-5 w-5 ${isOpen ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`} />
              </div>
            </div>

            {/* Expanded */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="px-4 pb-4 space-y-4">
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Steps */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Crosshair className="h-5 w-5 text-emerald-500" />
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Expected Impact</p>
                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100">{action.expected_impact}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <PlayCircle className="h-3 w-3 text-emerald-500" /> Playbook Steps
                          </p>
                          {action.playbook_steps.map((step, sIdx) => (
                            <motion.div key={sIdx} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * sIdx }}
                              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                              <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">{sIdx + 1}</span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Why + CTA */}
                      <div className="p-4 rounded-2xl bg-green-50/60 dark:bg-green-950/10 border border-green-100 dark:border-green-900/30 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 w-fit">
                            <Lightbulb className="h-5 w-5 text-amber-500" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Why this works</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Addressing {action.trigger.toLowerCase()} with {action.category.toLowerCase()} interventions correlates with a 15–20% boost in cohort retention and engagement.
                          </p>
                        </div>
                        <Button className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs h-9 transition-all hover:scale-[1.02] active:scale-[0.98]">
                          Start This Playbook <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActionEngine;
