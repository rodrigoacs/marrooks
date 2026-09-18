<template>
  <div>
    <RouterLink
      to="/admin/produtos"
      class="back"
    >&larr; Produtos</RouterLink>

    <h1>Variações{{ productName ? ` — ${productName}` : '' }}</h1>
    <p class="sub">
      {{ isBookProduct
        ? 'Cada variação é um livro (série, título e autor) que aparece como opção na página do produto.'
        : 'Cada variação aparece como opção pra escolher na página do produto.' }}
    </p>

    <div
      v-if="!loading && !error"
      class="stats-grid"
    >
      <div class="stat-card">
        <span class="stat-label">Total de variações</span>
        <span class="stat-value">{{ totalCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Ativas</span>
        <span class="stat-value">{{ activeCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Inativas</span>
        <span class="stat-value">{{ inactiveCount }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">{{ fourthStat.label }}</span>
        <span class="stat-value">{{ fourthStat.value }}</span>
      </div>
    </div>

    <p
      v-if="loading"
      class="state"
    >Carregando...</p>
    <p
      v-else-if="error"
      class="state error"
    >{{ error }}</p>

    <template v-else>
      <div class="toolbar">
        <label class="search-box">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M21 21l-4.3-4.3"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isBookProduct ? 'Buscar por título, série ou autor...' : 'Buscar por nome...'"
          />
        </label>

        <div class="filter-tabs">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="filter-tab"
            :class="{ active: statusFilter === option.value }"
            @click="statusFilter = option.value"
          >{{ option.label }}</button>
        </div>

        <div class="view-toggle">
          <button
            type="button"
            class="view-btn"
            :class="{ active: viewMode === 'list' }"
            title="Ver em lista"
            @click="viewMode = 'list'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="view-btn"
            :class="{ active: viewMode === 'grid' }"
            title="Ver em grade"
            @click="viewMode = 'grid'"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <rect
                x="4"
                y="4"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="13"
                y="4"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="4"
                y="13"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <rect
                x="13"
                y="13"
                width="7"
                height="7"
                rx="1.5"
                stroke="currentColor"
                stroke-width="1.8"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- ============ VISÃO EM LISTA (planilha) ============ -->
      <div
        v-if="viewMode === 'list'"
        class="table-scroll"
      >
        <table class="variant-table">
          <thead>
            <tr>
              <th class="col-photo"></th>
              <th>{{ isBookProduct ? 'Livro' : 'Nome' }}</th>
              <th v-if="isBookProduct">Série</th>
              <th v-if="isBookProduct">Autor</th>
              <th
                v-if="showBookMeta"
                class="col-pages"
              >Págs.</th>
              <th
                v-if="showBookMeta"
                class="col-cat"
              >Cat.</th>
              <th class="col-status">Status</th>
              <th class="col-actions"></th>
            </tr>
          </thead>
          <tbody>
            <!-- Linha de inclusão: sempre a primeira, sempre em modo de edição,
                 nunca afetada pela busca/filtro -->
            <tr class="new-row">
              <td>
                <button
                  type="button"
                  class="thumb-btn"
                  :disabled="uploadingImage"
                  @click="triggerUpload('new')"
                >
                  <img
                    v-if="newVariant.imageUrl"
                    :src="newVariant.imageUrl"
                    alt=""
                  />
                  <span
                    v-else
                    class="thumb-placeholder"
                  >+</span>
                </button>
              </td>
              <td>
                <input
                  v-model="newVariant.name"
                  type="text"
                  class="cell-input"
                  :placeholder="isBookProduct ? 'Título do livro' : 'Nome da variação'"
                  @input="syncSlug(newVariant)"
                />
                <input
                  v-model="newVariant.slug"
                  type="text"
                  class="cell-input slug-input"
                  placeholder="slug"
                  @input="newVariant.slugTouched = true"
                />
              </td>
              <td v-if="isBookProduct">
                <input
                  v-model="newVariant.series"
                  type="text"
                  class="cell-input"
                  placeholder="Série (opcional)"
                />
              </td>
              <td v-if="isBookProduct">
                <input
                  v-model="newVariant.author"
                  type="text"
                  class="cell-input"
                  placeholder="Autor"
                />
              </td>
              <td v-if="showBookMeta">
                <div class="pages-cell">
                  <input
                    v-model="newVariant.pageCount"
                    type="number"
                    min="1"
                    class="cell-input pages-input"
                    @input="onPageCountInput(newVariant)"
                  />
                  <button
                    type="button"
                    class="icon-btn"
                    title="Buscar nº de páginas online"
                    :disabled="newLookup.loading"
                    @click="lookupPages(newVariant, newLookup)"
                  >{{ newLookup.loading ? '…' : '🔍' }}</button>
                </div>
              </td>
              <td v-if="showBookMeta">
                <select
                  v-model="newVariant.sizeCategory"
                  class="cell-input cat-input"
                >
                  <option value="">—</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                </select>
              </td>
              <td class="col-status muted">—</td>
              <td class="col-actions">
                <button
                  type="button"
                  class="cta-cell"
                  :disabled="adding"
                  @click="handleAdd"
                >{{ adding ? '...' : '+ Adicionar' }}</button>
              </td>
            </tr>
            <tr
              v-if="addError"
              class="message-row"
            >
              <td :colspan="columnCount">
                <p class="error">{{ addError }}</p>
              </td>
            </tr>
            <tr
              v-if="newLookup.error || newLookup.results.length > 0"
              class="message-row"
            >
              <td :colspan="columnCount">
                <p
                  v-if="newLookup.error"
                  class="error"
                >{{ newLookup.error }}</p>
                <ul
                  v-if="newLookup.results.length > 0"
                  class="lookup-results"
                >
                  <li
                    v-for="(result, index) in newLookup.results"
                    :key="index"
                    class="lookup-item"
                  >
                    <span>{{ result.title }} — {{ result.authors.join(', ') }}<template v-if="result.publishedDate"> ·
                        {{ result.publishedDate }}</template>
                      · {{ result.pageCount }} págs.</span>
                    <button
                      type="button"
                      class="link-btn"
                      @click="applyLookupResult(newVariant, newLookup, result)"
                    >Usar</button>
                  </li>
                </ul>
              </td>
            </tr>

            <!-- Estados vazios -->
            <tr v-if="variants.length === 0">
              <td
                :colspan="columnCount"
                class="empty-state"
              >Nenhuma variação cadastrada ainda.</td>
            </tr>
            <tr v-else-if="filteredVariants.length === 0">
              <td
                :colspan="columnCount"
                class="empty-state"
              >Nenhuma variação encontrada para esse filtro.</td>
            </tr>

            <!-- Linhas existentes -->
            <template
              v-for="variant in filteredVariants"
              :key="variant.id"
            >
              <tr :class="{ inactive: !variant.active, editing: editingId === variant.id }">
                <td>
                  <button
                    v-if="editingId === variant.id"
                    type="button"
                    class="thumb-btn"
                    :disabled="uploadingImage"
                    @click="triggerUpload('edit')"
                  >
                    <img
                      v-if="editForm.imageUrl"
                      :src="editForm.imageUrl"
                      alt=""
                    />
                    <span
                      v-else
                      class="thumb-placeholder"
                    >+</span>
                  </button>
                  <img
                    v-else-if="variant.image?.url"
                    :src="variant.image.url"
                    :alt="variant.name"
                    class="thumb"
                  />
                  <div
                    v-else
                    class="thumb thumb-fallback"
                  >{{ variant.name.charAt(0) }}</div>
                </td>

                <td>
                  <template v-if="editingId === variant.id">
                    <input
                      v-model="editForm.name"
                      type="text"
                      class="cell-input"
                    />
                    <input
                      v-model="editForm.slug"
                      type="text"
                      class="cell-input slug-input"
                      placeholder="slug"
                    />
                  </template>
                  <span v-else>{{ variant.name }}</span>
                </td>

                <td v-if="isBookProduct">
                  <input
                    v-if="editingId === variant.id"
                    v-model="editForm.series"
                    type="text"
                    class="cell-input"
                  />
                  <span v-else>{{ variant.series }}</span>
                </td>

                <td v-if="isBookProduct">
                  <input
                    v-if="editingId === variant.id"
                    v-model="editForm.author"
                    type="text"
                    class="cell-input"
                  />
                  <span v-else>{{ variant.author }}</span>
                </td>

                <td v-if="showBookMeta">
                  <div
                    v-if="editingId === variant.id"
                    class="pages-cell"
                  >
                    <input
                      v-model="editForm.pageCount"
                      type="number"
                      min="1"
                      class="cell-input pages-input"
                      @input="onPageCountInput(editForm)"
                    />
                    <button
                      type="button"
                      class="icon-btn"
                      title="Buscar nº de páginas online"
                      :disabled="editLookup.loading"
                      @click="lookupPages(editForm, editLookup)"
                    >{{ editLookup.loading ? '…' : '🔍' }}</button>
                  </div>
                  <span v-else>{{ variant.pageCount ?? '—' }}</span>
                </td>

                <td v-if="showBookMeta">
                  <select
                    v-if="editingId === variant.id"
                    v-model="editForm.sizeCategory"
                    class="cell-input cat-input"
                  >
                    <option value="">—</option>
                    <option value="P">P</option>
                    <option value="M">M</option>
                    <option value="G">G</option>
                  </select>
                  <span v-else>{{ variant.sizeCategory ?? '—' }}</span>
                </td>

                <td class="col-status">
                  <label
                    v-if="editingId === variant.id"
                    class="checkbox"
                  >
                    <input
                      v-model="editForm.active"
                      type="checkbox"
                    />
                    <span>Ativa</span>
                  </label>
                  <span
                    v-else
                    class="badge"
                    :class="variant.active ? 'active' : 'inactive'"
                  >{{ variant.active ? 'Ativa' : 'Inativa'
                    }}</span>
                </td>

                <td class="col-actions">
                  <template v-if="editingId === variant.id">
                    <button
                      type="button"
                      class="link-btn"
                      :disabled="saving"
                      @click="saveEdit(variant.id)"
                    >{{ saving ? '...' : 'Salvar' }}</button>
                    <button
                      type="button"
                      class="link-btn"
                      @click="editingId = null"
                    >Cancelar</button>
                  </template>
                  <template v-else>
                    <button
                      type="button"
                      class="link-btn"
                      @click="startEdit(variant)"
                    >Editar</button>
                    <button
                      v-if="variant.active"
                      type="button"
                      class="link-btn danger"
                      @click="handleDeactivate(variant)"
                    >Desativar</button>
                  </template>
                </td>
              </tr>

              <tr
                v-if="editingId === variant.id && (editError || editLookup.error || editLookup.results.length > 0)"
                class="message-row"
              >
                <td :colspan="columnCount">
                  <p
                    v-if="editError"
                    class="error"
                  >{{ editError }}</p>
                  <p
                    v-if="editLookup.error"
                    class="error"
                  >{{ editLookup.error }}</p>
                  <ul
                    v-if="editLookup.results.length > 0"
                    class="lookup-results"
                  >
                    <li
                      v-for="(result, index) in editLookup.results"
                      :key="index"
                      class="lookup-item"
                    >
                      <span>{{ result.title }} — {{ result.authors.join(', ') }}<template v-if="result.publishedDate"> ·
                          {{ result.publishedDate }}</template> · {{ result.pageCount }} págs.</span>
                      <button
                        type="button"
                        class="link-btn"
                        @click="applyLookupResult(editForm, editLookup, result)"
                      >Usar</button>
                    </li>
                  </ul>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- ============ VISÃO EM GRADE ============ -->
      <div
        v-else
        class="grid-view"
      >
        <!-- Card de inclusão -->
        <div class="variant-card add-card">
          <button
            type="button"
            class="thumb-btn card-thumb"
            :disabled="uploadingImage"
            @click="triggerUpload('new')"
          >
            <img
              v-if="newVariant.imageUrl"
              :src="newVariant.imageUrl"
              alt=""
            />
            <span
              v-else
              class="thumb-placeholder"
            >+</span>
          </button>

          <div class="card-fields">
            <input
              v-model="newVariant.name"
              type="text"
              class="cell-input"
              :placeholder="isBookProduct ? 'Título do livro' : 'Nome da variação'"
              @input="syncSlug(newVariant)"
            />
            <div
              v-if="isBookProduct"
              class="card-field-row"
            >
              <input
                v-model="newVariant.series"
                type="text"
                class="cell-input"
                placeholder="Série (opcional)"
              />
              <input
                v-model="newVariant.author"
                type="text"
                class="cell-input"
                placeholder="Autor"
              />
            </div>
            <div
              v-if="showBookMeta"
              class="card-field-row"
            >
              <div class="pages-cell">
                <input
                  v-model="newVariant.pageCount"
                  type="number"
                  min="1"
                  class="cell-input pages-input"
                  placeholder="Págs."
                  @input="onPageCountInput(newVariant)"
                />
                <button
                  type="button"
                  class="icon-btn"
                  title="Buscar nº de páginas online"
                  :disabled="newLookup.loading"
                  @click="lookupPages(newVariant, newLookup)"
                >{{ newLookup.loading ? '…' : '🔍' }}</button>
              </div>
              <select
                v-model="newVariant.sizeCategory"
                class="cell-input cat-input"
              >
                <option value="">Cat. —</option>
                <option value="P">P</option>
                <option value="M">M</option>
                <option value="G">G</option>
              </select>
            </div>

            <p
              v-if="addError"
              class="error"
            >{{ addError }}</p>
            <p
              v-if="newLookup.error"
              class="error"
            >{{ newLookup.error }}</p>
            <ul
              v-if="newLookup.results.length > 0"
              class="lookup-results"
            >
              <li
                v-for="(result, index) in newLookup.results"
                :key="index"
                class="lookup-item"
              >
                <span>{{ result.title }} — {{ result.authors.join(', ') }}<template v-if="result.publishedDate"> · {{
                  result.publishedDate }}</template> · {{ result.pageCount }} págs.</span>
                <button
                  type="button"
                  class="link-btn"
                  @click="applyLookupResult(newVariant, newLookup, result)"
                >Usar</button>
              </li>
            </ul>

            <button
              type="button"
              class="cta-cell add-card-cta"
              :disabled="adding"
              @click="handleAdd"
            >{{ adding ?
              'Adicionando...' : '+ Adicionar variação' }}</button>
          </div>
        </div>

        <p
          v-if="variants.length === 0"
          class="state grid-empty"
        >Nenhuma variação cadastrada ainda.</p>
        <p
          v-else-if="filteredVariants.length === 0"
          class="state grid-empty"
        >Nenhuma variação encontrada para esse filtro.
        </p>

        <div
          v-for="variant in filteredVariants"
          :key="variant.id"
          class="variant-card"
          :class="{ inactive: !variant.active }"
        >
          <template v-if="editingId === variant.id">
            <button
              type="button"
              class="thumb-btn card-thumb"
              :disabled="uploadingImage"
              @click="triggerUpload('edit')"
            >
              <img
                v-if="editForm.imageUrl"
                :src="editForm.imageUrl"
                alt=""
              />
              <span
                v-else
                class="thumb-placeholder"
              >+</span>
            </button>

            <div class="card-fields">
              <input
                v-model="editForm.name"
                type="text"
                class="cell-input"
              />
              <div
                v-if="isBookProduct"
                class="card-field-row"
              >
                <input
                  v-model="editForm.series"
                  type="text"
                  class="cell-input"
                  placeholder="Série"
                />
                <input
                  v-model="editForm.author"
                  type="text"
                  class="cell-input"
                  placeholder="Autor"
                />
              </div>
              <div
                v-if="showBookMeta"
                class="card-field-row"
              >
                <div class="pages-cell">
                  <input
                    v-model="editForm.pageCount"
                    type="number"
                    min="1"
                    class="cell-input pages-input"
                    placeholder="Págs."
                    @input="onPageCountInput(editForm)"
                  />
                  <button
                    type="button"
                    class="icon-btn"
                    title="Buscar nº de páginas online"
                    :disabled="editLookup.loading"
                    @click="lookupPages(editForm, editLookup)"
                  >{{ editLookup.loading ? '…' : '🔍' }}</button>
                </div>
                <select
                  v-model="editForm.sizeCategory"
                  class="cell-input cat-input"
                >
                  <option value="">Cat. —</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                </select>
              </div>

              <label class="checkbox">
                <input
                  v-model="editForm.active"
                  type="checkbox"
                />
                <span>Ativa</span>
              </label>

              <p
                v-if="editError"
                class="error"
              >{{ editError }}</p>
              <p
                v-if="editLookup.error"
                class="error"
              >{{ editLookup.error }}</p>
              <ul
                v-if="editLookup.results.length > 0"
                class="lookup-results"
              >
                <li
                  v-for="(result, index) in editLookup.results"
                  :key="index"
                  class="lookup-item"
                >
                  <span>{{ result.title }} — {{ result.authors.join(', ') }}<template v-if="result.publishedDate"> · {{
                    result.publishedDate }}</template>
                    · {{ result.pageCount }} págs.</span>
                  <button
                    type="button"
                    class="link-btn"
                    @click="applyLookupResult(editForm, editLookup, result)"
                  >Usar</button>
                </li>
              </ul>

              <div class="card-actions">
                <button
                  type="button"
                  class="cta-cell"
                  :disabled="saving"
                  @click="saveEdit(variant.id)"
                >{{ saving ? 'Salvando...'
                  : 'Salvar' }}</button>
                <button
                  type="button"
                  class="link-btn"
                  @click="editingId = null"
                >Cancelar</button>
              </div>
            </div>
          </template>

          <template v-else>
            <img
              v-if="variant.image?.url"
              :src="variant.image.url"
              :alt="variant.name"
              class="card-thumb"
            />
            <div
              v-else
              class="card-thumb thumb-fallback"
            >{{ variant.name.charAt(0) }}</div>

            <div class="card-fields">
              <p class="card-name">{{ variant.name }}</p>
              <p
                v-if="variant.author || variant.series"
                class="card-meta-line"
              >{{ variant.author }}<template v-if="variant.author && variant.series"> · </template>{{ variant.series }}
              </p>
              <p
                v-if="showBookMeta && (variant.pageCount || variant.sizeCategory)"
                class="card-meta-line muted"
              >{{
                variant.pageCount ? `${variant.pageCount} págs.` : '' }}<template
                  v-if="variant.pageCount && variant.sizeCategory"
                > · </template>{{ variant.sizeCategory }}</p>

              <span
                class="badge"
                :class="variant.active ? 'active' : 'inactive'"
              >{{ variant.active ? 'Ativa' : 'Inativa' }}</span>

              <div class="card-actions">
                <button
                  type="button"
                  class="link-btn"
                  @click="startEdit(variant)"
                >Editar</button>
                <button
                  v-if="variant.active"
                  type="button"
                  class="link-btn danger"
                  @click="handleDeactivate(variant)"
                >Desativar</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden-input"
        @change="handleFileSelected"
      />
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { adminBookLookupApi, adminProductsApi, adminUploadsApi, adminVariantsApi, ApiError } from '../../lib/api'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const productName = ref('')
const productSlug = ref('')
const variantKind = ref('simple')
const variants = ref([])
const loading = ref(true)
const error = ref('')

const isBookProduct = computed(() => variantKind.value === 'book')
// page_count/size_category são dados internos de produção — hoje só fazem
// sentido pro Mini Livro (é o produto cuja produção depende do nº de
// páginas do livro escolhido).
const showBookMeta = computed(() => productSlug.value === 'mini-livro')

// Foto + Nome + Status + Ações são fixas; Série/Autor e Págs./Cat. entram
// ou saem conforme o tipo do produto — usado pro colspan das linhas de
// mensagem/estado vazio dentro da tabela.
const columnCount = computed(
  () => 4 + (isBookProduct.value ? 2 : 0) + (showBookMeta.value ? 2 : 0)
)

const searchQuery = ref('')
const statusFilter = ref('all')
const viewMode = ref('list')

// "Sem páginas" só faz sentido pro Mini Livro — é justamente a lista de
// variações que ainda faltam preencher.
const statusOptions = computed(() => {
  const base = [
    { value: 'all', label: 'Todas' },
    { value: 'active', label: 'Ativas' },
    { value: 'inactive', label: 'Inativas' },
  ]
  if (showBookMeta.value) {
    base.push({ value: 'no-pages', label: 'Sem páginas' })
  }
  return base
})

const totalCount = computed(() => variants.value.length)
const activeCount = computed(() => variants.value.filter((v) => v.active).length)
const inactiveCount = computed(() => variants.value.filter((v) => !v.active).length)

// Quarto card de resumo: contextual ao tipo de produto.
const fourthStat = computed(() => {
  if (showBookMeta.value) {
    return {
      label: 'Sem páginas',
      value: variants.value.filter((v) => !v.pageCount).length,
    }
  }
  if (isBookProduct.value) {
    return {
      label: 'Séries distintas',
      value: new Set(variants.value.filter((v) => v.series).map((v) => v.series)).size,
    }
  }
  return {
    label: 'Sem foto',
    value: variants.value.filter((v) => !v.image?.url).length,
  }
})

const filteredVariants = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return variants.value.filter((variant) => {
    const matchesQuery =
      !query ||
      variant.name.toLowerCase().includes(query) ||
      (variant.series ?? '').toLowerCase().includes(query) ||
      (variant.author ?? '').toLowerCase().includes(query)

    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && variant.active) ||
      (statusFilter.value === 'inactive' && !variant.active) ||
      (statusFilter.value === 'no-pages' && !variant.pageCount)

    return matchesQuery && matchesStatus
  })
})

const adding = ref(false)
const addError = ref('')

const editingId = ref(null)
const editForm = reactive({})
const saving = ref(false)
const editError = ref('')

function blankLookup() {
  return { loading: false, error: '', results: [] }
}

const newLookup = reactive(blankLookup())
const editLookup = reactive(blankLookup())

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// 200–350 páginas → P · 351–550 → M · 551+ → G. Continua um <select> normal,
// então o admin pode sobrescrever manualmente depois se quiser.
function categoryFromPageCount(pageCount) {
  const n = Number(pageCount)
  if (!Number.isFinite(n) || n <= 0) return ''
  if (n <= 350) return 'P'
  if (n <= 550) return 'M'
  return 'G'
}

function onPageCountInput(target) {
  target.sizeCategory = categoryFromPageCount(target.pageCount)
}

function blankVariant() {
  return {
    name: '',
    slug: '',
    slugTouched: false,
    series: '',
    author: '',
    imageUrl: '',
    imageAlt: '',
    pageCount: '',
    sizeCategory: '',
  }
}

const newVariant = reactive(blankVariant())

function syncSlug(target) {
  if (!target.slugTouched) {
    target.slug = slugify(target.name)
  }
}

// Upload de imagem direto na miniatura da célula/card — sem o dropzone
// grande do ImageUploadField, que não cabe num layout compacto.
const fileInputRef = ref(null)
const uploadingImage = ref(false)
const uploadContext = ref('new')

function triggerUpload(context) {
  uploadContext.value = context
  fileInputRef.value?.click()
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return

  const target = uploadContext.value === 'new' ? newVariant : editForm

  uploadingImage.value = true
  try {
    const data = await adminUploadsApi.upload(file)
    target.imageUrl = data.url
  } catch (err) {
    const message = err instanceof ApiError ? err.message : 'Não foi possível enviar a imagem.'
    if (uploadContext.value === 'new') addError.value = message
    else editError.value = message
  } finally {
    uploadingImage.value = false
  }
}

// Consulta a Google Books API (via backend) pelo título + autor já
// preenchidos no formulário e lista os resultados com nº de páginas pra
// escolher — nunca preenche sozinho, é sempre o admin quem confirma.
async function lookupPages(target, lookup) {
  lookup.error = ''
  lookup.results = []

  if (!target.name?.trim()) {
    lookup.error = 'Informe o título antes de buscar.'
    return
  }

  lookup.loading = true
  try {
    const data = await adminBookLookupApi.search({ title: target.name, author: target.author })
    lookup.results = data.results
    if (data.results.length === 0) {
      lookup.error = 'Nenhum resultado com número de páginas encontrado.'
    }
  } catch (err) {
    lookup.error = err instanceof ApiError ? err.message : 'Não foi possível buscar agora.'
  } finally {
    lookup.loading = false
  }
}

function applyLookupResult(target, lookup, result) {
  target.pageCount = result.pageCount
  target.sizeCategory = categoryFromPageCount(result.pageCount)
  lookup.results = []
}

async function loadData() {
  loading.value = true
  error.value = ''
  try {
    const [productData, variantsData] = await Promise.all([
      adminProductsApi.get(props.id),
      adminVariantsApi.list(props.id),
    ])
    productName.value = productData.product.name
    productSlug.value = productData.product.slug
    variantKind.value = productData.product.variantKind
    variants.value = variantsData.variants
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Não foi possível carregar as variações.'
  } finally {
    loading.value = false
  }
}

async function handleAdd() {
  addError.value = ''

  if (!newVariant.name.trim()) {
    addError.value = isBookProduct.value ? 'Informe o título do livro.' : 'Informe o nome da variação.'
    return
  }
  if (isBookProduct.value && !newVariant.author.trim()) {
    addError.value = 'Informe o autor.'
    return
  }

  const payload = {
    slug: newVariant.slug || slugify(newVariant.name),
    series: isBookProduct.value ? newVariant.series || null : null,
    name: newVariant.name,
    author: isBookProduct.value ? newVariant.author || null : null,
    imageUrl: newVariant.imageUrl || null,
    imageAlt: newVariant.imageAlt || null,
  }
  if (showBookMeta.value) {
    payload.pageCount = newVariant.pageCount || null
    payload.sizeCategory = newVariant.sizeCategory || null
  }

  adding.value = true
  try {
    const data = await adminVariantsApi.create(props.id, payload)
    variants.value.push(data.variant)
    Object.assign(newVariant, blankVariant())
    Object.assign(newLookup, blankLookup())
  } catch (err) {
    addError.value = err instanceof ApiError ? err.message : 'Não foi possível adicionar a variação.'
  } finally {
    adding.value = false
  }
}

function startEdit(variant) {
  editingId.value = variant.id
  editError.value = ''
  Object.assign(editLookup, blankLookup())
  Object.assign(editForm, {
    name: variant.name,
    slug: variant.slug,
    series: variant.series ?? '',
    author: variant.author ?? '',
    imageUrl: variant.image?.url ?? '',
    imageAlt: variant.image?.alt ?? '',
    pageCount: variant.pageCount ?? '',
    sizeCategory: variant.sizeCategory ?? '',
    active: variant.active,
  })
}

async function saveEdit(variantId) {
  editError.value = ''

  const payload = {
    slug: editForm.slug,
    series: isBookProduct.value ? editForm.series || null : null,
    name: editForm.name,
    author: isBookProduct.value ? editForm.author || null : null,
    imageUrl: editForm.imageUrl || null,
    imageAlt: editForm.imageAlt || null,
    active: editForm.active,
  }
  if (showBookMeta.value) {
    payload.pageCount = editForm.pageCount || null
    payload.sizeCategory = editForm.sizeCategory || null
  }

  saving.value = true
  try {
    const data = await adminVariantsApi.update(props.id, variantId, payload)
    const index = variants.value.findIndex((v) => v.id === variantId)
    if (index !== -1) variants.value[index] = data.variant
    editingId.value = null
  } catch (err) {
    editError.value = err instanceof ApiError ? err.message : 'Não foi possível salvar a variação.'
  } finally {
    saving.value = false
  }
}

async function handleDeactivate(variant) {
  if (!confirm(`Desativar a variação "${variant.name}"?`)) return
  try {
    await adminVariantsApi.remove(props.id, variant.id)
    variant.active = false
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'Não foi possível desativar a variação.')
  }
}

onMounted(loadData)
</script>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin-bottom: var(--space-3);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  font-size: var(--text-sm);
  text-decoration: none;
}

