import React, { useEffect, useRef } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
// @ts-expect-error - pdfjs-dist worker has no types
import worker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { t } from '../i18n';
import { ErrorBoundaryWrapper } from './ErrorBoundaryWrapper';

// Set worker source
GlobalWorkerOptions.workerSrc = worker as string;

interface PdfViewerProps {
  url: string;
  page?: number;
  scale?: number;
}

export default function PdfViewer({ url, page = 1, scale = 1.2 }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = React.useState(page);
  const [totalPages, setTotalPages] = React.useState(0);
  const [pdf, setPdf] = React.useState<PDFDocumentProxy | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    getDocument(url)
      .promise.then((pdfDoc) => {
        if (!mounted) return;
        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Failed to load PDF');
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [url]);

  // Render page
  useEffect(() => {
    if (!pdf || !canvasRef.current || currentPage < 1 || currentPage > totalPages) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    pdf
      .getPage(currentPage)
      .then((pdfPage) => {
        const viewport = pdfPage.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        return pdfPage.render({
          canvasContext: ctx,
          viewport,
        }).promise;
      })
      .catch((err) => {
        console.error('[PdfViewer] Failed to render page:', err);
        setError(err.message || 'Failed to render page');
      });
  }, [pdf, currentPage, totalPages, scale]);

  if (loading) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <div>{t('loading')}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red', textAlign: 'center' }}>
        {t('error')}: {error}
      </div>
    );
  }

  return (
    <ErrorBoundaryWrapper>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {totalPages > 1 && (
          <div
            style={{
              padding: '0.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center',
              borderBottom: '1px solid #ccc',
            }}
          >
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              ←
            </button>
            <span>
              {t('page')} {currentPage} {t('of')} {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
            >
              →
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      </div>
    </ErrorBoundaryWrapper>
  );
}
