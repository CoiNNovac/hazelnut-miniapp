import type { RoadmapItem } from '@/types';
import { cn } from '@/lib/utils';

interface RoadmapTimelineProps {
  roadmap: RoadmapItem[];
}

export default function RoadmapTimeline({ roadmap }: RoadmapTimelineProps) {
  return (
    <div className="space-y-8">
      {roadmap.map((item, index) => (
        <div key={index} className="relative">
          {/* Timeline line */}
          {index < roadmap.length - 1 && (
            <div className="absolute left-3 top-12 w-0.5 h-full bg-white/10" />
          )}

          {/* Quarter indicator */}
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 relative z-10',
                item.status === 'completed'
                  ? 'bg-text-muted'
                  : item.status === 'active'
                  ? 'bg-success'
                  : 'bg-white/20'
              )}
            >
              {item.status === 'completed' && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div className="flex-1 pb-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-semibold text-text-muted">{item.quarter}</span>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
              </div>

              <ul className="space-y-2">
                {item.items.map((subItem, subIndex) => (
                  <li key={subIndex} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-primary mt-1">•</span>
                    <span>{subItem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
