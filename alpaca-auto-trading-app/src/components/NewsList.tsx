'use client';
import type { NewsItem } from '@/src/types/market';
import clsx from 'classnames';

export default function NewsList({ items }: { items: NewsItem[] }) {
  return (
    <ul className="divide-y divide-neutral-800">
      {items.map(n=> (
        <li key={n.id} className="py-3">
          <a href={n.url} target="_blank" className="font-medium hover:underline">{n.headline}</a>
          <div className="text-sm opacity-80">{new Date(n.publishedAt).toLocaleString()} · {n.source}</div>
          {typeof n.sentiment==='number' && (
            <div className={clsx("text-sm font-semibold", n.sentiment>0.1?'text-green-500': n.sentiment<-0.1?'text-red-500':'text-yellow-500')}>
              Sentiment: {n.sentiment.toFixed(2)}
            </div>
          )}
          {n.summary && <p className="text-sm opacity-90 mt-1">{n.summary}</p>}
        </li>
      ))}
    </ul>
  );
}
