<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleDismiss" :breakpoints="[0, 1]" :initial-breakpoint="1">
    <ion-header>
      <ion-toolbar :style="noteColorStyle">
        <ion-buttons slot="start">
          <button class="btn-icon-head" title="Tutup" @click="handleDismiss">
            <ion-icon :icon="closeOutline" />
          </button>
        </ion-buttons>

        <ion-title style="font-size:1.1rem;font-weight:700;">
          {{ noteId ? 'Edit Catatan' : 'Catatan Baru' }}
        </ion-title>

        <ion-buttons slot="end">
          <div class="d-flex align-items-center gap-1 me-2">
            <button
              class="btn-icon-head"
              :class="{ active: form.isPinned }"
              :title="form.isPinned ? 'Lepas Sematan' : 'Sematkan'"
              @click="form.isPinned = !form.isPinned"
            >
              <ion-icon :icon="form.isPinned ? pin : pinOutline" />
            </button>

            <button
              class="btn-icon-head"
              :title="form.type === 'text' ? 'Ubah ke Checklist' : 'Ubah ke Teks'"
              @click="toggleType"
            >
              <ion-icon :icon="form.type === 'text' ? checkboxOutline : documentTextOutline" />
            </button>
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="modal-content" :style="noteColorStyle">
      <div
        class="form-container p-3 max-w-700 mx-auto"
        :style="{ backgroundColor: noteColorHex, minHeight: '100%' }"
      >
        <!-- Judul Input -->
        <input
          type="text"
          v-model="form.title"
          class="editor-title-input"
          placeholder="Judul catatan..."
          :style="{ fontFamily: getCssFont(form.fontFamily), fontSize: getCssSize(form.fontSize) }"
        />

        <!-- Mode Teks -->
        <div v-if="form.type === 'text'" class="editor-text-body mt-3">
          <div class="format-toolbar mb-2">
            <div class="d-flex align-items-center gap-1 flex-wrap">
              <button type="button" class="fmt-btn" title="Tebal (Bold)" @click="insertTextFormat('**', '**')"><b>B</b></button>
              <button type="button" class="fmt-btn" title="Miring (Italic)" @click="insertTextFormat('*', '*')"><i>I</i></button>
              <button type="button" class="fmt-btn" title="Garis Bawah" @click="insertTextFormat('<u>', '</u>')"><u>U</u></button>
              <button type="button" class="fmt-btn" title="Daftar Bullet" @click="insertTextFormat('• ', '')">• List</button>
            </div>
          </div>

          <textarea
            ref="editorTextarea"
            v-model="form.content"
            class="editor-textarea"
            placeholder="Ketik catatan di sini..."
            rows="10"
            :style="{ fontFamily: getCssFont(form.fontFamily), fontSize: getCssSize(form.fontSize) }"
          ></textarea>
        </div>

        <!-- Mode Checklist -->
        <div v-else class="editor-checklist-body mt-3">
          <div class="checklist-items-list">
            <div
              v-for="(item, idx) in form.checklist"
              :key="item.id || idx"
              class="editor-checklist-row mb-2"
            >
              <button type="button" class="btn-chk-box" @click="item.completed = !item.completed">
                <ion-icon :icon="item.completed ? checkmarkDoneCircle : ellipseOutline" :class="item.completed ? 'text-success' : 'text-muted'" />
              </button>
              <input
                type="text"
                v-model="item.text"
                class="checklist-item-input"
                :class="{ completed: item.completed }"
                placeholder="Item daftar..."
                :style="{ fontFamily: getCssFont(form.fontFamily) }"
                @keydown.enter.prevent="addChecklistItemAfter(idx)"
              />
              <button type="button" class="btn-chk-remove" @click="removeChecklistItem(idx)">
                <ion-icon :icon="closeOutline" />
              </button>
            </div>
          </div>

          <button type="button" class="btn-add-item mt-2" @click="addChecklistItem">
            <ion-icon :icon="addOutline" class="me-1" /> Tambah Item Baru
          </button>
        </div>

        <!-- Label Section -->
        <div class="editor-labels-section mt-4">
          <label class="form-label text-xs fw-bold text-muted mb-1">LABEL CATATAN</label>
          <div class="d-flex flex-wrap gap-1 align-items-center">
            <span v-for="lbl in form.labels" :key="lbl" class="note-label-chip editable">
              {{ lbl }}
              <ion-icon :icon="closeCircleOutline" class="ms-1 cursor-pointer" @click="removeLabel(lbl)" />
            </span>

            <button type="button" class="btn-add-label-tag" @click="showLabelDropdown = !showLabelDropdown">
              <ion-icon :icon="pricetagOutline" class="me-1" /> + Label
            </button>
          </div>

          <div v-if="showLabelDropdown" class="label-popover-menu mt-2">
            <div class="p-2 border-bottom">
              <input
                type="text"
                v-model="newLabelInput"
                class="form-control form-control-sm"
                placeholder="Buat label baru..."
                @keydown.enter.prevent="createNewLabel"
              />
            </div>
            <div class="label-popover-list p-2">
              <label v-for="l in availableLabels" :key="l.id" class="label-checkbox-item">
                <input type="checkbox" :value="l.name" v-model="form.labels" />
                <span>{{ l.name }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Styling Controls -->
        <div class="editor-styling-section mt-4 pt-3 border-top">
          <div class="row g-3">
            <!-- Inline Font Style & Font Size -->
            <div class="col-12">
              <div class="row g-2 align-items-end">
                <div class="col-7 col-sm-8">
                  <label class="form-label text-xs fw-bold text-muted mb-1">GAYA FONT</label>
                  <select 
                    v-model="form.fontFamily" 
                    class="form-select form-select-sm dynamic-control font-style-select"
                    :style="{ fontFamily: getCssFont(form.fontFamily) }"
                  >
                    <option v-for="f in FONT_FAMILIES" :key="f.id" :value="f.id" :style="{ fontFamily: f.cssFont }">
                      {{ f.label }}
                    </option>
                  </select>
                </div>

                <div class="col-5 col-sm-4">
                  <label class="form-label text-xs fw-bold text-muted mb-1">UKURAN FONT</label>
                  <button
                    type="button"
                    class="btn-size-cycle dynamic-control"
                    @click="cycleFontSize"
                    title="Klik untuk mengubah ukuran font"
                  >
                    <span class="text-truncate">{{ currentFontSizeLabel }}</span>
                    <ion-icon :icon="textOutline" class="ms-1 flex-shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Note Colors -->
            <div class="col-12">
              <label class="form-label text-xs fw-bold text-muted mb-1">WARNA CATATAN</label>
              <div class="color-swatches-grid">
                <button
                  v-for="c in NOTE_COLORS"
                  :key="c.name"
                  type="button"
                  class="swatch-btn"
                  :class="{ active: form.color === c.name }"
                  :style="{ backgroundColor: c.hex, borderColor: c.border }"
                  :title="c.label"
                  @click="form.color = c.name"
                >
                  <ion-icon v-if="form.color === c.name" :icon="checkmarkOutline" style="color:#000;" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer :style="noteColorStyle">
      <div class="p-3 d-flex align-items-center justify-content-between max-w-700 mx-auto">
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-action light btn-md" @click="handleDismiss">Batal</button>
          <button v-if="noteId" type="button" class="btn btn-action light text-danger btn-md" @click="handleDelete">Hapus</button>
        </div>
        <button type="button" class="btn btn-action primary btn-md px-4" @click="handleSave">Simpan</button>
      </div>
    </ion-footer>

    <AppToast :is-open="toast.show" :message="toast.text" :color="toast.color" @dismiss="toast.show = false" />
  </ion-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  IonModal, IonContent, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonIcon, IonFooter
} from '@ionic/vue'
import {
  closeOutline, pin, pinOutline, checkboxOutline, documentTextOutline,
  checkmarkDoneCircle, ellipseOutline, closeCircleOutline,
  pricetagOutline, checkmarkOutline, addOutline, textOutline
} from 'ionicons/icons'

