<template>
  <section class="about">
    <div class="about-image">
      <img
        src="/produtos/kit.jpg"
        alt="Kit de produtos Marrooks"
      />
    </div>
    <div class="about-text">
      <p class="eyebrow">Sobre a Marrooks</p>
      <h2>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Architecto voluptates sed voluptate aliquid. Qui in
        dolorem doloremque sequi enim reprehenderit reiciendis illo consequatur culpa exercitationem. Ducimus saepe
        provident sint tempora!</h2>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. At ducimus fugit aperiam modi, vel nostrum culpa
        veritatis tempore sed quidem aut, eveniet a dolorem fugiat! Facere odit nihil voluptas odio.
      </p>
      <RouterLink
        to="/catalogo"
        class="cta"
      >Conhecer os produtos</RouterLink>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.about {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: var(--space-9);
  margin: var(--space-10) 0;
  padding-top: var(--space-10);
  border-top: 1.5px dashed var(--color-border-dashed);
}

.about-image {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1.5px solid var(--color-border-soft);
  box-shadow: var(--shadow-spine);
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.about-text {
  max-width: 46ch;
}

.eyebrow {
  margin: 0 0 var(--space-3);
  color: var(--color-brown-600);
  font-size: var(--text-sm);
}

h2 {
  font-size: var(--text-xl);
  line-height: 1.3;
  margin: 0 0 var(--space-4);
}

.about-text p {
  color: var(--color-text-muted);
  font-size: var(--text-md);
  line-height: 1.7;
  margin: 0 0 var(--space-6);
}

.cta {
  display: inline-block;
  text-decoration: none;
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  border-bottom: 1.5px solid var(--color-primary);
  padding-bottom: 2px;
  transition: opacity 0.15s ease;
}

.cta:hover {
  opacity: 0.75;
}

@media (max-width: 720px) {
  .about {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}
</style>