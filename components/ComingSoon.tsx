type ComingSoonProps = {
  title: string;
};

export function ComingSoon({ title }: ComingSoonProps) {
  return (
    <section className="coming-soon" aria-labelledby="coming-soon-title">
      <h1 id="coming-soon-title">{title}</h1>
      <p className="coming-soon-lead">Coming soon</p>
      <p className="coming-soon-copy">
        This area is on the roadmap. You can keep using the dashboard and hourly
        forecast in the meantime.
      </p>
    </section>
  );
}