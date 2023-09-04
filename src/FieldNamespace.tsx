import { ReactNode, createContext } from "react";
import { v4 } from "uuid";

const NAMESPACE = v4();
export const FieldNamespaceContext = createContext(NAMESPACE);


export function FieldNameContextProvider({ name, children }: { name: string, children: ReactNode }) {
    return (
        <FieldNamespaceContext.Provider value={name}>
            {children}
        </FieldNamespaceContext.Provider>
    )
}

