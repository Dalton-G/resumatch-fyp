interface HeadingProps {
  title: string;
}

export default function Heading({ title }: HeadingProps) {
  return (
    <div className="flex flex-col bg-white p-8 border-b-1 border-[var(--r-darkgray)] font-dm-serif">
      <h1 className="text-3xl">{title}</h1>
    </div>
  );
}