h1 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-2);
}

.sub {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  margin: 0 0 var(--space-5);
}

.state {
  color: var(--color-text-muted);
}

.state.error {
  color: var(--color-danger);
}

/* Cards de resumo — minmax(160px, 200px) trava o tamanho máximo, então
   sobra espaço em branco em vez de esticar os cards pra preencher a tela. */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 200px));
  justify-content: start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: var(--space-4) var(--space-5);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-solid);
}

.stat-label {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  font-weight: var(--weight-medium);
}

.stat-value {
  font-size: var(--text-xl);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

/* Barra de busca, filtro e alternância de visão */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.search-box {
  flex: 0 1 320px;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-3);
  min-height: 44px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface-solid);
  color: var(--color-text-muted);
}

.search-box input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--color-text);
}

.filter-tabs {
  display: flex;
  gap: var(--space-1);
  padding: 3px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
  flex-wrap: wrap;
}

.filter-tab {
  border: none;
  background: none;
  padding: var(--space-2) var(--space-3);
  min-height: 36px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
}

.filter-tab.active {
  background: var(--color-surface-solid);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
  box-shadow: 0 1px 2px rgba(81, 47, 24, 0.12);
}

.view-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border-soft);
}

.view-btn {
  border: none;
  background: none;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  cursor: pointer;
}

