'use client';

import { useEffect, useMemo, useState } from 'react';
import { km, money, motosDemo } from '@/lib/motos';

type CatalogListing = {
  title: string; brand: string | null; model: string | null; version: string | null;
  model_year: number | null; mileage_km: number | null; price_brl: number | null;
  city: string | null; state: string | null; listing_url: string; last_checked_at: string | null;
  sources?: { name: string } | { name: string }[] | null;
};
type CatalogResponse = { live: boolean; motorcycles?: CatalogListing[]; products?: Array<{ id: string; title: string; category: string; brand: string | null; price_brl: number; product_url: string; image_url: string | null; in_stock: boolean | null; sources?: { name: string } | { name: string }[] | null }> };

export default function Home() {
  const [catalogMotos, setCatalogMotos] = useState(motosDemo);
  const [liveData, setLiveData] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; title: string; category: string; brand: string | null; price_brl: number; product_url: string; image_url: string | null; in_stock: boolean | null; sources?: { name: string } | { name: string }[] | null }>>([]);
  useEffect(() => {
    let active = true;
    fetch('/api/catalog', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('Catalog not configured');
      return response.json() as Promise<CatalogResponse>;
    }).then((data) => {
      if (!active || !data.live) return;
      const mapped = (data.motorcycles ?? []).map((item, index: number) => ({
        id: index + 1, brand: item.brand ?? 'Não informado', model: item.model ?? item.title, version: item.version ?? '',
        year: item.model_year ?? 0, km: item.mileage_km ?? 0, price: Number(item.price_brl ?? 0),
        city: item.city ?? 'Localização não informada', state: item.state ?? '',
        source: Array.isArray(item.sources) ? item.sources[0]?.name : item.sources?.name ?? 'Fonte integrada',
        url: item.listing_url, updatedAt: item.last_checked_at ?? 'Data não informada',
      }));
      setCatalogMotos(mapped); setProducts(data.products ?? []); setLiveData(true);
    }).catch(() => { /* Keep clearly labeled demo data when backend is not configured. */ });
    return () => { active = false; };
  }, []);
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('Todas as marcas');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('pt-BR');
    const filtered = catalogMotos.filter((moto) => {
      const searchable = `${moto.brand} ${moto.model} ${moto.version} ${moto.year} ${moto.city}`.toLocaleLowerCase('pt-BR');
      return (!q || searchable.includes(q)) &&
        (brand === 'Todas as marcas' || moto.brand === brand) &&
        (!minPrice || moto.price >= Number(minPrice)) &&
        (!maxPrice || moto.price <= Number(maxPrice));
    });
    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    if (sort === 'year-desc') filtered.sort((a, b) => b.year - a.year);
    return filtered;
  }, [catalogMotos, query, brand, minPrice, maxPrice, sort]);

  return (
    <main>
      <header className="topbar">
        <a className="logo" href="#top" aria-label="MottoRadar início"><span className="logo-mark">◎</span><span>Motto<span className="logo-accent">Radar</span></span></a>
        <nav><a href="#buscar">Encontrar motos</a><a href="#como-funciona">Como funciona</a><a className="nav-cta" href="#buscar">Buscar agora <span>↗</span></a></nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot"/> SUA PRÓXIMA MOTO COMEÇA AQUI</div>
          <h1>Compare. Encontre.<br/><span>Vá mais longe.</span></h1>
          <p>Pesquise motos e compare opções em um só lugar. Menos abas abertas, mais caminho pela frente.</p>
          <div className="hero-stats"><div><strong>Várias marcas</strong><small>Em uma só busca</small></div><div><strong>Busca simples</strong><small>Filtros do seu jeito</small></div><div><strong>Mais clareza</strong><small>Compare antes de decidir</small></div></div>
        </div>
        <div className="hero-art" aria-label="Ilustração estilizada de uma motocicleta"><div className="art-glow"/><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="speed-label">LIBERDADE<br/><b>EM DUAS RODAS</b></div><div className="bike-emoji">🏍️</div><div className="art-bottom"><span>ENCONTRE SUA PRÓXIMA</span><b>DO SEU JEITO.</b></div></div>
      </section>

      <section className="search-wrap" id="buscar">
        <div className="search-heading"><div><span className="section-kicker">PESQUISA INTELIGENTE</span><h2>Qual moto você procura?</h2></div><span className="search-icon">⌕</span></div>
        <div className="search-bar"><span className="search-glass">⌕</span><input aria-label="Buscar moto" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex.: Honda CG 160, Fazer 250..."/><button onClick={() => setShowFilters(!showFilters)} className="filter-toggle">☷ <span>Filtros</span></button><button className="search-button" onClick={() => document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth' })}>Buscar motos <span>→</span></button></div>
        {showFilters && <div className="filters-panel">
          <label>Marca<select value={brand} onChange={(e) => setBrand(e.target.value)}><option>Todas as marcas</option><option>Honda</option><option>Yamaha</option><option>Bajaj</option></select></label>
          <label>Preço mínimo (R$)<input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0"/></label>
          <label>Preço máximo (R$)<input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Sem limite"/></label>
          <button className="clear-button" onClick={() => { setBrand('Todas as marcas'); setMinPrice(''); setMaxPrice(''); setQuery(''); }}>Limpar filtros</button>
        </div>}
        <div className="quick-tags"><span>Buscas populares</span>{['Honda CG 160','Fazer 250','Biz 125','XRE 300'].map((tag) => <button key={tag} onClick={() => setQuery(tag)}>{tag} <span>↗</span></button>)}</div>
      </section>

      <section className="results-section" id="resultados">
        <div className="results-header"><div><span className="section-kicker">{liveData ? 'CATÁLOGO CONECTADO' : 'VITRINE DE DEMONSTRAÇÃO'}</span><h2>Motos para descobrir <span className="result-count">{results.length}</span></h2><p>{liveData ? 'Anúncios importados do banco de dados. Confirme os detalhes no site de origem.' : 'Explore o layout e teste os filtros. Configure o Supabase para carregar anúncios reais.'}</p></div><label className="sort-label">Ordenar por <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevance">Relevância</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="year-desc">Ano mais recente</option></select></label></div>
        {!liveData && <div className="demo-alert"><span>ⓘ</span><div><strong>Versão de demonstração</strong><p>Os valores e anúncios abaixo são fictícios. Configure o Supabase e importe dados de fontes autorizadas para exibir ofertas reais.</p></div></div>}
        {results.length ? <div className="moto-grid">{results.map((moto, index) => <article className="moto-card" key={moto.id}>
          <div className={`moto-image moto-image-${index % 4}`}><span className="image-tag">{moto.year}</span><span className="bike-silhouette">🏍</span><span className="image-brand">{moto.brand.toUpperCase()}</span></div>
          <div className="moto-content"><div className="moto-title-line"><div><span className="moto-brand">{moto.brand}</span><h3>{moto.model}</h3><p className="moto-version">{moto.version}</p></div><button className="heart-button" aria-label="Favoritar (demonstração)" title="Favoritar (demonstração)">♡</button></div>
            <div className="moto-specs"><span>▦ {moto.year}</span><span>◷ {km(moto.km)}</span><span>⌖ {moto.city}, {moto.state}</span></div>
            <div className="card-footer"><div><small>{liveData ? 'PREÇO INFORMADO PELA FONTE' : 'PREÇO DE EXEMPLO'}</small><strong>{moto.price > 0 ? money(moto.price) : 'Consulte a fonte'}</strong></div><a href={liveData ? moto.url : "#como-funciona"} target={liveData ? "_blank" : undefined} rel={liveData ? "noopener noreferrer" : undefined} aria-label={`Detalhes de ${moto.brand} ${moto.model}`}>↗</a></div>
            <div className="source-line"><span className="source-dot"/> {liveData ? moto.source : 'Fonte demonstrativa • Não é anúncio real'}</div>
          </div>
        </article>)}</div> : <div className="empty-state"><span>⌕</span><h3>Nenhuma moto encontrada</h3><p>Tente mudar a busca ou limpar os filtros.</p><button onClick={() => { setBrand('Todas as marcas'); setMinPrice(''); setMaxPrice(''); setQuery(''); }}>Limpar pesquisa</button></div>}
        {liveData && products.length > 0 && <section className="results-section" id="acessorios"><div className="results-header"><div><span className="section-kicker">CATÁLOGO CONECTADO</span><h2>Acessórios e equipamentos <span className="result-count">{products.length}</span></h2><p>Produtos importados de lojas e fontes integradas.</p></div></div><div className="moto-grid">{products.map((product) => <article className="moto-card" key={product.id}><div className="moto-image"><span className="image-tag">{product.category}</span><span className="bike-silhouette">🛵</span></div><div className="moto-content"><span className="moto-brand">{product.brand ?? 'Acessório'}</span><h3>{product.title}</h3><div className="card-footer"><div><small>PREÇO INFORMADO PELA FONTE</small><strong>{money(Number(product.price_brl))}</strong></div><a href={product.product_url} target="_blank" rel="noopener noreferrer" aria-label={`Ver ${product.title} na loja`}>↗</a></div><div className="source-line">{Array.isArray(product.sources) ? product.sources[0]?.name : product.sources?.name ?? 'Loja integrada'}</div></div></article>)}</div></section>}
        <div className="future-note"><span>✳</span><div><strong>{liveData ? 'Confira sempre o anúncio original' : 'Próxima etapa: configurar o banco e integrar fontes'}</strong><p>{liveData ? 'Preços e disponibilidade podem mudar na loja de origem.' : 'O catálogo já tem uma rota de leitura e um endpoint de importação protegido. Ainda é necessário configurar as credenciais e ligar fontes reais autorizadas.'}</p></div></div>
      </section>

      <section className="how-section" id="como-funciona"><span className="section-kicker">SEM COMPLICAÇÃO</span><h2>Comprar bem começa<br/>com uma boa comparação.</h2><div className="how-grid"><div><span className="step-number">01</span><h3>Pesquise</h3><p>Digite marca, modelo ou use os filtros para encontrar opções.</p></div><div><span className="step-number">02</span><h3>Compare</h3><p>Veja preço, ano, quilometragem e localização lado a lado.</p></div><div><span className="step-number">03</span><h3>Confira a fonte</h3><p>Quando conectado a fontes reais, acesse o anúncio original para confirmar os detalhes.</p></div></div></section>

      <footer><a className="logo footer-logo" href="#top"><span className="logo-mark">◎</span><span>Motto<span className="logo-accent">Radar</span></span></a><p>Encontre sua próxima história sobre duas rodas.</p><span className="footer-copy">© {new Date().getFullYear()} MottoRadar · Projeto em desenvolvimento</span></footer>
    </main>
  );
}
