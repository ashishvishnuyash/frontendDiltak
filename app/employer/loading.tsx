import { BrandLoader } from '@/components/loader';

export default function EmployerLoading() {
  return (
    <div className="min-h-[calc(100vh-60px)] flex items-center justify-center">
      <BrandLoader color="bg-emerald-400" />
    </div>
  );
}
