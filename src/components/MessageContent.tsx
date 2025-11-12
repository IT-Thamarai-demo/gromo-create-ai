import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageContentProps {
  content: string;
  role: 'user' | 'assistant';
}

export default function MessageContent({ content, role }: MessageContentProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, lang: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(lang);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (role === 'user') {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const isInline = !className?.includes('language-');

            if (!isInline && lang) {
              return (
                <div className="relative group my-4">
                  <div className="flex items-center justify-between bg-[#282c34] rounded-t-lg px-4 py-2 border-b border-gray-700">
                    <span className="text-xs text-gray-400 font-mono">{lang}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(codeString, lang)}
                      className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      {copiedCode === lang ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          <span className="text-xs">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          <span className="text-xs">Copy code</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark as any}
                    language={lang}
                    PreTag="div"
                    customStyle={{ marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
                    showLineNumbers
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-400" {...props}>
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 leading-7">{children}</p>;
          },
          ul({ children }) {
            return <ul className="list-disc list-inside mb-4 space-y-2">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside mb-4 space-y-2">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-7">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mb-3 mt-5">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="text-lg font-bold mb-2 mt-4">{children}</h3>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border border-border">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="border border-border px-4 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
