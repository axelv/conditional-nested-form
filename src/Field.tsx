import React from 'react';
import { EnabledWhen, useEnabled } from './useEnabled';
import { FieldValues, UseFormWatch, FieldArrayPath, Control, ArrayPath, FieldArray } from 'react-hook-form';
import useFieldPath from './useFieldPath';
import { FieldArray as RenderFieldArray } from './FieldArray';

export type TField = {
    label: string;
    type?: "text" | "number" | "date" | "select" | "markdown" | "rich-text";
    repeating?: boolean;
    options?: { value: string, text: string }[]
    placeholder?: string;
    defaultValue?: string;
    defaultEnabled?: boolean;
    enabledWhen?: EnabledWhen;
}

type FieldProps<TFieldValues extends FieldValues = FieldValues> = TField & {
    control: Control<TFieldValues>
    watch: UseFormWatch<TFieldValues>
    children: (args: TField & { name: string, enabled: boolean }) => React.ReactNode
}

export default function Field<TFieldValues extends FieldValues = FieldValues>
    ({ children, repeating, watch, control, ...field }: FieldProps<TFieldValues>) {
    const { label, enabledWhen, defaultEnabled } = field;
    const path = useFieldPath(label);
    const enabled = useEnabled(watch, enabledWhen, defaultEnabled);
    if (repeating)
        return (
            <RenderFieldArray name={path as FieldArrayPath<TFieldValues>} control={control}>
                {({ fields, append, remove }) =>
                    <div className='flex items-baseline mt-2'>
                        <label htmlFor={path}>{label}</label>
                        <div className='relative w-full flex flex-col'>
                            {fields.length == 0 && (
                                <div className='relative flex items-baseline'>
                                    {children({ ...field, name: `${path}.0`, enabled })}
                                </div>
                            )}
                            {fields.map(({ id }, index) =>
                                <div key={id} className='w-full flex pr-2'>
                                    {children({ ...field, name: `${path}.${index}`, enabled })}
                                    <button type='button' className='block p-1 border border-gray-200 rounded' onClick={() => remove(index)}>
                                        X
                                    </button>
                                </div>
                            )}
                            <button className="mt-1 ml-2 block border border-gray-200 hover:enabled:bg-gray-50 hover:enabled::border-gray-400 disabled:bg-gray-100 disabled:text-gray-400 p-1 rounded" type="button" onClick={() => append(null as FieldArray<TFieldValues, ArrayPath<TFieldValues>>)}>Add</button>
                        </div>
                    </div >
                }
            </RenderFieldArray>
        )
    return (
        <div className='flex items-baseline mt-2'>
            <label htmlFor={path}>{label}</label>
            {children({ ...field, name: path, enabled })}
        </div>
    )
}