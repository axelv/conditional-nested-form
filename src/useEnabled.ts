import { useLayoutEffect, useState } from "react";
import { FieldValues, UseFormWatch, WatchObserver } from "react-hook-form";

export type EnabledWhen = (data: Record<string, unknown>) => boolean | null | undefined

export const useEnabled = <TFieldValues extends FieldValues>
    (watch: UseFormWatch<TFieldValues>, enabledWhen: EnabledWhen | null = null, defaultEnabled: boolean = true) => {
    const [enabled, setEnabled] = useState(defaultEnabled);
    useLayoutEffect(() => {
        if (!enabledWhen) return;
        const handler: WatchObserver<TFieldValues> = (data) => {
            const enabled = !!enabledWhen(data);
            setEnabled(enabled);
        }
        const unsubscribe = watch(handler).unsubscribe;
        return () => unsubscribe()
    }, [watch, enabledWhen]);

    return enabled;
}