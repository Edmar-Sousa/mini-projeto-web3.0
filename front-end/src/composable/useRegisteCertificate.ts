import { ethers } from 'ethers';
import { ref } from 'vue';

import CertificateContract from '../contracts/CertificateContract.json';


export const StateConnection = {
    NOT_CONNECTED: 'not_connected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error',
} as const;

export type StateConnectionType = (typeof StateConnection)[keyof typeof StateConnection];


const contractAddress = '0x911De7cAD80dA42EF881dd47F902bfEFCCB7580C';

const provider = ref<ethers.BrowserProvider | null>(null);
const signer = ref<ethers.Signer | null>(null);
const contract = ref<ethers.Contract | null>(null);


const connectionState = ref<StateConnectionType>(StateConnection.NOT_CONNECTED);

export const useRegisterCertificate = () => {

    const error = ref<Error | null>(null);

    
    const connectWallet = async () => {
        const ethereum = (window as any).ethereum;

        if (!ethereum) {
            connectionState.value = StateConnection.ERROR;
            error.value = new Error('Ethereum wallet not available');
            return;
        }

        connectionState.value = StateConnection.CONNECTING;

        try {
            await ethereum.request({
                method: 'eth_requestAccounts'
            });

            let brownserProvider = new ethers.BrowserProvider(ethereum);
            let signerInstance = await brownserProvider.getSigner();

            provider.value = brownserProvider;
            signer.value = signerInstance;
    
            contract.value = new ethers.Contract(
                contractAddress,
                CertificateContract.abi,
                signer.value
            );

            connectionState.value = StateConnection.CONNECTED;
        }

        catch (err: any) {
            if (err.code === 4001) {
                connectionState.value = StateConnection.NOT_CONNECTED;
                error.value = new Error('User rejected the connection request');
                return;
            }

            connectionState.value = StateConnection.ERROR;
            error.value = err instanceof Error ? err : new Error('Unknown error');
        }
    }

    return {
        // states
        error,
        connectionState,

        // functions
        connectWallet,
    }
}

