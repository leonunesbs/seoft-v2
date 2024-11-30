'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '../ui/button';

type SignedLinkProps = {
  fileName: string;
  action?: 'download' | 'upload';
  children?: React.ReactNode;
  className?: string;
};

export function SignedLink({ fileName, action = 'download', children, className }: SignedLinkProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await fetch(`/api/s3?action=${action}&fileName=${encodeURIComponent(fileName)}`);
        const data = await response.json();
        if (action === 'download') {
          setSignedUrl(data.downloadUrl);
        }
      } catch (error) {
        console.error(`Erro ao buscar URL para ${fileName}:`, error);
      }
    };

    fetchSignedUrl();
  }, [fileName, action]);

  if (!signedUrl) {
    return <span className="text-muted-foreground">Carregando link...</span>;
  }

  return (
    <Button asChild variant={'link'}>
      <Link href={signedUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children || 'Abrir Documento'}
      </Link>
    </Button>
  );
}