.view-btn.active {
  background: var(--color-surface-solid);
  color: var(--color-primary);
  box-shadow: 0 1px 2px rgba(81, 47, 24, 0.12);
}

.table-scroll {
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
}

.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Densa como planilha, mas com grade suave (só divisórias horizontais)
   em vez de caixa em cada célula. table-layout: fixed junto com largura
   fixa só nas colunas estreitas evita que Nome/Série/Autor estiquem sem
   controle em telas largas — o espaço que sobra é dividido entre elas. */
.variant-table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
  font-size: 13px;
}

.variant-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
  color: var(--color-brown-600);
  font-weight: var(--weight-semibold);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  padding: 8px 12px;
  background: var(--color-surface);
  border-bottom: 1.5px solid var(--color-border);
  white-space: nowrap;
}

.variant-table td {
  padding: 6px 3px;
  border-bottom: 1px solid var(--color-border-soft);
  vertical-align: middle;
  background: var(--color-surface-solid);
}

.variant-table tbody tr:nth-child(even) td {
  background: var(--color-bg);
}

.variant-table tbody tr:hover td {
  background: rgba(37, 99, 235, 0.05);
}

.variant-table tr.inactive td {
  opacity: 0.55;
}

.variant-table tr.editing td {
  background: rgba(37, 99, 235, 0.08);
}

