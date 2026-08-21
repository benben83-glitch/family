import Image from "next/image";

export default function ExplorersLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="explorers-theme relative isolate overflow-hidden">
      <Image
        src="/images/explorers-background.png"
        alt=""
        fill
        priority
        className="object-cover -z-20"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-white/55" />
      <div className="relative">{children}</div>
    </div>
  );
}
