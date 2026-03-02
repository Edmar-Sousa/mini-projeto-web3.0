import { 
    toValue, 
    ref,
    type Ref, 
    type ComputedRef, 
    type ModelRef
} from 'vue'

import { create } from 'ipfs-http-client'


const ipfsURL = import.meta.env.VITE_IPFS_URL || 'http://127.0.0.1:5001/api/v0'


type UploadFileType = {
    file: File | Ref<File> | ComputedRef<File> | ModelRef<File>,
    onProgress?: (progress: number) => void
}


export function useIPFSUpload() {
    const ipfs = create({ 
        url: ipfsURL 
    });

    // states
    const isUploading = ref(false);
    const isError = ref(false);
    const error = ref<Error | null>(null);
    
    // values
    const cid = ref<string | null>(null);


    const uploadFile = async (options: UploadFileType) => {
        const { 
            file, 
            onProgress 
        } = options;

        const rawFile = toValue(file);

        isUploading.value = true;
        isError.value = false;

        try {
            const added = await ipfs.add(rawFile, {
                progress: (bytes) => {
                    if (onProgress) {
                        onProgress(bytes);
                    }
                },
            });
    
            await ipfs.files.write(`/ipfs/${added.cid.toString()}`, rawFile, { create: true, parents: true });

            cid.value = added.cid.toString();
        }

        catch (err) {
            isError.value = true;
            error.value = err as Error;
        }

        finally {
            isUploading.value = false;
        }

    }

    return {
        // states
        isUploading,
        isError,
        error,

        // values
        cid,
        
        // functions
        uploadFile,
    }
}