.variant-table tr.new-row td {
  background: var(--color-surface);
  border-bottom: 1.5px solid var(--color-border);
}

.col-photo {
  width: 44px;
}

.col-pages {
  width: 112px;
}

.col-cat {
  width: 64px;
}

.col-status {
  width: 100px;
  white-space: nowrap;
}

.col-actions {
  width: 140px;
  white-space: nowrap;
}

.cell-input,
.cat-input {
  width: 100%;
  min-height: 30px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-solid);
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--color-text);
}

.cell-input:focus,
.cat-input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: -1px;
}

.slug-input {
  margin-top: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.pages-cell {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
}

.pages-input {
  width: 62px;
  flex-shrink: 0;
}

.icon-btn {
  border: none;
  background: none;
  padding: 0;
  width: 22px;
  min-width: 22px;
  flex-shrink: 0;
  font-size: 13px;
  cursor: pointer;
  line-height: 1;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.thumb,
.thumb-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  display: block;
}

.thumb-btn {
  border: 1px dashed var(--color-border);
  background: var(--color-surface);
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.thumb-placeholder {
  color: var(--color-brown-500);
  font-size: 14px;
}

.thumb-fallback {
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  color: var(--color-brown-500);
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text);
  white-space: nowrap;
}

.checkbox input {
  width: 14px;
  height: 14px;
}

.badge {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: var(--weight-semibold);
}

.badge.active {
  background: rgba(22, 163, 74, 0.12);
  color: var(--color-success);
}

.badge.inactive {
  background: rgba(0, 0, 0, 0.08);
  color: var(--color-text-muted);
}

.col-actions .link-btn {
  border: none;
  background: none;
  padding: 0;
  margin-right: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  cursor: pointer;
}

.col-actions .link-btn:last-child {
  margin-right: 0;
}

.col-actions .link-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--weight-semibold);
  color: var(--color-primary);
  cursor: pointer;
}