import {
  NoteRepository, NOTE_COLORS, FONT_FAMILIES, FONT_SIZES,
  type NoteItem, type NoteLabel, type ChecklistItem
} from '@/db/noteRepository'
import AppToast from '@/components/AppToast.vue'

// ── Color helper ─────────────────────────────────────────────────────────────
const noteColorHex = computed(() => {
  const c = NOTE_COLORS.find(x => x.name === form.value.color)
  return c ? c.hex : '#ffffff'
})

const noteColorStyle = computed(() => ({
  '--background': noteColorHex.value,
  '--ion-toolbar-background': noteColorHex.value,
  'background-color': noteColorHex.value,
}))

// ── Props & Emits ───────────────────────────────────────────────────────────
const props = defineProps<{
  isOpen: boolean
  noteId?: number | null
  initialType?: 'text' | 'checklist'
  availableLabels: NoteLabel[]
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'saved'): void
  (e: 'deleted'): void
}>()

// ── State ───────────────────────────────────────────────────────────────────
const showLabelDropdown = ref(false)
const newLabelInput = ref('')
const editorTextarea = ref<HTMLTextAreaElement | null>(null)
const toast = ref({ show: false, text: '', color: 'success' })

const defaultForm = (): Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'> => ({
  title: '',
  content: '',
  type: props.initialType || 'text',
  checklist: [{ id: Date.now().toString(), text: '', completed: false }],
  color: 'default',
  fontFamily: 'sans',
  fontSize: 'md',
  isPinned: false,
  isArchived: false,
  isTrashed: false,
  labels: []
})

