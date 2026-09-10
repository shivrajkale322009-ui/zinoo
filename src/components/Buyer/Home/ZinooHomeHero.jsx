export default function ZinooHomeHero() {
  return (
    <section className="zinoo-home-hero" aria-labelledby="zinoo-home-hero-title">
      <div className="zinoo-home-hero-copy">
        <span className="zinoo-home-hero-eyebrow">Zinoo Residential Plots</span>
        <h1 id="zinoo-home-hero-title">
          Find the right plot.<br />
          <strong>With complete confidence.</strong>
        </h1>
        <p>
          Discover residential plots selected for clarity, value and a
          better buying experience.
        </p>
      </div>
      <div className="zinoo-home-hero-visual" aria-hidden="true">
        <img src="/zinoo-home-hero.webp" alt="" decoding="async" fetchPriority="high" />
        <div className="zinoo-home-hero-light" />
      </div>
    </section>
  );
}