.link-btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.link-btn.danger {
  color: var(--color-danger);
}

.cta-cell {
  min-height: 30px;
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  font-weight: var(--weight-semibold);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.cta-cell:disabled {
  opacity: 0.6;
  cursor: default;
}

.muted {
  color: var(--color-text-muted);
}

.col-status.muted {
  text-align: center;
}

.message-row td {
  background: var(--color-surface);
}

.error {
  color: var(--color-danger);
  font-size: 12px;
  margin: 2px 0;
}

.empty-state {
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-4) !important;
}

.grid-empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-6) 0;
}

.lookup-results {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lookup-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 3px 6px;
  border: 1px solid var(--color-border-soft);
  border-radius: 4px;
  background: var(--color-bg);
  font-size: 12px;
}

/* ============ Visão em grade ============ */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 280px));
  justify-content: start;
  gap: var(--space-5);
}

.variant-card {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 1.5px solid var(--color-border-soft);
  border-radius: var(--radius-lg);
  background: var(--color-surface-solid);
}

.variant-card.inactive {
  opacity: 0.6;
}

.variant-card.add-card {
  border-style: dashed;
  background: var(--color-surface);
}

.card-thumb {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  object-fit: cover;
  flex-shrink: 0;
}

.card-fields {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.card-field-row {
  display: flex;
  gap: var(--space-2);
}

.card-field-row>* {
  flex: 1;
  min-width: 0;
}

.card-field-row>.pages-cell {
  flex: 0 0 auto;
  min-width: 96px;
}

.card-name {
  margin: 0;
  font-weight: var(--weight-medium);
  font-size: var(--text-sm);
}

.card-meta-line {
  margin: 0;
  font-size: var(--text-xs);
  color: var(--color-brown-600);
}

.card-meta-line.muted {
  color: var(--color-text-muted);
  font-style: italic;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-top: var(--space-1);
}

.add-card-cta {
  align-self: flex-start;
  margin-top: var(--space-1);
}
</style>