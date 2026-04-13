import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';

import { cn } from '@/lib/utils';

interface RichContentProps {
  content?: string | null;
  className?: string;
}

export function RichContent({ content, className }: RichContentProps) {
  const normalizedContent = String(content || '').replace(/\r\n/g, '\n').trim();

  if (!normalizedContent) {
    return null;
  }

  return (
    <div
      className={cn(
        'prose prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-headings:mb-6 md:prose-headings:mb-7 prose-h2:mt-10 prose-h3:mt-10 prose-h3:mb-7 md:prose-h3:mb-8 prose-a:text-primary prose-img:rounded-lg prose-img:my-6 prose-table:w-full prose-th:text-left prose-th:font-semibold prose-td:align-top',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
}
