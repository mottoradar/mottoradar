
'use client';

import { useState, type FormEvent } from 'react';

export default function AnunciarPage() {
  const [form, setForm] = useState({
    title: '',
    brand: '',
    model: '',
    version: '',
    year: '',
    mileage: '',
    price: '',
    city: '',
    state: '',
    description: '',
    seller: '',
    phone: '',
    listingUrl: '',
    photoUrl: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function update(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.brand} ${form.model} ${form.version}`.trim(),
          brand: form.brand,
          model: form.model,
          version: form.version,
          model_year: Number(form.year),
          mileage_km: Number(form.mileage),
          price_brl: Number(form.price),
          city: form.city,
          state: form.state.toUpperCase(),
          description: form.description,
          seller_name: form.seller,
          seller_phone: form.phone,
          listing_url: form.listingUrl,
          image_url: form.photoUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Não foi possível enviar o anúncio.'
        );
      }

      setMessage(
        'Anúncio enviado! Ele ficará aguardando aprovação antes de aparecer na pesquisa.'
      );

      setForm({
        title: '',
        brand: '',
        model: '',
        version: '',
        year: '',
        mileage: '',
        price: '',
        city: '',
        state: '',
        description: '',
        seller: '',
        phone: '',
        listingUrl: '',
        photoUrl: '',
      });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none focus:border-lime-600';

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-8 text-[#17251b]">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="font-semibold text-green-800"
        >
          ← Voltar ao MottoRadar
        </a>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
          <span className="text-sm font-bold tracking-widest text-green-700">
            MOTTO<span className="text-lime-600">RADAR</span>
          </span>

          <h1 className="mt-3 text-3xl font-bold">
            Anuncie sua moto
          </h1>

          <p className="mt-2 text-gray-600">
            Cadastre sua moto para que compradores possam
            encontrá-la e comparar preços.
          </p>

          <div className="mt-5 rounded-xl bg-lime-50 p-4 text-sm text-green-900">
            Os anúncios passam por aprovação antes de
            serem publicados.
          </div>

          <form onSubmit={submit} className="mt-7 space-y-5">
            <section className="space-y-4">
              <h2 className="text-lg font-bold">
                Dados da moto
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Marca *</span>
                  <select
                    required
                    className={fieldClass}
                    value={form.brand}
                    onChange={(e) => update('brand', e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {[
                      'Honda',
                      'Yamaha',
                      'Bajaj',
                      'BMW',
                      'Kawasaki',
                      'Suzuki',
                      'Royal Enfield',
                      'Shineray',
                      'Triumph',
                      'Ducati',
                      'Haojue',
                      'Outra',
                    ].map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Modelo *</span>
                  <input
                    required
                    className={fieldClass}
                    value={form.model}
                    onChange={(e) => update('model', e.target.value)}
                    placeholder="Ex.: CG 160 Titan"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Versão</span>
                  <input
                    className={fieldClass}
                    value={form.version}
                    onChange={(e) => update('version', e.target.value)}
                    placeholder="Ex.: ABS"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Ano *</span>
                  <input
                    required
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 1}
                    className={fieldClass}
                    value={form.year}
                    onChange={(e) => update('year', e.target.value)}
                    placeholder="Ex.: 2023"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Quilometragem *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    className={fieldClass}
                    value={form.mileage}
                    onChange={(e) => update('mileage', e.target.value)}
                    placeholder="Ex.: 18500"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Preço (R$) *</span>
                  <input
                    required
                    type="number"
                    min="1"
                    step="0.01"
                    className={fieldClass}
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="Ex.: 14500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Descrição e estado de conservação</span>
                <textarea
                  rows={3}
                  maxLength={2000}
                  className={fieldClass}
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Conte detalhes importantes sobre a moto."
                />
              </label>
            </section>

            <hr className="border-gray-200" />

            <section className="space-y-4">
              <h2 className="text-lg font-bold">
                Localização e contato
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Cidade *</span>
                  <input
                    required
                    maxLength={100}
                    className={fieldClass}
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Ex.: Macaé"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Estado (UF) *</span>
                  <input
                    required
                    minLength={2}
                    maxLength={2}
                    className={fieldClass}
                    value={form.state}
                    onChange={(e) => update('state', e.target.value)}
                    placeholder="Ex.: RJ"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Nome do vendedor *</span>
                  <input
                    required
                    maxLength={100}
                    className={fieldClass}
                    value={form.seller}
                    onChange={(e) => update('seller', e.target.value)}
                    placeholder="Seu nome"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">WhatsApp *</span>
                  <input
                    required
                    type="tel"
                    maxLength={20}
                    className={fieldClass}
                    value={form.phone}
                    onChange={(e) => update('phone', e.target.value)}
                    placeholder="(22) 99999-9999"
                  />
                </label>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section className="space-y-4">
              <h2 className="text-lg font-bold">
                Fotos e anúncio
              </h2>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Link de uma foto pública</span>
                <input
                  type="url"
                  className={fieldClass}
                  value={form.photoUrl}
                  onChange={(e) => update('photoUrl', e.target.value)}
                  placeholder="https://..."
                />
                <span className="mt-1 block text-xs text-gray-500">
                  Use um link direto para uma imagem que você tem direito de divulgar.
                </span>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Link do anúncio original (opcional)</span>
                <input
                  type="url"
                  className={fieldClass}
                  value={form.listingUrl}
                  onChange={(e) => update('listingUrl', e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </section>

            {message && (
              <div
                role="status"
                className="rounded-xl bg-lime-50 p-4 text-sm text-green-900"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#b9f36a] px-5 py-4 font-bold text-[#17251b] transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar moto para aprovação →'}
            </button>

            <p className="text-center text-xs text-gray-500">
              Ao enviar, você confirma que as informações são verdadeiras
              e que tem autorização para divulgar os dados e as imagens.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

