import Image from "next/image";

export default function ExplorersLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="explorers-theme isolate overflow-hidden">
      <Image
        src="/images/explorers-background.png"
        alt=""
        fill
        priority
        className="object-cover -z-20"
        sizes="100vw"
      />
      <div className="relative max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
