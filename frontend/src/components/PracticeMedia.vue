<script setup lang="ts">
import type { MediaAsset } from '../types/content'
withDefaults(
  defineProps<{ asset: MediaAsset | null; ratio?: number; eager?: boolean; caption?: boolean }>(),
  { ratio: 1.15, eager: false, caption: true },
)
</script>
<template>
  <figure class="practice-media">
    <q-img
      v-if="asset"
      :src="asset.src"
      :srcset="asset.srcset"
      sizes="(max-width: 599px) 100vw, (max-width: 1023px) 80vw, 50vw"
      :alt="asset.alt"
      :ratio="ratio"
      :position="`${asset.focalPoint?.x ?? 50}% ${asset.focalPoint?.y ?? 50}%`"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      no-spinner
      no-transition
    >
      <template #error>
        <div class="absolute-full media-placeholder">
          <q-icon name="image_not_supported" size="40px" />
          <span>Bild derzeit nicht verfügbar</span>
        </div>
      </template>
    </q-img>
    <div
      v-else
      class="media-placeholder portrait-placeholder"
      role="img"
      aria-label="Platzhalter für das spätere Porträt von Dr. Anna Linden"
    >
      <q-icon name="person_outline" size="88px" />
      <span>Dr. Anna Linden</span>
      <small>Porträt wird ergänzt · fiktives Demoprofil</small>
    </div>
    <figcaption v-if="caption && asset?.caption" class="text-caption muted q-mt-sm">
      {{ asset.caption }}
    </figcaption>
  </figure>
</template>
