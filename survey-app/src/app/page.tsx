import Link from 'next/link';

export default function Home() {
  return (
    <main className="container flex flex-col items-center justify-center min-h-[80vh] text-center gap-6 animate-in">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto mt-12">
        <h1 className="text-5xl md:text-6xl font-heading text-gradient mb-2">
          Create Surveys that Convert
        </h1>
        <p className="text-xl text-muted">
          Design beautiful, responsive surveys in minutes. Collect meaningful feedback instantly.
        </p>
      </div>

      <div className="flex gap-4 mt-8 justify-center">
        <Link href="/create" className="btn btn-primary text-lg px-8 py-4">
          Create a Survey
        </Link>
      </div>

      <div className="card mt-16 text-left grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto">
        <div>
          <h3 className="text-xl font-heading mb-2 text-primary">Intuitive Builder</h3>
          <p className="text-muted">Simple functionality to create surveys blazingly fast without code.</p>
        </div>
        <div>
          <h3 className="text-xl font-heading mb-2 text-primary">Instant Analytics</h3>
          <p className="text-muted">View responses in real-time with automatically formatted outputs.</p>
        </div>
        <div>
          <h3 className="text-xl font-heading mb-2 text-primary">Beautiful Design</h3>
          <p className="text-muted">Surveys that look vibrant and modern natively on any device.</p>
        </div>
      </div>
    </main>
  );
}
