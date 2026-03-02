<template>

    <div class="w-full max-w-115">
        <input type="file" id="file-upload" class="hidden" @change="handleSelectedFile" />
        
        <label for="file-upload" class="flex items-center flex-col justify-center w-full p-10 border border-dashed rounded-[10px] cursor-pointer">
            <div class="mb-10 w-full flex flex-col items-center justify-center">
                <img 
                    :src="UploadIcon" 
                    alt="Upload"
                    class="mb-4" />
    
                <p v-if="!hasFile" class="text-base font-normal text-center">
                    Clique para selecionar um arquivo!
                </p>

                <div v-else="hasFile" class="mt-10">
                    <h4 class="text-sm font-medium mb-2">
                        Arquivo selecionado:
                    </h4>

                    <p class="text-sm text-gray-500">
                        <b>Nome:</b> {{ model?.name }}
                    </p>

                    <p class="text-sm text-gray-500">
                        <b>Tamanho:</b> {{ fileSizeInMB }} MB
                    </p>
                </div>
            </div>

            <button class="pointer-events-none bg-[#FFB859] text-black py-3 px-4 text-lg rounded-[10px] shadow-[0_4px_4px_0_rgba(204,117,0,1)]">
                Procurar
            </button>
        </label>
    </div>

</template>

<script lang="ts" setup>

import { computed } from 'vue';

import UploadIcon from '../assets/upload.png';

const model = defineModel<File | null>({
    default: null,
});

const hasFile = computed(() => model.value !== null);
const fileSizeInMB = computed(() => {
    if (!model.value) {
        return 0;
    }

    return (model.value.size / Math.pow(1024, 2)).toFixed(2);
});

function handleSelectedFile(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;

    if (!file) {
        return;
    }

    model.value = file;
}


</script>