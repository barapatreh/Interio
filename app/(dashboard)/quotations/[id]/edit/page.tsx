'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditQuotationRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/quotations/new?id=${id}`);
    } else {
      router.replace('/quotations');
    }
  }, [id, router]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading quotation editor...</span>
      </div>
    </div>
  );
}
