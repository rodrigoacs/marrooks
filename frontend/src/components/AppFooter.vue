<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-col brand-col">
        <img
          src="/marrooks-logo.svg"
          alt="Marrooks"
          class="footer-logo"
        />
        <p class="tagline">Livrinhos que cabem na palma da mão, feitos com carinho.</p>
        <div class="socials">
          <a
            href="https://instagram.com/marrooks.co"
            target="_blank"
            rel="noopener"
            aria-label="Instagram da Marrooks"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="5"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle
                cx="12"
                cy="12"
                r="4.2"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://wa.me/553184122294"
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp da Marrooks"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                stroke-width="1.6"
              />
              <path
                d="M9.2 8.3c.2-.4.6-.7 1.1-.7h.5c.3 0 .5.2.6.4l.5 1.2c.1.3.1.6-.1.8l-.5.6c.5 1 1.3 1.8 2.3 2.3l.6-.5c.2-.2.5-.2.8-.1l1.2.5c.3.1.4.4.4.6v.5c0 .5-.3.9-.7 1.1-.5.2-1 .3-1.5.2-2.6-.9-4.6-2.9-5.5-5.5-.2-.5-.1-1 .1-1.5Z"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      <div class="footer-col">
        <p class="col-title">Ajuda</p>
        <RouterLink to="/catalogo">Catálogo</RouterLink>
        <RouterLink to="/conta">Minha conta</RouterLink>
        <a
          href="https://wa.me/553184122294"
          target="_blank"
          rel="noopener"
        >Trocas e devoluções</a>
      </div>

      <div class="footer-col">
        <p class="col-title">Contato</p>
        <a href="mailto:contato@marrooks.com">contato@marrooks.com</a>
        <a
          href="https://wa.me/553184122294"
          target="_blank"
          rel="noopener"
        >Fale no WhatsApp</a>
      </div>

      <div class="footer-col">
        <p class="col-title">Pagamento</p>
        <p class="payment-methods">Pix · Cartão de crédito · Boleto</p>
        <p class="payment-partner">via Mercado Pago</p>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copy">&copy; {{ year }} Marrooks</p>
    </div>
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1.5px dashed var(--color-border-dashed);
  margin-top: var(--space-10);
  background: var(--color-bg);
}

.footer-inner {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: var(--space-6);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--text-sm);
}

.footer-col a {
  color: var(--color-text-subtle);
  text-decoration: none;
}

.footer-col a:hover {
  color: var(--color-text-muted);
}

.col-title {
  margin: 0 0 var(--space-1);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
  font-size: var(--text-sm);
}

.footer-logo {
  width: 96px;
  height: 96px;
  margin-bottom: var(--space-1);
}

.tagline {
  margin: 0;
  font-style: italic;
  color: var(--color-text-subtle);
}

.socials {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-1);
}

.socials a {
  display: flex;
  color: var(--color-text-muted);
}

.socials a:hover {
  color: var(--color-primary);
}

.payment-methods {
  margin: 0;
  color: var(--color-text-subtle);
}

.payment-partner {
  margin: 0;
  color: var(--color-text-subtle);
  font-size: var(--text-xs);
}

.footer-bottom {
  border-top: 1px solid var(--color-border-soft);
}

.footer-bottom .copy {
  max-width: var(--content-max-width);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  color: var(--color-text-subtle);
  font-size: var(--text-xs);
}

@media (max-width: 720px) {
  .footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 460px) {
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>