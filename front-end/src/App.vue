<template>

    <main class="w-screen min-h-screen p-10 flex items-center justify-center flex-col">
        <div class="mx-auto w-full max-w-300 flex flex-col items-center justify-center md:flex-row-reverse">
            <div class="w-full">
                <img 
                    :src="FileImage" 
                    alt="File" 
                    class="mx-auto" />
            </div>
    
            <file-upload v-model="file" />
        </div>

        <div v-if="hasFile">

            <template v-if="!isUploading && !cid">
                <button 
                    @click="handlerUpload"
                    :disabled="isUploading"
                    class="pointer-events-auto bg-[#FFB859] text-black py-3 px-4 text-lg rounded-[10px] shadow-[0_4px_4px_0_rgba(204,117,0,1)]">
                        Fazer Upload
                </button>
            </template>

            <template v-else-if="isUploading">
                <div class="w-full flex items-center justify-center flex-col gap-4">
                    <div class="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#FFB859] animate-spin"></div>
                    <p class="text-center">Enviando arquivo... {{ progress }}%</p>
                </div>
            </template>

            <template v-else-if="error">
                <p class="text-base font-normal text-center text-red-500">
                    Ocorreu um erro ao enviar o arquivo: {{ error.message }}
                </p>
            </template>

            <template v-else-if="cid">
                <p class="text-base font-normal text-center">
                    Arquivo enviado com sucesso! CID: {{ cid }}
                </p>
            </template>
        </div>
    </main>

</template>

<script lang="ts" setup>

import { ref, computed } from 'vue';

import FileImage from './assets/files.png'
import FileUpload from './components/FileUpload.vue';

import { useIPFSUpload } from './composable/useIPFSUpload';


const file = ref<File | null>(null);
const progress = ref(0);

const hasFile = computed(() => file.value !== null);


const {
    cid,
    error,
    isUploading,
    uploadFile,
} = useIPFSUpload();

function handlerUpload() {
    if (!file.value) {
        return;
    }

    uploadFile({
        file: file.value,
        onProgress: (bytes) => progress.value = Math.round(bytes / file.value?.size! * 100),
    });
}

</script>