const form = ref(defaultForm())

// ── Watch: load note data when modal opens ──────────────────────────────────
watch(() => props.isOpen, async (opened) => {
  if (!opened) return
  showLabelDropdown.value = false
  newLabelInput.value = ''

  if (props.noteId) {
    const existing = await NoteRepository.getById(props.noteId)
    if (existing) {
      form.value = {
        title: existing.title || '',
        content: existing.content || '',
        type: existing.type || 'text',
        checklist: existing.checklist ? JSON.parse(JSON.stringify(existing.checklist)) : [],
        color: existing.color || 'default',
        fontFamily: existing.fontFamily || 'sans',
        fontSize: existing.fontSize || 'md',
        isPinned: existing.isPinned || false,
        isArchived: existing.isArchived || false,
        isTrashed: existing.isTrashed || false,
        labels: [...(existing.labels || [])],
      }
      return
    }
  }

  // New note
  form.value = defaultForm()
  if (props.initialType) form.value.type = props.initialType
}, { immediate: false })

// ── Helpers ─────────────────────────────────────────────────────────────────
function getCssFont(fontId?: string) {
  const item = FONT_FAMILIES.find(f => f.id === fontId)
  return item ? item.cssFont : FONT_FAMILIES[0].cssFont
}

function getCssSize(sizeId?: string) {
  const item = FONT_SIZES.find(s => s.id === sizeId)
  return item ? item.cssSize : '1rem'
}

function cycleFontSize() {
  const currentIndex = FONT_SIZES.findIndex(s => s.id === form.value.fontSize)
  const nextIndex = (currentIndex + 1) % FONT_SIZES.length
  form.value.fontSize = FONT_SIZES[nextIndex].id as 'sm' | 'md' | 'lg' | 'xl'
}

const currentFontSizeLabel = computed(() => {
  const item = FONT_SIZES.find(s => s.id === form.value.fontSize)
  return item ? item.label : 'Normal'
})

function handleDismiss() {
  emit('dismiss')
}

function toggleType() {
  if (form.value.type === 'text') {
    const lines = form.value.content.split('\n').filter(l => l.trim())
    form.value.checklist = lines.length > 0
      ? lines.map((l, i) => ({ id: `${Date.now()}_${i}`, text: l.replace(/^[•\-\*]\s*/, ''), completed: false }))
      : [{ id: Date.now().toString(), text: '', completed: false }]
    form.value.type = 'checklist'
  } else {
    const textLines = form.value.checklist
      ?.filter(item => item.text.trim())
      ?.map(item => `${item.completed ? '[x]' : '[ ]'} ${item.text}`) || []
    form.value.content = textLines.join('\n')
    form.value.type = 'text'
  }
}

function addChecklistItem() {
  if (!form.value.checklist) form.value.checklist = []
  form.value.checklist.push({ id: Date.now().toString(), text: '', completed: false })
}

function addChecklistItemAfter(idx: number) {
  if (!form.value.checklist) form.value.checklist = []
  form.value.checklist.splice(idx + 1, 0, { id: Date.now().toString(), text: '', completed: false })
}

function removeChecklistItem(idx: number) {
  if (form.value.checklist) form.value.checklist.splice(idx, 1)
}

function insertTextFormat(prefix: string, suffix: string) {
  if (!editorTextarea.value) return
  const ta = editorTextarea.value
  const start = ta.selectionStart || 0
  const end = ta.selectionEnd || 0
  const val = form.value.content
  const selected = val.substring(start, end)
  form.value.content = val.substring(0, start) + prefix + selected + suffix + val.substring(end)
}

function removeLabel(lbl: string) {
  const idx = form.value.labels.indexOf(lbl)
  if (idx >= 0) form.value.labels.splice(idx, 1)
}

