export function Ambient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bg-rose-500/[0.07] absolute -top-48 left-1/2 h-[42rem] w-[62rem] -translate-x-1/2 rounded-full blur-[130px]" />
      <div className="bg-pink-500/[0.05] absolute -bottom-56 -left-32 h-[38rem] w-[38rem] rounded-full blur-[130px]" />
      <div className="bg-rose-400/[0.04] absolute -right-40 top-1/3 h-[34rem] w-[34rem] rounded-full blur-[130px]" />
    </div>
  );
}
