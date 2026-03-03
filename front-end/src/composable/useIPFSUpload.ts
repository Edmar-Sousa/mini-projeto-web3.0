import { 
    toValue, 
    ref,
    type Ref, 
    type ComputedRef, 
    type ModelRef
} from 'vue'

import { create } from 'ipfs-http-client'


const ipfsURL = import.meta.env.VITE_IPFS_URL || 'http://127.0.0.1:5001/api/v0'

export const UploadStatus = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    WRITE_BLOCKCHAIN: 'write_blockchain',
    SUCCESS: 'success',
    ERROR: 'error',
} as const;

export type UploadStatusType = (typeof UploadStatus)[keyof typeof UploadStatus];


type UploadFileType = {
    file: File | Ref<File> | ComputedRef<File> | ModelRef<File>,
    onProgress?: (progress: number) => void
    onFinish?: (cid: string) => void
}


export function useIPFSUpload() {
    const ipfs = create({ 
        url: ipfsURL 
    });

    // states
    const isError = ref(false);
    const error = ref<Error | null>(null);

    const state = ref<UploadStatusType>(UploadStatus.IDLE);
    
    // values
    const cid = ref<string | null>(null);


    const uploadFileToIPFS = async (file: File, onProgress?: (bytes: number) => void) => {
        const added = await ipfs.add(file, {
            progress: (bytes) => {
                if (onProgress) {
                    onProgress(bytes);
                }
            },
        });

        const cid = added.cid.toString();

        await ipfs.files.write(
            `/ipfs/${cid}`, 
            file, 
            { create: true, parents: true }
        );

        return cid;
    }



    const uploadFile = async (options: UploadFileType) => {
        const { 
            file, 
            onProgress,
            onFinish,
        } = options;

        const rawFile = toValue(file);

        state.value = UploadStatus.UPLOADING;

        try {

            const cidValue = await uploadFileToIPFS(
                rawFile, 
                onProgress
            );

            
            cid.value = cidValue;
            state.value = UploadStatus.SUCCESS;
            
            if (onFinish) {
                onFinish(cidValue);
            }
        }

        catch (err) {
            state.value = UploadStatus.ERROR;
            error.value = err as Error;
        }

    }

    return {
        // states
        isError,
        error,

        // values
        cid,
        state,
        
        // functions
        uploadFile,
    }
}