async function createNewLabel() {
  if (!newLabelInput.value.trim()) return
  const created = await NoteRepository.addLabel(newLabelInput.value.trim())
  if (!form.value.labels.includes(created.name)) form.value.labels.push(created.name)
  newLabelInput.value = ''
  toast.value = { show: true, text: `Label "${created.name}" dibuat`, color: 'success' }
  emit('saved') // refresh label list on parent
}

async function handleSave() {
  const isEmpty = !form.value.title.trim()
    && !form.value.content.trim()
    && (!form.value.checklist || form.value.checklist.every(i => !i.text.trim()))

  if (isEmpty) {
    toast.value = { show: true, text: 'Catatan tidak boleh kosong', color: 'warning' }
    return
  }

  const payload = JSON.parse(JSON.stringify(form.value))
  if (payload.type === 'checklist') {
    payload.checklist = payload.checklist.filter((i: ChecklistItem) => i.text.trim())
  }

  try {
    if (props.noteId) {
      await NoteRepository.update(props.noteId, payload)
    } else {
      await NoteRepository.add(payload)
    }
    toast.value = { show: true, text: 'Catatan disimpan ✓', color: 'success' }
    setTimeout(() => {
      emit('saved')
      emit('dismiss')
    }, 350)
  } catch (err: any) {
    toast.value = { show: true, text: `Gagal menyimpan: ${err?.message || err}`, color: 'error' }
  }
}

async function handleDelete() {
  if (!props.noteId) return
  await NoteRepository.delete(props.noteId)
  toast.value = { show: true, text: 'Catatan dipindahkan ke sampah', color: 'success' }
  setTimeout(() => {
    emit('deleted')
    emit('dismiss')
  }, 350)
}
</script>

<style scoped>
.max-w-700 { max-width: 720px; }

.btn-icon-head {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.06);
  color: inherit;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  cursor: pointer;
}

.btn-icon-head.active {
  color: #eab308;
  background: #fef9c3;
}

.editor-title-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-weight: 800;
  font-size: 1.25rem;
  padding: 6px 0;
}

.editor-textarea {
  width: 100%;
  min-height: 200px;
  border: none;
  background: transparent;
  outline: none;
  resize: vertical;
  line-height: 1.6;
}

.format-toolbar {
  padding: 4px 8px;
  border-radius: 12px;
  background: rgba(0,0,0,0.05);
}

.fmt-btn {
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  background: #ffffff;
  font-size: 0.78rem;
  cursor: pointer;
}

.editor-checklist-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-chk-box {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.checklist-item-input {
  flex: 1;
  border: none;
  border-bottom: 1.5px dashed rgba(0,0,0,0.15);
  background: transparent;
  outline: none;
  padding: 4px 0;
  font-size: 0.95rem;
}

.checklist-item-input.completed {
  text-decoration: line-through;
  opacity: 0.6;
}

.btn-chk-remove {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.1rem;
  cursor: pointer;
  flex-shrink: 0;
}
.btn-chk-remove:hover { color: #ef4444; }

.btn-add-item {
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
}

.btn-add-label-tag {
  border: 1px dashed rgba(0,0,0,0.2);
  background: transparent;
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.label-popover-menu {
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.12);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  max-width: 280px;
}

.label-checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  padding: 4px 0;
  cursor: pointer;
}

.btn-size-cycle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px !important;
  cursor: pointer;
  font-weight: 600;
}

select.font-style-select {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 10px !important;
  padding-right: 26px !important;
  line-height: 32px !important;
}

.dynamic-control {
  height: 34px !important;
  min-height: 34px !important;
  border-radius: 10px !important;
  font-size: 0.8rem !important;
  background-color: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  color: #0f172a !important;
  transition: all 0.2s ease;
}

.dynamic-control:hover, .dynamic-control:focus {
  background-color: rgba(255, 255, 255, 0.92) !important;
  border-color: rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .dynamic-control {
  background-color: rgba(15, 23, 42, 0.65) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #f8fafc !important;
}
[data-theme="dark"] .dynamic-control:hover, [data-theme="dark"] .dynamic-control:focus {
  background-color: rgba(15, 23, 42, 0.85) !important;
}

.color-swatches-grid { display: flex; gap: 8px; flex-wrap: wrap; }

.swatch-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.15s;
}
.swatch-btn:hover, .swatch-btn.active { transform: scale(1.15); }

.note-label-chip {
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(0,0,0,0.06);
  color: #475569;
  font-size: 0.72rem;
  font-weight: 600;
}
.note-label-chip.editable {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
}

</style>
