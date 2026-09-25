import { Info } from 'lucide-react';

export default function AdminFooter() {
  return (
    <footer className="flex items-center gap-2 justify-center py-4 text-xs text-gray-400">
      <Info className="h-3.5 w-3.5" strokeWidth={1.8} />
      <span>Data dashboard diperbarui setiap hari pukul 23:59 WIB.</span>
    </footer>
  );
}
