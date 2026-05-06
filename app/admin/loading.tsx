import { BrandLoader } from '@/components/loader';

export default function AdminLoading() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
      <BrandLoader color="bg-violet-400" />
    </div>
  );
}
